import { getSubdomain, getDbConnection } from '../../../lib/tenantDb';
import {
  createLeadController,
  getLeadsController,
} from '../../../lib/controllers/leadController';
import { withSuperAdminOrRoleAdminAuth } from '../../../middleware/commonAuth';

export const GET = withSuperAdminOrRoleAdminAuth(async function(request) {
  try {
    const subdomain = getSubdomain(request);
    const conn = await getDbConnection(subdomain);

    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    // ✅ Directly return the controller's response
    return await getLeadsController(query, conn);

  } catch (err) {
    console.error('GET /crm/leads error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Server error' }, { status: 500 });
  }
});

export async function POST(request) {
  try {
    const subdomain = getSubdomain(request);
    const conn = await getDbConnection(subdomain);

    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }

    const body = await request.json();

    // ✅ Directly return the controller's response
    return await createLeadController(body, conn);

  } catch (err) {
    console.error('POST /crm/leads error:', err);
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
  }
}
