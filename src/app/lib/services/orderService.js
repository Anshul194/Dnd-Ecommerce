import cartRepository from '../repository/CartRepository';
import OrderRepo from '../repository/OrderRepository';
import { productSchema } from '../models/Product';
import { variantSchema } from '../models/Variant';
import mongoose from 'mongoose';
import Coupon from '../models/Coupon';
import couponRepository from '../repository/CouponRepository';

class OrderService {
  async placeOrder(orderData, Order, conn) {
    try {
      const session = await conn.startSession();
      session.startTransaction();

        const coupon = await this.couponRepository.findByCode(code);
        if (!coupon) {
            throw new Error('Invalid Coupon');
        }

        // Check expiration
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            throw new Error('Coupon has expired');
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            throw new Error('Coupon usage limit exceeded');
        }

        // Check minimum cart value
        if (cart.total < coupon.minCartValue) {
            throw new Error(`Cart value must be at least ${coupon.minCartValue}`);
        }

        const order = await OrderRepo.placeOrder(orderData, Order, conn);
      await cartRepository.clearCart(orderData.userId, conn);

      await session.commitTransaction();
      return order;
    } catch (error) {
      await session.abortTransaction();
      throw new Error('Failed to place order');
    } finally {
      session.endSession();
    }
  }
}

export default new OrderService();
