import dbConnect from '../../connection/dbConnect';
import { NextResponse } from 'next/server';
import {

createModule,
updateModule,
getModule,
getAllModules,
deleteModule
} from '../../lib/controllers/moduleController.js';
import { withSuperAdminCreationAuth, verifyTokenAndUser, hasModulePermission } from '../../middleware/commonAuth.js';
import Module from '../../lib/models/Module.js';
import Role from '../../lib/models/role.js';
// POST: Create a new module (Super Admin creation protected)
export const POST = withSuperAdminCreationAuth(
    async function(request) {
        try {
            console.log('POST /module called',request);
            await dbConnect();
            const result = await createModule(request);
            return NextResponse.json(result.body, { status: result.status });
        } catch (err) {
            console.error('POST /module error:', err);
            return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
        }
    }
);

// GET: Get a module by id (via ?id=) or all modules (implement getModules if needed)








export async function GET(request) {
  try {
    await dbConnect();

    // Authenticate user
    const authResult = await verifyTokenAndUser(request);
    if (authResult.error) return authResult.error;
    const user = authResult.user;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Use common permission check for single module
      const hasPermission = await hasModulePermission(user, id, 'read');
      if (!hasPermission) {
        return NextResponse.json({ success: false, message: 'Forbidden: insufficient permissions' }, { status: 403 });
      }
      // Only return the module if user has permission for this id
      const result = await getModule(id);
      return NextResponse.json(result.body, { status: result.body.status || result.status || 200 });
    } else {
      // Get all modules that this user/role has permissions for (for sidebar)
      const permittedModules = await getPermittedModulesForUser(user);
      console.log('Permitted modules for user:', permittedModules);
      
      return NextResponse.json({ success: true, modules: permittedModules, status: 200 });
    }
  } catch (err) {
    console.error('GET /module error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function getPermittedModulesForUser(user) {
    // Super Admins get all modules
    if (user.isSuperAdmin) {
        const allResult = await getAllModules();
        // For super admin, return all modules with all permissions (optional: you can add all permissions if needed)
        return allResult.body?.modules || allResult.body?.body?.data || [];
    }

    // Get user's role
    let role = user.role;
    if (!role) return [];

    // If role is an ObjectId, convert to string for lookup
    if (typeof role === 'object' && role._bsontype === 'ObjectId') {
        role = role.toString();
    }

    // If role is populated, use directly; otherwise, fetch role document
    let roleDoc = role.modulePermissions ? role : await Role.findById(role).lean();
    if (!roleDoc || !roleDoc.modulePermissions) return [];

    // Get all module IDs that the role has permissions for
    const moduleIds = roleDoc.modulePermissions
        .filter(mp => mp.permissions && mp.permissions.length > 0)
        .map(mp => mp.module);

    // Fetch all modules that match these IDs
    const permittedModules = await Module.find({ 
        _id: { $in: moduleIds } 
    }).lean();

    // Map permissions from role.modulePermissions to each module
    const modulesWithPermissions = permittedModules.map(mod => {
        const mp = roleDoc.modulePermissions.find(mp => mp.module.toString() === mod._id.toString());
        return {
            ...mod,
            permissions: mp ? mp.permissions : []
        };
    });

    return modulesWithPermissions;
}



// PUT: Update a module by id (?id=)
export async function PUT(request) {
try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const result = await updateModule(id, body);
    return NextResponse.json(result.body, { status: result.status });
} catch (err) {
    console.error('PUT /module error:', err);
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
}
}

// DELETE: Delete a module by id (?id=)
export async function DELETE(request) {
try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const result = await deleteModule(id);
    return NextResponse.json(result.body, { status: result.status });
} catch (err) {
    console.error('DELETE /module error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
}
}