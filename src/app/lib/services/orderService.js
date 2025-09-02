import mongoose from "mongoose";
import OrderRepository from "../repository/OrderRepository";
import CouponService from "./CouponService";
import EmailService from "./EmailService";
import { SettingSchema } from "../models/Setting";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

class OrderService {
  constructor(orderRepository, couponService, emailService) {
    this.orderRepository = orderRepository;
    this.couponService = couponService;
    this.emailService = emailService || new EmailService();
  }

  async getTotalOrders(conn) {
    try {
      const Order =
        conn.models.Order ||
        conn.model("Order", mongoose.model("Order").schema);
      return await Order.countDocuments().exec();
    } catch (error) {
      throw new Error(`Failed to fetch total orders: ${error.message}`);
    }
  }

  //checkOrder
  async checkOrder(data, conn) {
    try {
      const {
        userId,
        items,
        couponCode,
        shippingAddress,
        billingAddress,
        deliveryOption,
        paymentMode, // "COD" or "Prepaid"
      } = data;

      // Validate required fields (no paymentId needed here)
      if (
        !userId ||
        !items ||
        !items.length ||
        !shippingAddress ||
        !billingAddress ||
        !deliveryOption ||
        !paymentMode
      ) {
        return {
          success: false,
          message: "All required fields must be provided",
          data: null
        };
      }

      // Validate userId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return {
          success: false,
          message: `Invalid userId: ${userId}`,
          data: null
        };
      }

      // Validate delivery option
      const validDeliveryOptions = [
        "standard_delivery",
        "express_delivery",
        "overnight_delivery",
      ];
      if (!validDeliveryOptions.includes(deliveryOption)) {
        return {
          success: false,
          message: "Invalid delivery option",
          data: null
        };
      }

      // Validate items
      for (const item of items) {
        if (!item.product || !item.quantity || item.quantity <= 0) {
          return {
            success: false,
            message: "Each item must have a valid product and positive quantity",
            data: null
          };
        }
        if (
          item.variantId &&
          !mongoose.Types.ObjectId.isValid(item.variantId)
        ) {
          return {
            success: false,
            message: `Invalid variantId: ${item.variantId}`,
            data: null
          };
        }
      }

      // Fetch settings
     
      const Setting =
        conn.models.Setting || conn.model("Setting", SettingSchema);
      const settings = await Setting.findOne({ tenant }).lean();

      // Calculate subtotal
      let subtotal = 0;
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
        subtotal += price * quantity;
      }

      // Apply coupon if provided
      let discount = 0;
      if (couponCode) {
        const couponResult = await this.couponService.applyCoupon(
          { code: couponCode, cartValue: subtotal },
          conn
        );
        if (!couponResult.success) {
          return {
            success: false,
            message: couponResult.message,
            data: null
          };
        }
        discount = couponResult.data.discount;
      }

      // Calculate order total after discount
      const order_total = subtotal - discount;

      // --- COD Order Limit ---
      if (paymentMode === "COD" && order_total > (settings.codLimit ?? 1500)) {
        return {
          success: false,
          message: "COD not available for orders above ₹1500",
          data: null
        };
      }

      // --- Repeat COD Restriction (per product, within 10 days) ---
      if (paymentMode === "COD" && settings.repeatOrderRestrictionDays) {
        const Order =
          conn.models.Order || conn.model("Order", mongoose.model("Order").schema);
        for (const item of items) {
          const lastOrder = await Order.findOne({
            user: userId,
            paymentMode: "COD",
            "items.product": item.product,
          })
            .sort({ createdAt: -1 })
            .lean();
          if (lastOrder && lastOrder.createdAt) {
            const lastDate = new Date(lastOrder.createdAt);
            const now = new Date();
            const diffDays = (now - lastDate) / (1000 * 60 * 60 * 24);
            if (diffDays < (settings.repeatOrderRestrictionDays ?? 10)) {
              return {
                success: false,
                message: "COD not allowed for this product (ordered within last 10 days)",
                data: null
              };
            }
          }
        }
      }

      // --- Shipping Charges ---
      let shippingCharge = 0;
      if (order_total >= (settings.freeShippingThreshold ?? 500)) {
        shippingCharge = 0;
      } else if (order_total < (settings.freeShippingThreshold ?? 500)) {
        if (paymentMode === "COD") {
          shippingCharge = settings.codShippingChargeBelowThreshold ?? 80;
        } else {
          shippingCharge = settings.prepaidShippingChargeBelowThreshold ?? 40;
        }
      }

      // If all checks pass, return success and calculated charges
      return {
        success: true,
        message: "Order is valid",
        data: {
          order_total,
          shippingCharge,
          discount
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
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
        paymentMode, // must be passed in data: "COD" or "Prepaid"
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
        deliveryOption,
        paymentMode
      );
      if (
        !userId ||
        !items ||
        !items.length ||
        !shippingAddress ||
        !billingAddress ||
        !deliveryOption ||
        !paymentMode
      ) {
        throw new Error("All required fields must be provided");
      }
      // Only require paymentId for Prepaid
      if (paymentMode !== "COD" && !paymentId) {
        throw new Error("paymentId is required for prepaid orders");
      }

      // If COD, generate a random paymentId
      let finalPaymentId = paymentId;
      if (paymentMode === "COD") {
        finalPaymentId =
          paymentId || "COD-" + Math.random().toString(36).substr(2, 12);
      }

      // Validate userId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error(`Invalid userId: ${userId}`);
      }

      // Fetch customer email from User model
      const User = conn.models.User || conn.model("User", UserSchema);
      const user = await User.findById(userId).select("email").exec();
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

      // Fetch settings
      const tenant = "tenant1";
      const Setting =
        conn.models.Setting || conn.model("Setting", SettingSchema);
      const settings = await Setting.findOne({ tenant }).lean();

      // Calculate subtotal
      let subtotal = 0;
      const orderItems = [];
      for (const item of items) {
        const { product, variant, quantity } = item;
        let price = 0;
        if (variant) {
          const newVariant = await this.orderRepository.findVariantById(
            variant
          );
          price = newVariant.price;
        } else {
          const newProduct = await this.orderRepository.findProductById(
            product
          );
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

      // Calculate order total after discount
      const order_total = subtotal - discount;

      // --- COD Order Limit ---
      if (paymentMode === "COD" && order_total > (settings.codLimit ?? 1500)) {
        return {
          success: false,
          message: "COD not available for orders above ₹1500",
          data: null,
        };
      }

      // --- Repeat COD Restriction (per product, within 10 days) ---
      let codBlockedReason = null;
      if (paymentMode === "COD" && settings.repeatOrderRestrictionDays) {
        const Order =
          conn.models.Order || conn.model("Order", mongoose.model("Order").schema);
        for (const item of items) {
          const lastOrder = await Order.findOne({
            user: userId,
            paymentMode: "COD",
            "items.product": item.product,
          })
            .sort({ createdAt: -1 })
            .lean();
          if (lastOrder && lastOrder.createdAt) {
            const lastDate = new Date(lastOrder.createdAt);
            const now = new Date();
            const diffDays = (now - lastDate) / (1000 * 60 * 60 * 24);
            if (diffDays < (settings.repeatOrderRestrictionDays ?? 10)) {
              codBlockedReason = `COD blocked for product ${item.product} (ordered within last ${settings.repeatOrderRestrictionDays} days)`;
              return {
                success: false,
                message: "COD not allowed for this product (ordered within last 10 days)",
                data: null,
              };
            }
          }
        }
      }

      // --- Shipping Charges ---
      let shippingCharge = 0;
      if (order_total >= (settings.freeShippingThreshold ?? 500)) {
        shippingCharge = 0;
      } else if (order_total < (settings.freeShippingThreshold ?? 500)) {
        if (paymentMode === "COD") {
          shippingCharge = settings.codShippingChargeBelowThreshold ?? 80;
        } else {
          shippingCharge = settings.prepaidShippingChargeBelowThreshold ?? 40;
        }
      }

      // --- Create order ---
      const orderData = {
        user: userId,
        items: orderItems,
        total: order_total + shippingCharge,
        coupon: couponId,
        discount,
        shippingAddress,
        billingAddress,
        paymentId: finalPaymentId,
        deliveryOption,
        status: "pending",
        shippingCharge,
        paymentMode,
        codBlockedReason,
      };
      const order = await this.orderRepository.create(orderData);

      // Send email notifications
      const orderDate = new Date().toISOString().split("T")[0];
      const replacements = {
        app_name: "YourStore", // Replace with your app name
        order_id: order._id.toString(),
        order_url: `https://yourstore.com/orders/${order._id}`, // Replace with your actual order URL
        owner_name: "Admin", // Replace with actual owner name if available
        order_date: orderDate,
      };

      // Send email to customer
      const customerEmailResult = await this.emailService.sendOrderEmail({
        templateName: "Order Created",
        to: customerEmail,
        replacements,
        conn,
      });
      if (!customerEmailResult.success) {
        console.error(
          "Failed to send customer email:",
          customerEmailResult.message
        );
      }

      // Send email to admin
      const adminEmailResult = await this.emailService.sendOrderEmail({
        templateName: "Order Created For Owner",
        to: "smaisuriya1206@gmail.com",
        replacements,
        conn,
      });
      if (!adminEmailResult.success) {
        console.error("Failed to send admin email:", adminEmailResult.message);
      }
      try {
        // Only trigger auto-call for COD orders if enabled in settings
        console.log("Triggering auto-call for COD order", settings);
        if (settings.orderConfirmEnabled) {
          const apiUrl = "https://obd-api.myoperator.co/obd-api-v1";
          const payload = {
            company_id: settings.myOperatorCompanyId || "683aebae503f2118",
            secret_token:
              settings.myOperatorSecretToken ||
              "2a67cfdb278391cf9ae47a7fffd6b0ec8d93494ff0004051c0f328a501553c98",
            type: "2",
            number: "+91" + shippingAddress.phoneNumber, // fallback to shipping phone if user phone not present
            public_ivr_id: settings.myOperatorIvrId || "68b0383927f53564",
          };
          console.log("User phone number:", user);
          console.log("Shipping address phone number:", shippingAddress);
          console.log("Auto-call payload:", payload);
          // Use fetch or axios for HTTP request
          const res = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "x-api-key":
                settings.myOperatorApiKey ||
                "oomfKA3I2K6TCJYistHyb7sDf0l0F6c8AZro5DJh",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          const result = await res.json();
          if (!result.success) {
            console.error("Auto-call API failed:", result);
          }
        }
      } catch (err) {
        console.error("Auto-call order confirm error:", err.message);
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
