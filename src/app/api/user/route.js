import dbConnect from '../../connection/dbConnect';
import { NextResponse } from 'next/server';
import UserService from '../../lib/controllers/userController.js';
import { Token } from '../../middleware/generateToken.js';
import bcrypt from 'bcryptjs';

const userService = new UserService();

// Register (Create User)
export async function POST(request) {
  try {
    await dbConnect();
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
    await dbConnect();
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
    await dbConnect();
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
    await dbConnect();
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
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const result = await deleteUser(id);
    return NextResponse.json(result.body, { status: result.status });
  } catch (err) {
    console.error('DELETE /user error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
