import dbConnect from '../../../connection/dbConnect';
import { NextResponse } from 'next/server';
import UserService from '../../../lib/services/userService.js';
import { Token } from '../../../middleware/generateToken.js';
import mongoose from 'mongoose';
import initRedis from '../../../config/redis.js';

// Helper to extract subdomain from x-tenant header or host header
function getSubdomain(request) {
  // Prefer x-tenant header if present
  const xTenant = request.headers.get('x-tenant');
  if (xTenant) return xTenant;
  const host = request.headers.get('host') || '';
  // e.g. tenant1.localhost:5173 or tenant1.example.com
  const parts = host.split('.');
  if (parts.length > 2) return parts[0];
  if (parts.length === 2 && parts[0] !== 'localhost') return parts[0];
  return null;
}

// Helper to get DB connection based on subdomain
async function getDbConnection(subdomain) {
  if (!subdomain || subdomain === 'localhost') {
    // Use default DB (from env)
    return await dbConnect();
  } else {
    // Connect to global DB to get tenant DB URI
    await dbConnect();
    
    // Define tenant schema properly
    const tenantSchema = new mongoose.Schema({
      name: String,
      dbUri: String,
      subdomain: String
    }, { collection: 'tenants' });
    
    const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', tenantSchema);
    const tenant = await Tenant.findOne({ subdomain });
    if (!tenant?.dbUri) return null;
    // Connect to tenant DB
    return await dbConnect(tenant.dbUri);
  }
}

export async function POST(request) {
  try {
    const subdomain = getSubdomain(request);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    
    const userService = new UserService(conn);
    const body = await request.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json({ success: false, message: "Phone & OTP required" }, { status: 400 });
    }

    try {
      const redis = initRedis();
      const storedOtp = await redis.get(`otp:${phone}`);

      if (!storedOtp || storedOtp !== otp) {
        return NextResponse.json({ success: false, message: "Invalid or expired OTP" }, { status: 400 });
      }

      // Delete the OTP after successful verification
      await redis.del(`otp:${phone}`);

      let user = await userService.getUserByPhone(phone);

      // If user exists → mark as verified if not already and log them in
      if (user) {
        if (!user.isVerified) {
          user = await userService.updateUserById(user._id, { isVerified: true });
        }

        const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } = Token.generateTokens(user);
        
        // Store tokens in Redis
        await redis.setex(`accessToken:${accessToken}`, Math.floor((accessTokenExp - Date.now()) / 1000), "valid");
        await redis.setex(`refreshToken:${refreshToken}`, Math.floor((refreshTokenExp - Date.now()) / 1000), user._id.toString());
        
        // Create response with cookies
        const response = NextResponse.json({
          success: true,
          message: "Login successful",
          data: {
            user: {
              _id: user._id,
              name: user.name,
              phone: user.phone,
              email: user.email,
              isVerified: true
            },
            tokens: { accessToken, refreshToken }
          }
        }, { status: 200 });

        // Set cookies
        Token.setTokensCookies(response, accessToken, refreshToken, accessTokenExp, refreshTokenExp);
        
        return response;
      }

      // If user is new → create session to complete registration
      const sessionId = `sess:${Date.now()}:${Math.random().toString(36).substring(2)}`;
      await redis.setex(`session:${sessionId}`, 600, phone); // 10 minutes

      const response = NextResponse.json({
        success: true,
        message: "OTP verified, complete registration",
        data: { phone }
      }, { status: 206 });

      // Set session cookie
      response.cookies.set("sessionId", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "lax",
        maxAge: 10 * 60 * 1000 // 10 minutes
      });

      return response;

    } catch (redisError) {
      console.error('Redis error:', redisError);
      return NextResponse.json({
        success: false,
        message: "Failed to verify OTP",
        error: redisError.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('POST /auth/verify-otp error:', error);
    return NextResponse.json({
      success: false,
      message: "Failed to verify OTP",
      error: error.message
    }, { status: 500 });
  }
}
