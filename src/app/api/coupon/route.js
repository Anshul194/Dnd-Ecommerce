import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import CouponController from '../../lib/controllers/CouponController.js';
import CouponService from '../../lib/services/CouponService.js';
import CouponRepository from '../../lib/repository/CouponRepository.js';
import { CouponSchema } from '../../lib/models/Coupon.js';
import dbConnect from '../../connection/dbConnect';


function getSubdomain(request) {
  // Prefer x-tenant header if present
  const xTenant = request.headers.get('x-tenant');
  if (xTenant) return xTenant;
  const host = request.headers.get('host') || '';
  // e.g. tenant1.localhost:5173 or tenant1.example.com
  const parts = host.split('.');
  if (parts.length > 2) return parts[0];
  if (parts.length === 2 && parts[0] !== 'localhost') return parts[0];
  return null;
}



async function getDbConnection(subdomain) {
  if (!subdomain || subdomain === 'localhost') {
    // Use default DB (from env)
    return await dbConnect();
  } else {
    // Connect to global DB to get tenant DB URI
    await dbConnect();
    const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', new mongoose.Schema({
      name: String,
      dbUri: String,
      subdomain: String
    }, { collection: 'tenants' }));
    const tenant = await Tenant.findOne({ subdomain });
    if (!tenant?.dbUri) return null;
    // Connect to tenant DB
    return await dbConnect(tenant.dbUri);
  }
}

export async function GET(req) {
  const searchParams = req.nextUrl.searchParams;
  const query = Object.fromEntries(searchParams.entries());
  console.log('Route received query:', query);

  try {
    const subdomain = getSubdomain(req);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    const Coupon = conn.models.Coupon || conn.model('Coupon', CouponSchema);
    const couponRepo = new CouponRepository(Coupon);
    const couponService = new CouponService(couponRepo);
    const couponController = new CouponController(couponService);
    const coupons = await couponController.getAll(query, conn);
    return NextResponse.json({ success: true, coupons });
  } catch (error) {
    console.error('Route GET error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Route received body:', body);
    const subdomain = getSubdomain(req);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    const Coupon = conn.models.Coupon || conn.model('Coupon', CouponSchema);
    const couponRepo = new CouponRepository(Coupon);
    const couponService = new CouponService(couponRepo);
    const couponController = new CouponController(couponService);
    const result = await couponController.create({ body }, conn);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json({ success: true, coupon: result.data }, { status: 201 });
  } catch (error) {
    console.error('Route POST error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}