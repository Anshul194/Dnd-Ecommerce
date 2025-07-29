import cartService from '../services/CartService';
import { NextResponse } from 'next/server';

class CartController {
  async getCart(req, _res, body, conn) {
    try {
      const userId = req.user._id;
          console.log('Fetching cart for user:', conn);
      
      const cart = await cartService.getCart(userId, conn);
      if (!cart) {
        // Return an empty cart structure if not found
        return NextResponse.json({ user: userId, items: [], total: 0, coupon: null, discount: 0 }, { status: 200 });
      }
      return NextResponse.json(cart);
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async addItem(req, _res, body, conn) {
    try {
      const userId = req.user._id;
      const { product, variant, quantity, price } = body;
      const cart = await cartService.addItem(userId, { product, variant, quantity, price }, conn);
      return NextResponse.json({ message: 'Item added to cart successfully', cart });
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async removeItem(req, _res, body, conn) {
    try {
      const userId = req.user._id;
      const { productId, variantId } = body;
      const cart = await cartService.removeItem(userId, productId, variantId, conn);
      return NextResponse.json({ message: 'Item removed from cart successfully', cart });
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async clearCart(req, _res, _body, conn) {
    try {
      const userId = req.user._id;
      const cart = await cartService.clearCart(userId, conn);
      return NextResponse.json({ message: 'Cart cleared successfully', cart });
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
}

const cartController = new CartController();
export default cartController;
