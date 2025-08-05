import { getSubdomain, getDbConnection } from '../../../../lib/tenantDb';
import {
  updateLeadController,
  deleteLeadController,
  getLeadByIdController,
} from '../../../../lib/controllers/leadController';
import { NextResponse } from 'next/server';
import { withSuperAdminOrRoleAdminAuth } from '../../../../middleware/commonAuth';

export async function PUT(request, { params }) {
  try {
    const subdomain = getSubdomain(request);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }

    const body = await request.json(); // ✅ read once here
    return await updateLeadController(body, params.id, conn); // ✅ pass to controller
  } catch (err) {
    console.error('PUT /crm/leads/:id error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Server error' }, { status: 500 });
  }
}


export async function DELETE(request, { params }) {
  try {
    const subdomain = getSubdomain(request);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }

    return await deleteLeadController(params.id, conn);
  } catch (err) {
    console.error('DELETE /crm/leads/:id error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Server error' }, { status: 500 });
  }
}

export const GET = withSuperAdminOrRoleAdminAuth(async function(request, { params }) {
  try {
    const subdomain = getSubdomain(request);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }

    return await getLeadByIdController(params?.id, conn); // ✅ Fix: pass conn
  } catch (err) {
    console.error('GET /crm/leads/:id error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Server error' }, { status: 500 });
  }
});

