import TenantService from '../services/tenantService.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const tenantService = new TenantService(); // Import the schema only, not model

export async function createTenant(data) {
  if (!data.email) {
    return {
      status: 400,
      body: { success: false, message: 'Email is required' },
    };
  }

  const password = data.password || `${data.companyName || 'name'}@112`;

  try {
    // 1. Create tenant (and global DB entry)
    const tenantResult = await tenantService.createTenant({
      ...data,
      email: data.email,
    });

    console.log('Tenant creation result:', tenantResult);

    if (!tenantResult || !tenantResult.body?.data?.dbUri) {
      return {
        status: 400,
        body: { success: false, message: 'Tenant creation failed' },
      };
    }

    // 2. Connect to tenant DB dynamically
    const tenantDbUri = tenantResult.body.data.dbUri;
    const tenantConnection = await mongoose.createConnection(tenantDbUri, {

    });

    // 3. Register the User model on tenant DB
    const TenantUser = tenantConnection.model('User', User.schema);

    // 4. Create password hash and save user in tenant DB
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new TenantUser({
      name: data.companyName || data.email,
      email: data.email,
      passwordHash,
      role: new mongoose.Types.ObjectId('687f94a6eb27eefa96f469e4'), // hardcoded role
      tenant: tenantResult.body.data._id,
      isSuperAdmin: false,
      isActive: true,
      isDeleted: false,
    });

    await user.save();

    return {
      status: tenantResult.status || 201,
      body: {
        success: true,
        tenant: tenantResult,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenant: user.tenant,
        },
        password,
      },
    };
  } catch (err) {
    console.error('Error creating tenant:', err?.message);
    return {
      status: 500,
      body: { success: false, message: 'Server error' },
    };
  }
}


export async function getAllTenants(query) {
  try {
    const result = await tenantService.getAllTenants(query);
    return {
      status: result.status || 200,
      body: result,
    };
  } catch (err) {
    return {
      status: 500,
      body: { success: false, message: 'Server error' },
    };
  }
}

export async function getTenantById(id) {
  try {
    const result = await tenantService.getTenantById(id);
    return {
      status: result.status || (result ? 200 : 404),
      body: result,
    };
  } catch (err) {
    return {
      status: 500,
      body: { success: false, message: 'Server error' },
    };
  }
}

export async function updateTenant(id, data) {
  try {
    const result = await tenantService.updateTenant(id, data);
    return {
      status: result.status || 200,
      body: result,
    };
  } catch (err) {
    return {
      status: 500,
      body: { success: false, message: 'Server error' },
    };
  }
}

export async function deleteTenant(id) {
  try {
    const result = await tenantService.deleteTenant(id);
    return {
      status: result.status || 200,
      body: result,
    };
  } catch (err) {
    return {
      status: 500,
      body: { success: false, message: 'Server error' },
    };
  }
}

