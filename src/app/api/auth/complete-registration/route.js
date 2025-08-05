import dbConnect from '../../../connection/dbConnect';
import { NextResponse } from 'next/server';
import UserService from '../../../lib/services/userService.js';
import { Token } from '../../../middleware/generateToken.js';
import mongoose from 'mongoose';
import initRedis from '../../../config/redis.js';
import bcrypt from 'bcryptjs';
import roleSchema from '../../../lib/models/role.js';

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
    const { name, email, password } = body;

    // Get sessionId from cookies
    const sessionId = request.cookies.get('sessionId')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ 
        success: false, 
        message: "Session expired. Please verify OTP again." 
      }, { status: 400 });
    }

    if (!name || !email || !password) {
      return NextResponse.json({ 
        success: false, 
        message: "Name, email, and password are required" 
      }, { status: 400 });
    }

    try {
      const redis = initRedis();
      
      // Get phone number from session
      const phone = await redis.get(`session:${sessionId}`);
      if (!phone) {
        return NextResponse.json({ 
          success: false, 
          message: "Session expired. Please verify OTP again." 
        }, { status: 400 });
      }

      // Check if user already exists with this email
      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        return NextResponse.json({ 
          success: false, 
          message: "User with this email already exists" 
        }, { status: 400 });
      }

      // Check if user already exists with this phone
      const existingPhoneUser = await userService.findByPhone(phone);
      if (existingPhoneUser) {
        return NextResponse.json({ 
          success: false, 
          message: "User with this phone number already exists" 
        }, { status: 400 });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Get default customer role
      const RoleModel = conn.models.Role || conn.model('Role', roleSchema);
      const customerRole = await RoleModel.findOne({ name: 'Customer' });
      
      let finalTenant = null;
      let finalRole = null;

      if (customerRole) {
        finalRole = customerRole._id;
        if (customerRole.scope === 'tenant') {
          finalTenant = customerRole.tenantId || null;
        }
      }

      // Create user
      const user = await userService.createUser({
        name,
        email,
        phone,
        passwordHash,
        role: finalRole,
        tenant: finalTenant,
        isVerified: true, // Already verified via OTP
        isActive: true,
        isDeleted: false
      });

      // Generate tokens
      const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } = Token.generateTokens(user);
      
      // Store tokens in Redis
      await redis.setex(`accessToken:${accessToken}`, Math.floor((accessTokenExp - Date.now()) / 1000), "valid");
      await redis.setex(`refreshToken:${refreshToken}`, Math.floor((refreshTokenExp - Date.now()) / 1000), user._id.toString());
      
      // Delete session
      await redis.del(`session:${sessionId}`);

      // Return user info (without password) and tokens
      const userObj = user.toObject();
      delete userObj.passwordHash;

      const response = NextResponse.json({
        success: true,
        message: "Registration successful",
        data: {
          user: userObj,
          tokens: { accessToken, refreshToken }
        }
      }, { status: 201 });

      // Set cookies and remove session cookie
      Token.setTokensCookies(response, accessToken, refreshToken, accessTokenExp, refreshTokenExp);
      response.cookies.set("sessionId", "", { maxAge: 0 }); // Clear session cookie

      return response;

    } catch (redisError) {
      console.error('Redis error:', redisError);
      return NextResponse.json({
        success: false,
        message: "Failed to complete registration",
        error: redisError.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('POST /auth/complete-registration error:', error);
    return NextResponse.json({
      success: false,
      message: "Registration failed",
      error: error.message
    }, { status: 500 });
  }
}
