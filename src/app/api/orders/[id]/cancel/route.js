import { NextResponse } from 'next/server';
import OrderController from '../../../../lib/controllers/orderController.js';
import OrderService from '../../../../lib/services/orderService.js';
import OrderRepository from '../../../../lib/repository/OrderRepository.js';
import CouponService from '../../../../lib/services/CouponService.js';
import CouponRepository from '../../../../lib/repository/CouponRepository.js';
import { OrderSchema } from '../../../../lib/models/Order.js';
import { CouponSchema } from '../../../../lib/models/Coupon.js';
import { getSubdomain, getDbConnection } from '../../../../lib/tenantDb';
import { withUserAuth } from '../../../../middleware/commonAuth.js';

export const PUT = withUserAuth(async function (request, { params }) {
    try {
        const subdomain = getSubdomain(request);
        const conn = await getDbConnection(subdomain);
        if (!conn) {
            return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
        }

        const Order = conn.models.Order || conn.model('Order', OrderSchema);
        const Coupon = conn.models.Coupon || conn.model('Coupon', CouponSchema);

        const orderRepo = new OrderRepository(Order, conn);
        const couponRepo = new CouponRepository(Coupon);
        const couponService = new CouponService(couponRepo);
        const orderService = new OrderService(orderRepo, couponService);
        const orderController = new OrderController(orderService);

        const result = await orderController.cancelOrder(request, conn, params);

        if (!result.success) {
            return NextResponse.json(result, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
});
