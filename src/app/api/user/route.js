import dbConnect from '../../connection/dbConnect';
import { NextResponse } from 'next/server';
import UserService from '../../lib/services/userService.js';
import { Token } from '../../middleware/generateToken.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

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
    const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', new mongoose.Schema({
      name: String,
      dbUri: String,
      subdomain: String
    }, { collection: 'tenants' }));
    const tenant = await Tenant.findOne({ subdomain });
    if (!tenant?.dbUri) return null;
    // Connect to tenant DB
    return await dbConnect(tenant.dbUri);
  }
}

// Register (Create User)
export async function POST(request) {
  try {
    const subdomain = getSubdomain(request);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    const userService = new UserService(conn);

    const body = await request.json();
    const { name, email, password, role, tenant, isSuperAdmin, isActive, isDeleted } = body;

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: 'Name, email, and password are required.' }, { status: 400 });
    }

    // Check if user exists
    const existing = await userService.findByEmail(email);
    if (existing) {
      return NextResponse.json({ success: false, message: 'Email already registered.' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await userService.createUser({
      name,
      email,
      passwordHash,
      role: role || null,
      tenant: tenant || null,
      isSuperAdmin: !!isSuperAdmin,
      isActive: isActive !== undefined ? !!isActive : true,
      isDeleted: isDeleted !== undefined ? !!isDeleted : false
    });

    // Generate tokens
    const tokens = Token.generateTokens(user);

    // Return user info (without password) and tokens
    const userObj = user.toObject();
    delete userObj.passwordHash;

    return NextResponse.json(
      { success: true, user: userObj, ...tokens },
      { status: 201 }
    );
  } catch (err) {
    console.error('POST /user error:', err?.message);
    return NextResponse.json({ success: false, message: err?.message || "Something went wrong" }, { status: 400 });
  }
}

// Login
export async function PATCH(request) {
  try {
    const subdomain = getSubdomain(request);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    const userService = new UserService(conn);

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required.' }, { status: 400 });
    }

    const user = await userService.findByEmail(email);
    if (!user || user.isDeleted) {
      return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 401 });
    }

    // Generate tokens
    const tokens = Token.generateTokens(user);

    // Return user info (without password) and tokens
    const userObj = user.toObject();
    delete userObj.passwordHash;

    return NextResponse.json(
      { success: true, user: userObj, ...tokens },
      { status: 200 }
    );
  } catch (err) {
    console.error('PATCH /user login error:', err);
    return NextResponse.json({ success: false, message: 'Login failed' }, { status: 400 });
  }
}

export async function GET(request) {
  try {
    const subdomain = getSubdomain(request);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    const userService = new UserService(conn);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      const result = await userService.getUserById(id);
    
      return NextResponse.json(result, { status: result.status });
    } else {
      const query = Object.fromEntries(searchParams.entries());
      const result = await userService.getAllUsers(query);
      console.log('GET /user result:', result);
      
      // If result is an array of documents, map to plain objects
      const serializableResult = Array.isArray(result.body)
        ? result.body.map(user => (user && typeof user.toObject === 'function' ? user.toObject() : user))
        : result.body;
      return NextResponse.json(serializableResult, { status: result.status });
    }
  } catch (err) {
    console.error('GET /user error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const subdomain = getSubdomain(request);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    const userService = new UserService(conn);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const result = await updateUser(id, body);
    return NextResponse.json(result.body, { status: result.status });
  } catch (err) {
    console.error('PUT /user error:', err);
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const subdomain = getSubdomain(request);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    const userService = new UserService(conn);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const result = await deleteUser(id);
    return NextResponse.json(result.body, { status: result.status });
  } catch (err) {
    console.error('DELETE /user error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
