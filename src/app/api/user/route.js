import dbConnect from '../../connection/dbConnect';
import { NextResponse } from 'next/server';
import UserService from '../../lib/services/userService.js';
import { Token } from '../../middleware/generateToken.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import roleSchema from '@/app/lib/models/role';

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
    // Use static URI for all subdomains except localhost/null
    const staticUri = 'mongodb+srv://anshul:anshul149@clusterdatabase.24furrx.mongodb.net/tenant_bharat?retryWrites=true&w=majority';
    return await dbConnect(staticUri);

    // If you want to keep the tenant lookup logic for future use, comment out below:
    /*
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
    */
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

    const RoleModel = conn.models.Role || conn.model('Role', roleSchema);
    let finalTenant = tenant || null;
    let finalRole = role || null;
   
    // Validate role and tenant IDs if provided
    if (role) {
      if (!mongoose.Types.ObjectId.isValid(role)) {
        return NextResponse.json({ success: false, message: 'Invalid role ID.' }, { status: 400 });
      }
      // Fetch the role document
      const roleDoc = await RoleModel.findById(role);
      if (!roleDoc) {
        return NextResponse.json({ success: false, message: 'Role not found.' }, { status: 400 });
      }
      console.log("Role document:", roleDoc);
      if (roleDoc.name == 'Customer') {
        finalTenant = roleDoc.tenantId || null;
      }
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
      role: finalRole,
      tenant: finalTenant,
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
    console.log('PATCH /user login subdomain:', subdomain);
    console.log('PATCH /user login conn:', conn ? 'connected' : 'not connected');

    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    const userService = new UserService(conn);

    const body = await request.json();
    const { email, password, phone } = body;

    // Support both email/password and phone-based login
    if (phone) {
      // Phone-based login - should use OTP flow instead
      return NextResponse.json({ 
        success: false, 
        message: 'Phone login requires OTP verification. Use /auth/request-otp endpoint.' 
      }, { status: 400 });
    }

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
    console.error('PATCH /user login error:', err?.message);
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
      // Get user by ID
      const user = await userService.getUserById(id);
      if (!user) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
      }
      const userObj = user.toObject();
      delete userObj.passwordHash;
      return NextResponse.json({ success: true, user: userObj }, { status: 200 });
    } else {
      // Get users with filters
      const query = {};
      for (const [key, value] of searchParams.entries()) {
        query[key] = value;
      }

      const { users, total, page, limit } = await userService.getAllUsers(query);

      const sanitizedUsers = users.map(u => {
        const userObj = u.toObject();
        delete userObj.passwordHash;
        return userObj;
      });

      return NextResponse.json({
        success: true,
        users: sanitizedUsers,
        total,
        page,
        limit,
      }, { status: 200 });
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
    console.log('PUT /user subdomain:', subdomain);
    console.log('PUT /user db connection:', conn ? 'connected' : 'not connected');

    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }

    const userService = new UserService(conn);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    console.log('PUT /user id:', id);

    const body = await request.json();
    console.log('PUT /user update body:', body);

    const result = await userService.updateUser(id, body);

    if (!result) {
      return NextResponse.json({ success: false, message: 'User not found or deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result }, { status: 200 });

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
    const result = await userService.deleteUser(id);
    console.log('DELETE /user result here conoling:', result);
    if (!result) {
      return NextResponse.json({ success: false, message: 'User not found or could not be deleted' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'User deleted successfully',result }, { status: 200 });
  } catch (err) {
    console.error('DELETE /user error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
