import { NextResponse } from 'next/server';
import { getSubdomain, getDbConnection } from '../../../lib/tenantDb.js';
import shippingController from '../../../lib/controllers/shippingContoller.js';
import { withUserAuth } from '../../../middleware/commonAuth.js';
import mongoose from 'mongoose';

export const GET = withUserAuth(async function (request, { params }) {
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
    console.log('Processing shipping ID:', id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid shipping ID' }, { status: 400 });
    }
    return await shippingController.getShippingById(request, null, id, conn);
  } catch (err) {
    console.error('Shipping GET by ID error:', err.message, err.stack);
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
});

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
    console.log('Processing shipping ID:', id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid shipping ID' }, { status: 400 });
    }
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    return await shippingController.updateShipping(request, null, body, id, conn);
  } catch (err) {
    console.error('Shipping PUT error:', err.message, err.stack);
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
});

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
    console.log('Processing shipping ID:', id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid shipping ID' }, { status: 400 });
    }
    return await shippingController.deleteShipping(request, null, id, conn);
  } catch (err) {
    console.error('Shipping DELETE error:', err.message, err.stack);
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
});