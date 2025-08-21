import { NextResponse } from 'next/server';
import { getSubdomain, getDbConnection } from '../../../../lib/tenantDb.js';
import shippingZoneController from '../../../../lib/controllers/ShippingZoneController.js';
import mongoose from 'mongoose';

// GET: Fetch all shipping zones by shippingId (no authentication required)
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
    const shippingId = params.shippingId;
    console.log('Processing shipping ID:', shippingId);
    if (!mongoose.Types.ObjectId.isValid(shippingId)) {
      return NextResponse.json({ success: false, message: 'Invalid shipping ID' }, { status: 400 });
    }
    return await shippingZoneController.getShippingZonesByShippingId(request, null, shippingId, conn);
  } catch (err) {
    console.error('ShippingZone GET by shippingId error:', err.message, err.stack);
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}