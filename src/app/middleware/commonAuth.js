import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '../lib/models/User'; 
import dotenv from 'dotenv';
dotenv.config();


const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET_KEY;

/**
 * Verify JWT Token
 */
export async function verifyJwtToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) return reject(err);
            resolve(decoded);
        });
    });
}

/**
 * Fetch User by ID
 */
export async function getUserById(userId) {
    try {
        const user = await User.findById(userId).lean();
        return user;
    } catch (err) {
        console.error('Error fetching user:', err.message);
        return null;
    }
}

/**
 * Verify Token & User by Role
 */
export async function verifyTokenAndUser(request, userType = 'user') {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
            error: NextResponse.json(
                { success: false, message: 'Missing or invalid authorization header' },
                { status: 401 }
            )
        };
    }

    const token = authHeader.split(' ')[1];
    let payload;
    try {
        payload = await verifyJwtToken(token);
    } catch (err) {
        console.error('JWT verification failed:', err.message);
        return {
            error: NextResponse.json(
                { success: false, message: 'Invalid or expired token' },
                { status: 401 }
            )
        };
    }

    console.log('Decoded JWT payload:', payload);
    // Try all possible id fields
    const userId = payload.userId || payload._id || payload.id;
    const user = await getUserById(userId);

    if (!user) {
        return {
            error: NextResponse.json(
                { success: false, message: 'User not found or unauthorized' },
                { status: 403 }
            )
        };
    }

    return { user };
}

/**
 * Verify if User is Super Admin
 */
export async function verifySuperAdminAccess(request) {
    const result = await verifyTokenAndUser(request, 'user');
    if (result.error) return result;

    if (!result.user.isSuperAdmin) {
        return {
            error: NextResponse.json(
                { success: false, message: 'Access Denied: Super Admins only' },
                { status: 403 }
            )
        };
    }

    return result;
}

/**
 * Route Protection for Super Admin Access
 */
export function withSuperAdminAuth(handler) {
    return async function (request, ...args) {
        const authResult = await verifySuperAdminAccess(request);
        if (authResult.error) return authResult.error;

        request.user = authResult.user;
        return handler(request, ...args);
    };
}

/**
 * Verify if User can Create Super Admin
 */
export async function verifyRoleForSuperAdminCreation(request) {
    const result = await verifyTokenAndUser(request, 'user');
    if (result.error) return result;

    if (!result.user.isSuperAdmin) {
        return {
            error: NextResponse.json(
                { success: false, message: 'Only Super Admins can create' },
                { status: 403 }
            )
        };
    }

    return result;
}

/**
 * Route Protection for Super Admin Creation
 */
export function withSuperAdminCreationAuth(handler) {
    return async function (request, ...args) {
        const authResult = await verifyRoleForSuperAdminCreation(request);
        if (authResult.error) return authResult.error;

        request.user = authResult.user;
        return handler(request, ...args);
    };
}

/**
 * Verify if User is Super Admin or Role Admin
 */
export async function verifySuperAdminOrRoleAdminAccess(request) {
    const result = await verifyTokenAndUser(request, 'user');
    if (result.error) return result;

    // Check if user is super admin
    if (result.user.isSuperAdmin) {
        return result;
    }

    // Check if user has 'admin' role (by name or by specific ObjectId)
    let roleDoc = result.user.role;
    if (!roleDoc || typeof roleDoc === 'string' || (roleDoc._bsontype === 'ObjectId')) {
        // Fetch role document if not populated
        const Role = (await import('../lib/models/role.js')).default;
        roleDoc = await Role.findById(result.user.role).lean();
    }
    if (roleDoc && (roleDoc.name === 'admin' || roleDoc.slug === 'admin')) {
        return result;
    }

    return {
        error: NextResponse.json(
            { success: false, message: 'Access Denied: Only Super Admin or Role Admin can create roles' },
            { status: 403 }
        )
    };
}

/**
 * Route Protection for Super Admin or Role Admin Access (for role creation)
 */
export function withSuperAdminOrRoleAdminAuth(handler) {
    return async function (request, ...args) {
        const authResult = await verifySuperAdminOrRoleAdminAccess(request);
        if (authResult.error) return authResult.error;

        request.user = authResult.user;
        return handler(request, ...args);
    };
}

/**
 * Check if user has permission for a module
 * @param {Object} user - User document
 * @param {String} moduleId - Module ObjectId as string
 * @param {String} permission - Permission string (e.g. 'view', 'edit')
 * @returns {Boolean}
 */


export async function hasModulePermission(user, moduleId, permission = null) {
    // Super Admins have all permissions
    if (user.isSuperAdmin) return true;

    // Get user's role (populated or id)
    let role = user.role;
    if (!role) return false;

    // If role is an ObjectId, convert to string for lookup
    if (typeof role === 'object' && role._bsontype === 'ObjectId') {
        role = role.toString();
    }

    // If role is populated, use directly; otherwise, fetch role document
    let roleDoc = role.modulePermissions ? role : await (await import('../lib/models/role.js')).default.findById(role).lean();
    console.log('Role id:', role, 'Role document modulePermissions:', roleDoc?.modulePermissions);
    if (!roleDoc) return false;

    // Check permission for requested module
    console?.log('Checking permissions for module:', moduleId, 'and permission:', permission);
    if (moduleId) {
        if (permission) {
            // Check for specific permission
            return roleDoc.modulePermissions?.some(mp =>
                mp.module?.toString() == moduleId && mp.permissions?.includes(permission)
            );
        } else {
            // Check for ANY permission (used for sidebar modules)
            return roleDoc.modulePermissions?.some(mp =>
                mp.module?.toString() == moduleId && mp.permissions?.length > 0
            );
        }
    } else {
        // For all modules, require at least one permission
        if (permission) {
            return roleDoc.modulePermissions?.some(mp =>
                mp.permissions?.includes(permission)
            );
        } else {
            return roleDoc.modulePermissions?.some(mp =>
                mp.permissions?.length > 0
            );
        }
    }
}
