import { NextResponse } from 'next/server';
import { getSubdomain, getDbConnection } from '../../lib/tenantDb.js';
import shippingZoneController from '../../lib/controllers/ShippingZoneController.js';
import { withUserAuth } from '../../middleware/commonAuth.js';

// GET: Fetch all shipping zones with pagination and search (no authentication required)
export async function GET(request) {
  try {
    const subdomain = getSubdomain(request);
    console.log('Subdomain:', subdomain);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      console.error('No database connection established');
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    console.log('Connection name in route:', conn.name);
    return await shippingZoneController.getAllShippingZones(request, null, conn);
  } catch (err) {
    console.error('ShippingZone GET error:', err.message, err.stack);
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}

// POST: Create a new shipping zone (requires authentication)
export const POST = withUserAuth(async function (request) {
  try {
    const subdomain = getSubdomain(request);
    console.log('Subdomain:', subdomain);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      console.error('No database connection established');
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    console.log('Connection name in route:', conn.name);
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    return await shippingZoneController.createShippingZone(request, null, body, conn);
  } catch (err) {
    console.error('ShippingZone POST error:', err.message, err.stack);
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
});