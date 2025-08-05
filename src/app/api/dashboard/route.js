import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import DashboardController from '../../lib/controllers/dashboardController.js';
import DashboardService from '../../lib/services/dashboardService.js';
import UserRepository from '../../lib/repository/userRepository.js';
import OrderRepository from '../../lib/repository/OrderRepository.js';
import TicketRepository from '../../lib/repository/ticketRepository.js';
import { UserSchema } from '../../lib/models/User.js';
import { OrderSchema } from '../../lib/models/Order.js';
import { TicketSchema } from '../../lib/models/Ticket.js';
import { ProductSchema } from '../../lib/models/Product.js';
import { VariantSchema } from '../../lib/models/Variant.js';
import { CouponSchema } from '../../lib/models/Coupon.js';
import { getSubdomain, getDbConnection } from '../../lib/tenantDb';
import { withUserAuth } from '../../middleware/commonAuth.js';

export const GET = withUserAuth(async function (request) {
  try {
    const subdomain = getSubdomain(request);
    console.log('Subdomain:', subdomain);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      console.error('No database connection established');
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    console.log('Connection name in route:', conn.name);
    const User = conn.models.User || conn.model('User', UserSchema);
    const Order = conn.models.Order || conn.model('Order', OrderSchema);
    const Ticket = conn.models.Ticket || conn.model('Ticket', TicketSchema);
    const Product = conn.models.Product || conn.model('Product', ProductSchema);
    const Variant = conn.models.Variant || conn.model('Variant', VariantSchema);
    const Coupon = conn.models.Coupon || conn.model('Coupon', CouponSchema);
    console.log('Models registered:', { User: User.modelName, Order: Order.modelName, Ticket: Ticket.modelName, Product: Product.modelName, Variant: Variant.modelName, Coupon: Coupon.modelName });
    const userRepo = new UserRepository(User, conn);
    const orderRepo = new OrderRepository(Order, conn);
    const ticketRepo = new TicketRepository(Ticket, conn);
    const dashboardService = new DashboardService(userRepo, orderRepo, ticketRepo);
    const dashboardController = new DashboardController(dashboardService);
    const result = await dashboardController.getDashboardData(request, conn);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Route GET dashboard error:', error.message, error.stack);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
});