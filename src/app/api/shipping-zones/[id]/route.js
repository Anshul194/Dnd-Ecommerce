import { NextResponse } from 'next/server';
import { getSubdomain, getDbConnection } from '../../../lib/tenantDb.js';
import shippingZoneController from '../../../lib/controllers/ShippingZoneController.js';
import { withUserAuth } from '../../../middleware/commonAuth.js';
import mongoose from 'mongoose';

// GET: Fetch a shipping zone by ID (no authentication required)
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
    const id = params.id;
    console.log('Processing shipping zone ID:', id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid shipping zone ID' }, { status: 400 });
    }
    return await shippingZoneController.getShippingZoneById(request, null, id, conn);
  } catch (err) {
    console.error('ShippingZone GET by ID error:', err.message, err.stack);
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}

// PUT: Update a shipping zone (requires authentication)
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
    const id = params.id;
    console.log('Processing shipping zone ID:', id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid shipping zone ID' }, { status: 400 });
    }
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    return await shippingZoneController.updateShippingZone(request, null, body, id, conn);
  } catch (err) {
    console.error('ShippingZone PUT error:', err.message, err.stack);
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
});

// DELETE: Delete a shipping zone (requires authentication)
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
    const id = params.id;
    console.log('Processing shipping zone ID:', id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid shipping zone ID' }, { status: 400 });
    }
    return await shippingZoneController.deleteShippingZone(request, null, id, conn);
  } catch (err) {
    console.error('ShippingZone DELETE error:', err.message, err.stack);
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
});