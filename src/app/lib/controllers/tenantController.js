import TenantService from '../services/tenantService.js';

const tenantService = new TenantService();

export async function createTenant(data) {
  try {
    const result = await tenantService.createTenant(data);
    return {
      status: result.status || 201,
      body: result,
    };
  } catch (err) {
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
