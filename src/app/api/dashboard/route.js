import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import DashboardController from '../../lib/controllers/dashboardController';
import DashboardService from '../../lib/services/dashboardService';
import OrderRepository from '../../lib/repository/OrderRepository';
import TicketRepository from '../../lib/repository/ticketRepository';
import CouponRepository from '../../lib/repository/CouponRepository';
import OrderService from '../../lib/services/orderService';
import TicketService from '../../lib/services/ticketService';
import CouponService from '../../lib/services/CouponService';
import { getSubdomain, getDbConnection } from '../../lib/tenantDb';
import { withUserAuth } from '../../middleware/commonAuth';
import OrderSchema from '../../lib/models/Order';
import CouponSchema from '../../lib/models/Coupon';
import ProductSchema from '../../lib/models/Product';
import VariantSchema from '../../lib/models/Variant';
import TicketSchema from '../../lib/models/Ticket';

export const GET = withUserAuth(async function (request) {
  try {
    // Check if user is admin (uncomment if needed)
    // if (!request.user?.isAdmin) {
    //   return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    // }

    const subdomain = getSubdomain(request);
    console.log('Subdomain:', subdomain);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      console.error('No database connection established');
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    console.log('Connection name in route:', conn.name);

    // Register models
    const Order = conn.models.Order || conn.model('Order', OrderSchema);
    const Coupon = conn.models.Coupon || conn.model('Coupon', CouponSchema);
    const Product = conn.models.Product || conn.model('Product', ProductSchema);
    const Variant = conn.models.Variant || conn.model('Variant', VariantSchema);
    const Ticket = conn.models.Ticket || conn.model('Ticket', TicketSchema);

    console.log('Models registered:', {
      Order: Order.modelName,
      Coupon: Coupon.modelName,
      Product: Product.modelName,
      Variant: Variant.modelName,
      Ticket: Ticket.modelName
    });

    // Initialize repositories
    const orderRepo = new OrderRepository(Order, conn);
    const ticketRepo = new TicketRepository(conn); // Pass conn to TicketRepository
    const couponRepo = new CouponRepository(Coupon);

    // Initialize services
    const couponService = new CouponService(couponRepo);
    const orderService = new OrderService(orderRepo, couponService);
    const ticketService = new TicketService(conn);
    const dashboardService = new DashboardService(orderService, ticketService);

    // Initialize controller
    const dashboardController = new DashboardController(dashboardService);

    // Fetch dashboard data
    const result = await dashboardController.getDashboardData(request, conn);
    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error('Route GET dashboard error:', error.message, error.stack);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
});
