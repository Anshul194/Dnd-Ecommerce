import RoleService from '../services/roleService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

const roleService = new RoleService();

// Create a new role
export async function createRole(form) {
    try {
        const { name, scope, tenantId, modulePermissions } = form;
        const existing = await roleService.findByName(name);
        if (existing) {
            return {
                status: 400,
                body: errorResponse('Role with this name already exists', 400),
            };
        }
        const newRole = await roleService.createRole({
            name,
            scope,
            tenantId: tenantId || null,
            modulePermissions: modulePermissions || []
        });
        return {
            status: 201,
            body: successResponse("Role created", newRole),
        };
    } catch (err) {
        console.error('Create Role error:', err.message);
        return {
            status: 500,
            body: errorResponse('Server error', 500),
        };
    }
}

// Get all roles
export async function getRoles(query) {
    try {
        const data = await roleService.getRoles(query);
        return {
            status: 200,
            body: successResponse("Roles fetched successfully", data),
        };
    } catch (err) {
        console.error('Get Roles error:', err.message);
        return {
            status: 500,
            body: errorResponse('Server error', 500),
        };
    }
}

// Get a role by ID
export async function getRoleById(id) {
    try {
        const role = await roleService.getRoleById(id);
        if (!role) {
            return {
                status: 404,
                body: errorResponse('Role not found', 404),
            };
        }
        return {
            status: 200,
            body: successResponse("Role fetched", role),
        };
    } catch (err) {
        console.error('Get Role error:', err.message);
        return {
            status: 500,
            body: errorResponse('Server error', 500),
        };
    }
}

// Update a role by ID
export async function updateRole(id, data) {
    try {
        const updated = await roleService.updateRole(id, data);
        if (!updated) {
            return {
                status: 404,
                body: errorResponse('Role not found', 404),
            };
        }
        return {
            status: 200,
            body: successResponse("Role updated", updated),
        };
    } catch (err) {
        console.error('Update Role error:', err.message);
        return {
            status: 500,
            body: errorResponse('Server error', 500),
        };
    }
}

// Delete a role by ID
export async function deleteRole(id) {
    try {
        const deleted = await roleService.deleteRole(id);
        if (!deleted) {
            return {
                status: 404,
                body: errorResponse('Role not found', 404),
            };
        }
        return {
            status: 200,
            body: successResponse("Role deleted", deleted),
        };
    } catch (err) {
        console.error('Delete Role error:', err.message);
        return {
            status: 500,
            body: errorResponse('Server error', 500),
        };
    }
}
