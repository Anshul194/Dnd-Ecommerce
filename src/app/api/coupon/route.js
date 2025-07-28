import { getSubdomain, getDbConnection } from '../../lib/tenantDb.js';
import { NextResponse } from 'next/server';
import Coupon from '../../lib/models/Coupon.js';
import { withSuperAdminOrRoleAdminAuth } from '../../middleware/commonAuth.js';

// Create Coupon
export const POST = withSuperAdminOrRoleAdminAuth(async function(request) {
  try {
    const subdomain = getSubdomain(request);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    const body = await request.json();
    const coupon = await Coupon.create(body);
    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
});

// Get all or one coupon
export async function GET(request) {
  try {
    const subdomain = getSubdomain(request);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    if (code) {
      const coupon = await Coupon.findOne({ code });
      if (!coupon) return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
      return NextResponse.json({ success: true, coupon });
    } else {
      const coupons = await Coupon.find();
      return NextResponse.json({ success: true, coupons });
    }
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// Update Coupon
export const PUT = withSuperAdminOrRoleAdminAuth(async function(request) {
  try {
    const subdomain = getSubdomain(request);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    if (!code) return NextResponse.json({ success: false, message: 'Coupon code required' }, { status: 400 });
    const body = await request.json();
    const coupon = await Coupon.findOneAndUpdate({ code }, body, { new: true });
    if (!coupon) return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
    return NextResponse.json({ success: true, coupon });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
});

// Delete Coupon
export async function DELETE(request) {
  try {
    const subdomain = getSubdomain(request);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    if (!code) return NextResponse.json({ success: false, message: 'Coupon code required' }, { status: 400 });
    const coupon = await Coupon.findOneAndDelete({ code });
    if (!coupon) return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
