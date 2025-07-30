import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import OrderController from '../../../lib/controllers/orderController.js';
import OrderService from '../../../lib/services/orderService.js';
import OrderRepository from '../../../lib/repository/OrderRepository.js';
import CouponService from '../../../lib/services/CouponService.js';
import CouponRepository from '../../../lib/repository/CouponRepository.js';
import { OrderSchema } from '../../../lib/models/Order.js';
import { CouponSchema } from '../../../lib/models/Coupon.js';
import { getSubdomain, getDbConnection } from '../../../lib/tenantDb';

export async function POST(req) {
  try {
    const body = await req.json();
        console.log('Route received apply body:', body);
        const subdomain = getSubdomain(req);
        const conn = await getDbConnection(subdomain);
        if (!conn) {
          return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
        }
    const Order = conn.models.Order || conn.model('Order', OrderSchema);
    const Coupon = conn.models.Coupon || conn.model('Coupon', CouponSchema);
    const orderRepo = new OrderRepository(Order);
    const couponRepo = new CouponRepository(Coupon);
    const couponService = new CouponService(couponRepo);
    const orderService = new OrderService(orderRepo, couponService);
    const orderController = new OrderController(orderService);
    const result = await orderController.create({ body }, conn);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Route POST order error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}