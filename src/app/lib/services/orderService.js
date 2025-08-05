import mongoose from 'mongoose';
import OrderRepository from '../repository/OrderRepository';
import CouponService from './CouponService';

class OrderService {
  constructor(orderRepository, couponService) {
    this.orderRepository = orderRepository;
    this.couponService = couponService;
  }

  async createOrder(data, conn) {
    try {
      const {
        userId,
        items,
        couponCode,
        shippingAddress,
        billingAddress,
        paymentDetails,
        deliveryOption
      } = data;

      // Validate required fields
      if (!userId || !items || !items.length || !shippingAddress || !billingAddress || !paymentDetails || !deliveryOption) {
        throw new Error('All required fields must be provided');
      }

      // Validate userId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error(`Invalid userId: ${userId}`);
      }

      // Validate delivery option
      const validDeliveryOptions = ['standard_delivery', 'express_delivery', 'overnight_delivery'];
      if (!validDeliveryOptions.includes(deliveryOption)) {
        throw new Error('Invalid delivery option');
      }

      // Validate items
      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity <= 0) {
          throw new Error('Each item must have a valid productId and positive quantity');
        }
        if (item.variantId && !mongoose.Types.ObjectId.isValid(item.variantId)) {
          throw new Error(`Invalid variantId: ${item.variantId}`);
        }
      }

      // Validate payment details (basic format)
      if (!/^\d{16}$/.test(paymentDetails.cardNumber)) {
        throw new Error('Card number must be 16 digits');
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentDetails.expiryDate)) {
        throw new Error('Expiry date must be in MM/YY format');
      }
      if (!/^\d{3}$/.test(paymentDetails.cvv)) {
        throw new Error('CVV must be 3 digits');
      }

      // Calculate subtotal
      let subtotal = 0;
      const orderItems = [];
      for (const item of items) {
        const { productId, variantId, quantity } = item;
        let price = 0;

        if (variantId) {
          const variant = await this.orderRepository.findVariantById(variantId);
          price = variant.price;
        } else {
          const product = await this.orderRepository.findProductById(productId);
          price = product.price;
        }

        orderItems.push({
          product: productId,
          variant: variantId || null,
          quantity,
          price
        });
        subtotal += price * quantity;
      }

      // Apply coupon if provided
      let discount = 0;
      let couponId = null;
      if (couponCode) {
        const couponResult = await this.couponService.applyCoupon({ code: couponCode, cartValue: subtotal }, conn);
        if (!couponResult.success) {
          throw new Error(couponResult.message);
        }
        discount = couponResult.data.discount;
        couponId = couponResult.data.coupon._id;
      }

      // Calculate total
      const total = subtotal - discount;

      // Create order
      const orderData = {
        user: userId,
        items: orderItems,
        total,
        coupon: couponId,
        discount,
        shippingAddress,
        billingAddress,
        paymentDetails,
        deliveryOption,
        status: 'pending'
      };

      const order = await this.orderRepository.create(orderData);

      return {
        success: true,
        message: 'Order placed successfully',
        data: { order }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  async getUserOrders(request, conn) {
    try {
      console.log("request user", request.user);
      const userId = request.user?._id;

      console.log('User ID:', userId);
      if (!userId) {
        throw new Error('User authentication required');
      }
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error(`Invalid userId: ${userId}`);
      }

      const searchParams = request.nextUrl.searchParams;
      const {
        page = 1,
        limit = 10,
        filters = '{}',
        sort = '{}',
        populateFields = ['items.product', 'items.variant', 'coupon'],
        selectFields = {}
      } = Object.fromEntries(searchParams.entries());

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
      const parsedSort = typeof sort === 'string' ? JSON.parse(sort) : sort;

      const filterConditions = { ...parsedFilters };
      const sortConditions = {};
      for (const [field, direction] of Object.entries(parsedSort)) {
        sortConditions[field] = direction === 'asc' ? 1 : -1;
      }

      const { results, totalCount, currentPage, pageSize } = await this.orderRepository.getUserOrders(
        userId,
        filterConditions,
        sortConditions,
        pageNum,
        limitNum,
        populateFields,
        selectFields
      );

      const totalPages = Math.ceil(totalCount / limitNum);

      return {
        success: true,
        message: 'Orders fetched successfully',
        data: results,
        currentPage,
        totalPages,
        totalCount
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  async getOrderDetails(request, conn, params) {
    try {
      const userId = request.user?._id;
      if (!userId) {
        throw new Error('User authentication required');
      }
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error(`Invalid userId: ${userId}`);
      }

      const { id } = params;
      if (!id) {
        throw new Error('orderId is required');
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid orderId: ${id}`);
      }

      const order = await this.orderRepository.getOrderById(
        id,
        userId,
        ['items.product', 'items.variant', 'coupon'],
        {}
      );

      return {
        success: true,
        message: 'Order details fetched successfully',
        data: order
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  async getRecentOrders(conn) {
    try {
      const orders = await this.orderRepository.getRecentOrders(5, ['items.product', 'items.variant', 'user']);
      return orders;
    } catch (error) {
      throw new Error(`Failed to fetch recent orders: ${error.message}`);
    }
  }

  async calculateIncome(filterConditions, conn) {
    try {
      const income = await this.orderRepository.calculateIncome(filterConditions);
      return income;
    } catch (error) {
      throw new Error(`Failed to calculate income: ${error.message}`);
    }
  }
}

export default OrderService;
