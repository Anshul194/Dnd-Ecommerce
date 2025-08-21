import { NextResponse } from 'next/server';
import { getSubdomain, getDbConnection } from '../../../lib/tenantDb.js';
import shippingZoneController from '../../../lib/controllers/ShippingZoneController.js';
import { withUserAuth } from '../../../middleware/commonAuth.js';
import mongoose from 'mongoose';

// GET: Fetch a shipping zone by shipping ID (no authentication required)
export async function GET(request, { params }) {
  try {
    const subdomain = getSubdomain(request);
    console.log('Subdomain:', subdomain);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      console.error('No database connection established');
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    console.log('Connection name in route:', conn.name);
    const shippingId = params.id;
    console.log('Processing shipping ID:', shippingId);
    if (!mongoose.Types.ObjectId.isValid(shippingId)) {
      return NextResponse.json({ success: false, message: 'Invalid shipping ID' }, { status: 400 });
    }
    return await shippingZoneController.getShippingZoneByShippingId(request, null, shippingId, conn);
  } catch (err) {
    console.error('ShippingZone GET by shipping ID error:', err.message, err.stack);
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}

// PUT: Update or create a shipping zone by shipping ID (requires authentication)
export const PUT = withUserAuth(async function (request, { params }) {
  try {
    const subdomain = getSubdomain(request);
    console.log('Subdomain:', subdomain);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      console.error('No database connection established');
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    console.log('Connection name in route:', conn.name);
    const shippingId = params.id;
    console.log('Processing shipping ID:', shippingId);
    if (!mongoose.Types.ObjectId.isValid(shippingId)) {
      return NextResponse.json({ success: false, message: 'Invalid shipping ID' }, { status: 400 });
    }
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    return await shippingZoneController.updateShippingZone(request, null, body, shippingId, conn);
  } catch (err) {
    console.error('ShippingZone PUT error:', err.message, err.stack);
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
});

// DELETE: Delete a shipping zone by shipping ID (requires authentication)
export const DELETE = withUserAuth(async function (request, { params }) {
  try {
    const subdomain = getSubdomain(request);
    console.log('Subdomain:', subdomain);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      console.error('No database connection established');
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    console.log('Connection name in route:', conn.name);
    const shippingId = params.id;
    console.log('Processing shipping ID:', shippingId);
    if (!mongoose.Types.ObjectId.isValid(shippingId)) {
      return NextResponse.json({ success: false, message: 'Invalid shipping ID' }, { status: 400 });
    }
    return await shippingZoneController.deleteShippingZone(request, null, shippingId, conn);
  } catch (err) {
    console.error('ShippingZone DELETE error:', err.message, err.stack);
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
});