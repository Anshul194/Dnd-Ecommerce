import { NextResponse } from 'next/server';
import { getSubdomain, getDbConnection } from '../../lib/tenantDb';
import OrderController from '../../lib/controllers/orderController';
import OrderModel from '../../lib/models/Order';
// POST /api/orders/place
export async function POST(req) {
    const { user, items, total, coupon, discount } = await req.json();
    try {
        const subdomain = getSubdomain(req);
        const conn = await getDbConnection(subdomain);
        if (!conn) {
            return NextResponse.json(
                { success: false, message: 'DB not found' },
                { status: 404 }
            );
        }
        const Order = conn.models.Order || conn.model('Order', OrderModel.schema);
        const orderController = new OrderController(Order);
        const response = await orderController.placeOrder(user, items, total, coupon, discount, conn);
        return NextResponse.json(response, {
            status: response.success ? 201 : 400,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }   
}

