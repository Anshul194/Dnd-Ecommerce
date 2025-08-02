import { NextResponse } from 'next/server';
import { getSubdomain, getDbConnection } from '../../lib/tenantDb.js';
import shippingController from '../../lib/controllers/shippingContoller.js';
import { withUserAuth } from '../../middleware/commonAuth.js';

export const GET = withUserAuth(async function (request) {
  try {
    const subdomain = getSubdomain(request);
    console.log('Subdomain:', subdomain);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      console.error('No database connection established');
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    console.log('Connection name in route:', conn.name);
    return await shippingController.getAllShipping(request, null, conn);
  } catch (err) {
    console.error('Shipping GET error:', err.message, err.stack);
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
});

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
    return await shippingController.createShipping(request, null, body, conn);
  } catch (err) {
    console.error('Shipping POST error:', err.message, err.stack);
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
});