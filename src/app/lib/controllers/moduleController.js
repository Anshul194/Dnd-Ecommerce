import ModuleService from '../services/moduleService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

const moduleService = new ModuleService();
export async function createModule(request) {
    try {
        const body = await request.json();

        const newModule = await moduleService.createModuleWithPermissions(body);

        return {
            status: 201,
            body: successResponse(newModule, 'Module created'),
        };
    } catch (err) {
        console.error('Create Module error:', err.message);
        return {
            status: 500,
            body: errorResponse('Server error', 500),
        };
    }
}

// Update a module by ID
export async function updateModule(id, data) {
    try {
        const updated = await moduleService.updateModuleWithPermissions(id, data);
        if (!updated) {
            return {
                status: 404,
                body: errorResponse('Module not found', 404),
            };
        }
        return {
            status: 200,
            body: successResponse(updated, 'Module updated'),
        };
    } catch (err) {
        console.error('Update Module error:', err.message);
        return {
            status: 500,
            body: errorResponse('Server error', 500),
        };
    }
}

// Get a module by ID
export async function getModule(id) {
    try {
        const module = await moduleService.getModuleWithPermissions(id);
        if (!module) {
            return {
                status: 404,
                body: errorResponse('Module not found', 404),
            };
        }
        return {
            status: 200,
            body: successResponse(module, 'Module fetched'),
        };
    } catch (err) {
        console.error('Get Module error:', err.message);
        return {
            status: 500,
            body: errorResponse('Server error', 500),
        };
    }
}

// Delete a module by ID
export async function deleteModule(id) {
    try {
        const deleted = await moduleService.deleteModule(id);
        if (!deleted) {
            return {
                status: 404,
                body: errorResponse('Module not found', 404),
            };
        }
        return {
            status: 200,
            body: successResponse(deleted, 'Module deleted'),
        };
    } catch (err) {
        console.error('Delete Module error:', err.message);
        return {
            status: 500,
            body: errorResponse('Server error', 500),
        };
    }
}
