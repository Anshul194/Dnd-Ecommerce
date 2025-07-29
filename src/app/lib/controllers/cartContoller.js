import cartService from '../services/CartService';
import { NextResponse } from 'next/server';

class CartController {
  async getCart(req) {
    try {
      const userId = req.user._id;
      const cart = await cartService.getCart(userId);
      return NextResponse.json(cart);
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async addItem(req, _res, body,conn) {
    try {
      const userId = req.user._id;
      const { product, variant, quantity, price } = body;
      const cart = await cartService.addItem(userId, { product, variant, quantity, price },conn);
      return NextResponse.json(cart);
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async removeItem(req, _res, body) {
    try {
      const userId = req.user._id;
      const { productId, variantId } = body;
      const cart = await cartService.removeItem(userId, productId, variantId);
      return NextResponse.json(cart);
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  async clearCart(req) {
    try {
      const userId = req.user._id;
      const cart = await cartService.clearCart(userId);
      return NextResponse.json(cart);
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
}

const cartController = new CartController();
export default cartController;
