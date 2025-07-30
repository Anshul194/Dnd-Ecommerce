import cartService from '../services/CartService';
import orderService from '../services/OrderService';
import { NextResponse } from 'next/server';

class OrderController {
  async placeOrder(req, _res, body, conn) {
    try {
      const userId = req.user._id;
      const cart = await cartService.getCart(userId, conn);
      if (!cart || cart.items.length === 0) {
        return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
      }
      

      // Assuming createOrderService is a function that handles order creation
      const orderData = {
        userId,
        items: cart.items,
        total: cart.total,
        coupon: cart.coupon,
        discount: cart.discount,
      };

      const order = await orderService.placeOrder(orderData, conn.models.Order, conn);
      return NextResponse.json({ message: 'Order placed successfully', order });
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
}