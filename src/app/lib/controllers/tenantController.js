import TenantService from '../services/tenantService.js';

const tenantService = new TenantService();

export async function createTenant(data) {
  try {
    const result = await tenantService.createTenant(data);
    return {
      status: 201,
      body: result?.success !== false ? { success: true, message: "Tenant created", data: result } : result,
    };
  } catch (err) {
    return {
      status: 500,
      body: { success: false, message: 'Server error', data: null },
    };
  }
}

export async function getAllTenants(query) {
  try {
    const result = await tenantService.getAllTenants(query);
    return {
      status: 200,
      body: { success: true, message: "Tenants fetched", data: result },
    };
  } catch (err) {
    return {
      status: 500,
      body: { success: false, message: 'Server error', data: null },
    };
  }
}

export async function getTenantById(id) {
  try {
    const result = await tenantService.getTenantById(id);
    if (!result) {
      return {
        status: 404,
        body: { success: false, message: "Tenant not found", data: null },
      };
    }
    return {
      status: 200,
      body: { success: true, message: "Tenant fetched", data: result },
    };
  } catch (err) {
    return {
      status: 500,
      body: { success: false, message: 'Server error', data: null },
    };
  }
}

export async function updateTenant(id, data) {
  try {
    const result = await tenantService.updateTenant(id, data);
    if (!result) {
      return {
        status: 404,
        body: { success: false, message: "Tenant not found", data: null },
      };
    }
    return {
      status: 200,
      body: { success: true, message: "Tenant updated", data: result },
    };
  } catch (err) {
    return {
      status: 500,
      body: { success: false, message: 'Server error', data: null },
    };
  }
}

export async function deleteTenant(id) {
  try {
    const result = await tenantService.deleteTenant(id);
    if (!result) {
      return {
        status: 404,
        body: { success: false, message: "Tenant not found", data: null },
      };
    }
    return {
      status: 200,
      body: { success: true, message: "Tenant deleted", data: result },
    };
  } catch (err) {
    return {
      status: 500,
      body: { success: false, message: 'Server error', data: null },
    };
  }
}
