import TenantService from '../services/tenantService.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const tenantService = new TenantService();

export async function createTenant(data) {
  // Ensure email is provided
  if (!data.email) {
    return {
      status: 400,
      body: { success: false, message: 'Email is required' },
    };
  }
  // Use provided password or default to `${companyName}@112`
  const password = data.password || `${data.companyName || 'name'}@112`;
  try {
    // 1. Create tenant
    const tenantResult = await tenantService.createTenant({
      ...data,
      email: data.email
      });
console.log('Tenant creation result:', tenantResult);
    // If tenant creation failed
    if (!tenantResult) {
      return {
        status: 400,
        body: { success: false, message: 'Tenant creation failed' },
      };
    }

    // 2. Create user for this tenant
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      name: data.companyName || data.email,
      email: data.email,
      passwordHash,
      role: new mongoose.Types.ObjectId('687f94a6eb27eefa96f469e4'),
      tenant: tenantResult?.body?.data?._id,
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
        password, // Return password so it can be communicated to the user
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

