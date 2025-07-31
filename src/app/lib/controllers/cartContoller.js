import cartService from '../services/CartService.js';
import { NextResponse } from 'next/server';

class CartController {
  async getCart(req, _res, _body, conn) {
    try {
      const userId = req.user._id;
      console.log('Fetching cart for user:', userId, 'Connection:', conn.name || 'global mongoose');
      const cart = await cartService.getCart(userId, conn);
      if (!cart) {
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
      console.log('Adding item for user:', userId, 'Item:', { product, variant, quantity, price }, 'Connection:', conn.name || 'global mongoose');
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
      console.log('Removing item for user:', userId, 'Product:', productId, 'Variant:', variantId, 'Connection:', conn.name || 'global mongoose');
      const cart = await cartService.removeItem(userId, productId, variantId, conn);
      return NextResponse.json({ message: 'Item removed from cart successfully', cart });
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async updateCartById(req, _res, body, cartId, conn) {
    try {
      const userId = req.user._id;
      const { items, couponCode } = body;
      console.log('Updating cart:', cartId, 'for user:', userId, 'Items:', JSON.stringify(items, null, 2), 'Coupon:', couponCode, 'Connection:', conn.name || 'global mongoose');
      const cart = await cartService.updateCartById(cartId, userId, items, couponCode, conn);
      return NextResponse.json({ message: 'Cart updated successfully', cart });
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async clearCart(req, _res, _body, conn) {
    try {
      const userId = req.user._id;
      console.log('Clearing cart for user:', userId, 'Connection:', conn.name || 'global mongoose');
      const cart = await cartService.clearCart(userId, conn);
      return NextResponse.json({ message: 'Cart cleared successfully', cart });
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
}

const cartController = new CartController();
export default cartController;