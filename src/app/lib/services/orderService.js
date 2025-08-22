import mongoose from "mongoose";
import OrderRepository from "../repository/OrderRepository";
import CouponService from "./CouponService";
import EmailService from "./EmailService";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
}, { timestamps: true });

class OrderService {
  constructor(orderRepository, couponService, emailService) {
    this.orderRepository = orderRepository;
    this.couponService = couponService;
    this.emailService = emailService || new EmailService();
  }

  async getTotalOrders(conn) {
    try {
      const Order = conn.models.Order || conn.model('Order', mongoose.model('Order').schema);
      return await Order.countDocuments().exec();
    } catch (error) {
      throw new Error(`Failed to fetch total orders: ${error.message}`);
    }
  }

  async createOrder(data, conn) {
    try {
      const {
        userId,
        items,
        couponCode,
        shippingAddress,
        billingAddress,
        paymentId,
        deliveryOption,
      } = data;

      // Validate required fields
      console.log("Checking order data: ===>");
      console.log(
        userId,
        items,
        items.length,
        shippingAddress,
        billingAddress,
        paymentId,
        deliveryOption
      );
      if (
        !userId ||
        !items ||
        !items.length ||
        !shippingAddress ||
        !billingAddress ||
        !paymentId ||
        !deliveryOption
      ) {
        throw new Error("All required fields must be provided");
      }

      // Validate userId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error(`Invalid userId: ${userId}`);
      }

      // Fetch customer email from User model
      const User = conn.models.User || conn.model('User', UserSchema);
      const user = await User.findById(userId).select('email').exec();
      let customerEmail = null;
      if (user && user.email) {
        customerEmail = user.email;
      }

      // Validate delivery option
      const validDeliveryOptions = [
        "standard_delivery",
        "express_delivery",
        "overnight_delivery",
      ];
      if (!validDeliveryOptions.includes(deliveryOption)) {
        throw new Error("Invalid delivery option");
      }

      // Validate items
      for (const item of items) {
        if (!item.product || !item.quantity || item.quantity <= 0) {
          throw new Error(
            "Each item must have a valid product and positive quantity"
          );
        }
        if (
          item.variantId &&
          !mongoose.Types.ObjectId.isValid(item.variantId)
        ) {
          throw new Error(`Invalid variantId: ${item.variantId}`);
        }
      }

      // Calculate subtotal
      let subtotal = 0;
      const orderItems = [];
      for (const item of items) {
        const { product, variant, quantity } = item;
        let price = 0;
        if (variant) {
          const newVariant = await this.orderRepository.findVariantById(variant);
          price = newVariant.price;
        } else {
          const newProduct = await this.orderRepository.findProductById(product);
          price = newProduct.price;
        }
        orderItems.push({
          product: product,
          variant: variant || null,
          quantity,
          price,
        });
        subtotal += price * quantity;
      }

      // Apply coupon if provided
      let discount = 0;
      let couponId = null;
      if (couponCode) {
        const couponResult = await this.couponService.applyCoupon(
          { code: couponCode, cartValue: subtotal },
          conn
        );
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
        paymentId,
        deliveryOption,
        status: "pending",
      };
      const order = await this.orderRepository.create(orderData);

      // Send email notifications
      const orderDate = new Date().toISOString().split('T')[0];
      const replacements = {
        app_name: 'YourStore', // Replace with your app name
        order_id: order._id.toString(),
        order_url: `https://yourstore.com/orders/${order._id}`, // Replace with your actual order URL
        owner_name: 'Admin', // Replace with actual owner name if available
        order_date: orderDate,
      };

      // Send email to customer
      const customerEmailResult = await this.emailService.sendOrderEmail({
        templateName: 'Order Created',
        to: customerEmail,
        replacements,
        conn,
      });
      if (!customerEmailResult.success) {
        console.error('Failed to send customer email:', customerEmailResult.message);
      }

      // Send email to admin
      const adminEmailResult = await this.emailService.sendOrderEmail({
        templateName: 'Order Created For Owner',
        to: 'smaisuriya1206@gmail.com', 
        replacements,
        conn,
      });
      if (!adminEmailResult.success) {
        console.error('Failed to send admin email:', adminEmailResult.message);
      }

      return {
        success: true,
        message: "Order placed successfully",
        data: { order },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  async getUserOrders(request, conn) {
    try {
      console.log("request user", request.user);
      const userId = request.user?._id;
      console.log("User ID:", userId);
      if (!userId) {
        throw new Error("User authentication required");
      }
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error(`Invalid userId: ${userId}`);
      }
      const searchParams = request.nextUrl.searchParams;
      const {
        page = 1,
        limit = 10,
        filters = "{}",
        sort = "{}",
        populateFields = ["items.product", "items.variant", "coupon"],
        selectFields = {},
      } = Object.fromEntries(searchParams.entries());
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const parsedFilters =
        typeof filters === "string" ? JSON.parse(filters) : filters;
      const parsedSort = typeof sort === "string" ? JSON.parse(sort) : sort;
      const filterConditions = { ...parsedFilters };
      const sortConditions = {};
      for (const [field, direction] of Object.entries(parsedSort)) {
        sortConditions[field] = direction === "asc" ? 1 : -1;
      }
      const { results, totalCount, currentPage, pageSize } =
        await this.orderRepository.getUserOrders(
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
        message: "Orders fetched successfully",
        data: results,
        currentPage,
        totalPages,
        totalCount,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  async getOrderDetails(request, conn, params) {
    try {
      const userId = request.user?._id;
      if (!userId) {
        throw new Error("User authentication required");
      }
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error(`Invalid userId: ${userId}`);
      }
      const { id } = params;
      if (!id) {
        throw new Error("orderId is required");
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid orderId: ${id}`);
      }
      const order = await this.orderRepository.getOrderById(
        id,
        userId,
        ["items.product", "items.variant", "coupon"],
        {}
      );
      return {
        success: true,
        message: "Order details fetched successfully",
        data: order,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  async getRecentOrders(conn) {
    try {
      const orders = await this.orderRepository.getRecentOrders(5, [
        "items.product",
        "items.variant",
        "user",
      ]);
      return orders;
    } catch (error) {
      throw new Error(`Failed to fetch recent orders: ${error.message}`);
    }
  }

  async calculateIncome(filterConditions, conn) {
    try {
      const income = await this.orderRepository.calculateIncome(
        filterConditions
      );
      return income;
    } catch (error) {
      throw new Error(`Failed to calculate income: ${error.message}`);
    }
  }
}

export default OrderService;