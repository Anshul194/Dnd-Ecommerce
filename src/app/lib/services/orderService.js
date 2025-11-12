import mongoose from "mongoose";
import { OrderSchema } from "../models/Order.js";
import OrderRepository from "../repository/OrderRepository";
import CouponService from "./CouponService";
import EmailService from "./EmailService";
import { SettingSchema } from "../models/Setting";
import axios from "axios";
import https from "https"; // if using ES modules
import { ShippingSchema } from "../models/Shipping.js";
import path from "path";
import fs from "fs";
import { current } from "@reduxjs/toolkit";

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
      const Order = conn.models.Order || conn.model("Order", OrderSchema);
      return await Order.countDocuments().exec();
    } catch (error) {
      throw new Error(`Failed to fetch total orders: ${error.message}`);
    }
  }

  //checkOrder
  async checkOrder(data, conn, tenant) {
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
          data: null,
        };
      }

      // Validate userId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return {
          success: false,
          message: `Invalid userId: ${userId}`,
          data: null,
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
          data: null,
        };
      }

      // Validate items
      for (const item of items) {
        if (!item.product || !item.quantity || item.quantity <= 0) {
          return {
            success: false,
            message:
              "Each item must have a valid product and positive quantity",
            data: null,
          };
        }
        if (
          item.variantId &&
          !mongoose.Types.ObjectId.isValid(item.variantId)
        ) {
          return {
            success: false,
            message: `Invalid variantId: ${item.variantId}`,
            data: null,
          };
        }
      }

      // --- Postal code shipping method selection ---
      const ShippingZone =
        conn.models.ShippingZone ||
        conn.model(
          "ShippingZone",
          require("../models/ShippingZone.js").shippingZoneSchema
        );
      const Shipping =
        conn.models.Shipping ||
        conn.model("Shipping", require("../models/Shipping.js").shippingSchema);

      const userPostalCode = shippingAddress?.postalCode?.toString().trim();
      if (!userPostalCode) {
        return {
          success: false,
          message: "Postal code is required in shipping address",
          data: null,
        };
      }

      // Find all shipping zones containing this postal code
      const zones = await ShippingZone.find({
        "postalCodes.code": userPostalCode,
      }).lean();
      if (!zones || zones.length === 0) {
        return {
          success: false,
          message: "Delivery not available for this postal code",
          data: null,
        };
      }

      // Get all shippingIds from zones
      const shippingIds = zones.map((z) => z.shippingId);

      // Fetch all shipping methods for these IDs and sort by priority DESC
      const shippingMethods = await Shipping.find({
        _id: { $in: shippingIds },
        status: "active",
      })
        .sort({ priority: -1 })
        .lean();
      if (!shippingMethods || shippingMethods.length === 0) {
        return {
          success: false,
          message: "No active shipping method found for this postal code",
          data: null,
        };
      }

      // Pick the highest priority shipping method
      const selectedShipping = shippingMethods[0];

      // Fetch settings

      console.log("check tenant for setting ==> " , tenant)
      const Setting =
        conn.models.Setting || conn.model("Setting", SettingSchema);
      const settings = await Setting.findOne({ tenant }).lean();

      // Calculate subtotal - use the total from frontend if provided, otherwise calculate
      let subtotal = 0;
      if (data.total) {
        subtotal = data.total;
      } else {
        for (const item of items) {
          const { product, variant, quantity, price } = item;
          let itemPrice = price || 0;
          if (!itemPrice) {
            if (variant) {
              const newVariant = await this.orderRepository.findVariantById(
                variant
              );
              itemPrice = newVariant.price;
            } else {
              const newProduct = await this.orderRepository.findProductById(
                product
              );
              itemPrice = newProduct.price;
            }
          }
          subtotal += itemPrice * quantity;
        }
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
            data: null,
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
          data: null,
        };
      }

      // --- Repeat COD Restriction (per product, within 10 days) ---
      if (paymentMode === "COD" && settings.repeatOrderRestrictionDays) {
        const Order = conn.models.Order || conn.model("Order", OrderSchema);
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
                message:
                  "COD not allowed for this product (ordered within last 10 days)",
                data: null,
              };
            }
          }
        }
      }

      console.log("settings ===> " , settings)

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
          discount,
          shippingMethod: selectedShipping.shippingMethod,
          shippingId: selectedShipping._id,
          shippingName: selectedShipping.name,
          shippingPriority: selectedShipping.priority,
        },
      };
    } catch (error) {
      console.log("error in check api ", error);
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  async createOrder(data, conn, tenant) {
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

      // --- Postal code shipping method selection ---
      const ShippingZone =
        conn.models.ShippingZone ||
        conn.model(
          "ShippingZone",
          require("../models/ShippingZone.js").shippingZoneSchema
        );
      const Shipping =
        conn.models.Shipping ||
        conn.model("Shipping", require("../models/Shipping.js").shippingSchema);

      const userPostalCode = shippingAddress?.postalCode?.toString().trim();
      if (!userPostalCode) {
        throw new Error("Postal code is required in shipping address");
      }

      // Find all shipping zones containing this postal code
      const zones = await ShippingZone.find({
        "postalCodes.code": userPostalCode,
      }).lean();
      if (!zones || zones.length === 0) {
        return {
          success: false,
          message: "Delivery not available for this postal code",
          data: null,
        };
      }

      // Get all shippingIds from zones
      const shippingIds = zones.map((z) => z.shippingId);

      // Fetch all shipping methods for these IDs and sort by priority DESC
      const shippingMethods = await Shipping.find({
        _id: { $in: shippingIds },
        status: "active",
      })
        .sort({ priority: -1 })
        .lean();
      if (!shippingMethods || shippingMethods.length === 0) {
        return {
          success: false,
          message: "No active shipping method found for this postal code",
          data: null,
        };
      }

      // Pick the highest priority shipping method
      const selectedShipping = shippingMethods[0];

      // Fetch settings

      const Setting =
        conn.models.Setting || conn.model("Setting", SettingSchema);
      const settings = await Setting.findOne({ tenant }).lean();

      // Calculate subtotal - use the total from frontend if provided, otherwise calculate
      let subtotal = 0;
      const orderItems = [];

      if (data.total) {
        subtotal = data.total;
        // Still create orderItems array for database storage
        for (const item of items) {
          const { product, variant, quantity, price } = item;
          orderItems.push({
            product: product,
            variant: variant || null,
            quantity,
            price: price || 0,
          });
        }
      } else {
        for (const item of items) {
          const { product, variant, quantity, price } = item;
          let itemPrice = price || 0;
          if (!itemPrice) {
            if (variant) {
              const newVariant = await this.orderRepository.findVariantById(
                variant
              );
              itemPrice = newVariant.price;
            } else {
              const newProduct = await this.orderRepository.findProductById(
                product
              );
              itemPrice = newProduct.price;
            }
          }
          orderItems.push({
            product: product,
            variant: variant || null,
            quantity,
            price: itemPrice,
          });
          subtotal += itemPrice * quantity;
        }
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
        const Order = conn.models.Order || conn.model("Order", OrderSchema);
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
                message:
                  "COD not allowed for this product (ordered within last 10 days)",
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
        // --- Save shipping method details ---
        shippingMethod: selectedShipping.shippingMethod,
        shippingId: selectedShipping._id,
        shippingName: selectedShipping.name,
        shippingPriority: selectedShipping.priority,
      };
      console.log("data before repo ===> ", orderData);
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
          console.log("Auto-call API response:", result);
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
      const { id } = await params;
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

  async getOrderById(orderId, userId, populateFields = [], selectFields = {}) {
    try {
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new Error(`Invalid orderId: ${orderId}`);
      }
      if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error(`Invalid userId: ${userId}`);
      }

      const order = await this.orderRepository.getOrderById(
        orderId,
        userId,
        populateFields,
        selectFields
      );

      return {
        success: true,
        message: "Order fetched successfully",
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

  // Fetch DTDC services
  async getDtdcServices(order) {
    console.log("order in dtdc ====>", order);
    if (!order?.data?.shippingAddress?.postalCode) {
      throw new Error("Shipping address or postal code is missing");
    }
    console.log(
      "Fetching DTDC services for order:",
      order.data.shippingAddress.postalCode
    );
    const originPincode = "110001";
    const destinationPincode = order?.data?.shippingAddress?.postalCode; // replace if needed

    const resp = await axios.post(
      "http://smarttrack.ctbsplus.dtdc.com/ratecalapi/PincodeApiCall",
      { orgPincode: originPincode, desPincode: destinationPincode }
    );
    // console.log('DTDC response:', resp.data);

    const services = resp.data.SERV_LIST_DTLS || [];
    // console.log('Services:', services);
    return services.map((s) => ({
      code: s.CODE,
      name: s.NAME,
      courier: "DTDC",
      priority: 0, // default, will override from ShippingModel
    }));
  }

  // Fetch Delhivery services
  async getDtdcServices(order) {
    console.log(
      "Fetching DTDC services for order:",
      order?.data?.shippingAddress?.postalCode
    );
    const originPincode = "110001";
    const destinationPincode = order?.data?.shippingAddress.postalCode; // replace if needed

    const resp = await axios.post(
      "http://smarttrack.ctbsplus.dtdc.com/ratecalapi/PincodeApiCall",
      { orgPincode: originPincode, desPincode: destinationPincode }
    );
    // console.log('DTDC response:', resp.data);

    const services = resp.data.SERV_LIST_DTLS || [];
    // console.log('Services:', services);
    return services.map((s) => ({
      code: s.CODE,
      name: s.NAME,
      courier: "DTDC",
      priority: 0, // default, will override from ShippingModel
    }));
  }
  // Fetch Bluedart services
  async getBluedartServices(order) {
    try {
      const originPincode = process.env.BLUEDART_ORIGIN_PINCODE || "110001";
      const destinationPincode = order?.data?.shippingAddress?.postalCode;

      if (!destinationPincode) {
        throw new Error(
          "Destination postal code missing for Bluedart service check"
        );
      }

      // Generate JWT Token (assuming you store in ENV or helper)
      const tokenResp = await axios.post(
        process.env.BLUEDART_AUTH_URL, // e.g. https://api.bluedart.com/Authenticate
        {
          client_id: process.env.BLUEDART_CLIENT_ID,
          client_secret: process.env.BLUEDART_CLIENT_SECRET,
        }
      );
      const jwtToken = tokenResp.data?.access_token;

      const resp = await axios.post(
        process.env.BLUEDART_API_URL + "/GetServicesforPincodeAndProduct",
        {
          OriginPincode: originPincode,
          DestinationPincode: destinationPincode,
          ProductCode: "A", // Example product code (A = Express)
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const services = resp.data?.Services || [];
      return services.map((s) => ({
        code: s.ServiceCode,
        name: s.ServiceName,
        courier: "BLUEDART",
        priority: 0,
      }));
    } catch (error) {
      console.error("Bluedart service fetch error:", error.message);
      return [];
    }
  }

  // Fetch all shipping methods with priority from DB
  async attachPriority(services, conn, tenant) {
    const Shipping =
      conn.models.Shipping || conn.model("Shipping", ShippingSchema);
    const shippings = await Shipping.find({ status: "active" }).lean();

    return services.map((s) => {
      const match = shippings.find(
        (sh) =>
          sh.carrier.toUpperCase() === s.courier.toUpperCase() &&
          sh.shippingMethod.toLowerCase().includes(s.name.toLowerCase())
      );
      return { ...s, priority: match ? match.priority : 0 };
    });
  }

  async getDelhiveryServices(order) {
    const originPincode = "110001";
    const destinationPincode = order?.data?.shippingAddress?.postalCode; // replace if needed
    const agent = new https.Agent({ rejectUnauthorized: false });
    return [
      { code: "SD1", name: "Express", courier: "DELHIVERY", priority: 0 },
      { code: "SD2", name: "Standard", courier: "DELHIVERY", priority: 0 },
    ];
    const headers = { Authorization: `Token ${process.env.DELHIVERY_TOKEN}` };
    const [originResp, destResp] = await Promise.all([
      axios.get(
        `https://staging-express.delhivery.com/c/api/pin-codes/json/?filter_codes=${originPincode}`,
        { headers, httpsAgent: agent }
      ),
      axios.get(
        `https://staging-express.delhivery.com/c/api/pin-codes/json/?filter_codes=${destinationPincode}`,
        { headers, httpsAgent: agent }
      ),
    ]);

    console.log("Delhivery origin response:", originResp);
    console.log("Delhivery destination response:", destResp);

    const serviceable =
      originResp.data.success &&
      destResp.data.success &&
      originResp.data.data[0].serviceable === "Y" &&
      destResp.data.data[0].serviceable === "Y";

    if (!serviceable) return [];

    return [
      { code: "SD1", name: "Express", courier: "DELHIVERY", priority: 0 },
      { code: "SD2", name: "Standard", courier: "DELHIVERY", priority: 0 },
    ];
  }

  //getServiceOptions
  async getServiceOptions(order, conn, tenant) {
    let services = [];

    const [dtdc, delhivery, bluedart] = await Promise.all([
      this.getDtdcServices(order),
      this.getDelhiveryServices(order),
      this.getBluedartServices(order),
    ]);

    services = [...dtdc, ...delhivery, ...bluedart];
    services = await this.attachPriority(services, conn, tenant);

    // Sort by priority (highest first)
    services.sort((a, b) => b.priority - a.priority);

    return services;
  }

  //getOrderForTracking
  async getAllOrdersForTracking(request, conn)  
      {
    try {
      // Ensure User model is registered on this connection so populate('user') works
      const User = conn.models.User || conn.model("User", UserSchema);

      const orders = await this.orderRepository.getAllOrdersForTracking([
        "items.product",
        "items.variant",
        "user",
      ]);
      console.log("Orders for tracking fetched:", orders.length);
      return {
        success: true,
        message: "All orders for tracking fetched successfully",
        data: orders,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }
  

  async getAllOrders(request, conn) {
    try {
      const searchParams = request.nextUrl.searchParams;
      const {
        page = 1,
        limit = 10,
        filters = "{}",
        sort = "{}",
        populateFields = ["items.product", "items.variant", "coupon", "user"],
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
        await this.orderRepository.getAllOrders(
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
        message: "All orders fetched successfully",
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

  /**
   * Create Shipment on the selected courier
   */
  async createShipment(order, courier, serviceCode) {
    switch (courier.toUpperCase()) {
      case "DTDC":
        return this.createDtdcShipment(order, serviceCode);
      case "DELHIVERY":
        return this.createDelhiveryShipment(order, serviceCode);
      case "BLUEDART":
        return this.createBluedartShipment(order, serviceCode);
      default:
        throw new Error("Unsupported courier");
    }
  }

  //generateLabel
  async generateLabel(order, courier, data) {
    switch (courier.toUpperCase()) {
      case "DTDC":
        return this.generateDtdcLabel(order, data);
      case "DELHIVERY":
        return this.generateDelhiveryLabel(order, data);
      case "BLUEDART":
        return this.generateBluedartLabel(order, data);
      default:
        throw new Error("Unsupported courier for label generation");
    }
  }

  // DTDC label generation
  async generateDtdcLabel(order, data) {
    // data.labelCode should be present
    if (!data?.labelCode) {
      throw new Error("labelCode is required for DTDC label generation");
    }
    const apiKey = process.env.DTDC_API_KEY;
    const referenceNumber = encodeURIComponent(
      order.shipping_details.reference_number
    );
    const labelCode = data.labelCode || "SHIP_LABEL_4X6"; // default to A4Z
    const labelFormat = "pdf";
    const url = `https://pxapi.dtdc.in/api/customer/integration/consignment/shippinglabel/stream?reference_number=${referenceNumber}&label_code=${labelCode}&label_format=${labelFormat}`;

    // Use GET request for label streaming
    const res = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      responseType: "arraybuffer", // PDF stream
    });

    // console.log("DTDC label response status:", res.data);

    const labelDir = path.join(process.cwd(), "public/labels");
    if (!fs.existsSync(labelDir)) fs.mkdirSync(labelDir, { recursive: true });

    const fileName = `DTDC_${order._id}_${Date.now()}.pdf`;
    const filePath = path.join(labelDir, fileName);

    // Write binary data to file
    fs.writeFileSync(filePath, res.data);

    // Optionally make a public URL (if served via Express static)
    const labelUrl = `/labels/${fileName}`;
    const shippingDetails = {
      ...order.shipping_details,
      labelUrl: labelUrl,
    };

    //update order with label URL
    await this.orderRepository.updateOrder(order._id, {
      shipping_details: shippingDetails,
    });

    // Return PDF buffer and label URL
    return {
      success: true,
      message: "DTDC label generated successfully",
      // labelBuffer: res.data,
      labelUrl: labelUrl,
      reference_number: order.shipping_details.reference_number,
    };
  }

  // Delhivery label generation

  async generateDelhiveryLabel(order) {
    try {
      console.log("=== DELHIVERY LABEL GENERATION DEBUG ===");

      // --- 1️⃣ Collect all waybills dynamically from order ---
      let waybills = [];
      if (order?.shipping_details?.waybill) {
        waybills.push(order.shipping_details.waybill);
      }
      if (order?.shipping_details?.raw_response?.packages) {
        const packageWaybills = order.shipping_details.raw_response.packages
          .map((pkg) => pkg.waybill)
          .filter(Boolean);
        waybills.push(...packageWaybills);
      }
      waybills = [...new Set(waybills)];
      console.log("Found waybills:", waybills);

      if (!waybills.length) throw new Error("No waybill numbers found");

      const joined = waybills.join(",");
      const token = process.env.DELHIVERY_API_TOKEN;

      // --- 2️⃣ Fetch packing slip metadata (NOT PDF) ---
      const slipApi = `https://track.delhivery.com/api/p/packing_slip?wbns=${joined}&pdf=true&pdf_size=A6`;
      console.log("Fetching packing slip metadata:", slipApi);

      const res = await axios.get(slipApi, {
        headers: { Authorization: `Token ${token}` },
      });

      console.log("Packing slip API response status:", res);

      if (res.status !== 200 || !res.data) {
        throw new Error("Failed to fetch packing slip data");
      }

      // --- 3️⃣ Log full response to see structure ---
      console.log("Full API response:", JSON.stringify(res.data, null, 2));

      // --- 4️⃣ Extract packages ---
      const packages = res.data.packages || [];
      if (!packages.length) {
        throw new Error("No packages found in response");
      }

      console.log("Packages data:", JSON.stringify(packages, null, 2));

      // --- 5️⃣ Collect all PDF links ---
      const pdfLinks = packages
        .map((pkg) => pkg.pdf_download_link)
        .filter(Boolean);

      if (!pdfLinks.length) {
        throw new Error("No PDF download links found in packages");
      }

      console.log("✅ PDF download links obtained:", pdfLinks);

      // --- 6️⃣ Update order with label URL ---
      const primaryLabelUrl = pdfLinks[0]; // Use first PDF link as primary
      const shippingDetails = {
        ...order.shipping_details,
        labelUrl: primaryLabelUrl,
      };

      // Update order with label URL
      await this.orderRepository.updateOrder(order._id, {
        shipping_details: shippingDetails,
      });

      console.log("✅ Order updated with label URL:", primaryLabelUrl);

      // --- 7️⃣ Return the download link(s) ---
      return {
        success: true,
        message: "Delhivery packing slip link(s) generated successfully",
        waybills,
        pdfDownloadLinks: pdfLinks,
        primaryLink: primaryLabelUrl,
        labelUrl: primaryLabelUrl, // Added for consistency with other courier methods
        packages: packages.map((pkg) => ({
          wbn: pkg.wbn,
          pdf_download_link: pkg.pdf_download_link,
        })),
      };
    } catch (error) {
      console.error("❌ Delhivery label generation failed:", error.message);
      console.error("Stack trace:", error.stack);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Bluedart label generation (stub)
  async generateBluedartLabel(order, data) {
    // For now, return static response
    return {
      success: true,
      message: "Bluedart label generation not implemented yet",
      labelUrl: "https://bluedart.com/static-label.pdf",
    };
  }

  //trackShipment
  async trackShipment(order, trackingNumber) {
    const courier = order?.shipping_details?.platform;
    // console.log("Tracking shipment for courier:", courier);
    if (!courier) {
      throw new Error("Courier information missing in order");
    }
    if (!trackingNumber) {
      throw new Error("Tracking number is required for tracking");
    }
    switch (courier.toUpperCase()) {
      case "DTDC":
        return this.trackDtdcShipment(order);
      case "DELHIVERY":
        return this.trackDelhiveryShipment(order);
      case "BLUEDART":
        return this.trackBluedartShipment(order);
      default:
        throw new Error("Unsupported courier for tracking");
    }
  }

  // DTDC tracking
  async trackDtdcShipment(order) {
    // console.log("Tracking DTDC shipment for order:", order);
    // You should store DTDC tracking username/password in env
    const username = process.env.DTDC_TRACK_USERNAME;
    const password = process.env.DTDC_TRACK_PASSWORD;
    if (!username || !password) {
      throw new Error("DTDC tracking credentials missing in environment");
    }
    const referenceNumber = order?.shipping_details?.reference_number;
    if (!referenceNumber) {
      throw new Error("Order missing DTDC reference number");
    }

    // console.log("DTDC tracking reference number:", referenceNumber);

    // Step 1: Authenticate to get token
    const authUrl = `https://blktracksvc.dtdc.com/dtdc-api/api/dtdc/authenticate?username=${encodeURIComponent(
      username
    )}&password=${encodeURIComponent(password)}`;
    // console.log("DTDC auth URL:", authUrl);
    const authResp = await axios.get(authUrl);
    // console.log("DTDC auth response:", authResp.data);
    const token = process.env.DTDC_TRACK_TOKEN || authResp.data;
    if (!token) {
      throw new Error("Failed to get DTDC tracking token");
    }

    // Step 2: Get tracking details
    const trackUrl =
      "https://blktracksvc.dtdc.com/dtdc-api/rest/JSONCnTrk/getTrackDetails";
    const payload = {
      trkType: "cnno",
      strcnno: referenceNumber,
      addtnlDtl: "Y",
    };
    const trackResp = await axios.post(trackUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token,
      },
    });
    // Build structured status history from DTDC response and persist to order
    const header = trackResp.data?.trackHeader || {};
    const details = Array.isArray(trackResp.data?.trackDetails)
      ? trackResp.data.trackDetails.slice()
      : [];

    // helper to parse DTDC date/time formats like "06112025" and "1252"
    function parseDtdcDate(dateStr, timeStr) {
      if (!dateStr) return null;
      // expect DDMMYYYY (8 chars) or DDM M? fallback
      const d = dateStr.length === 8 ? dateStr.slice(0, 2) : dateStr.slice(0, 2);
      const m = dateStr.length === 8 ? dateStr.slice(2, 4) : dateStr.slice(2, 4);
      const y = dateStr.length === 8 ? dateStr.slice(4) : dateStr.slice(4);
      const hh = (timeStr && timeStr.length >= 2) ? timeStr.slice(0, 2) : "00";
      const mm = (timeStr && timeStr.length >= 4) ? timeStr.slice(2, 4) : "00";
      // return ISO string (UTC)
      const iso = new Date(`${y}-${m}-${d}T${hh}:${mm}:00Z`);
      return isNaN(iso.getTime()) ? null : iso.toISOString();
    }

    // map DTDC track details to a normalized history array
    const statusHistory = details.map((d) => {
      return {
        code: d.strCode || d.strActionCode || null,
        action: d.strAction || d.strAction || null,
        manifest: d.strManifestNo || null,
        origin: d.strOrigin || null,
        destination: d.strDestination || null,
        actionDate: parseDtdcDate(d.strActionDate || d.strActionDate, d.strActionTime || d.strActionTime),
        remarks: d.sTrRemarks || d.strRemarks || null,
        latitude: d.strLatitude || null,
        longitude: d.strLongitude || null,
        raw: d,
      };
    });

    // include header summary as the latest/top-level status entry (if present)
    if (header && Object.keys(header).length) {
      const headerDate = parseDtdcDate(header.strStatusTransOn || header.strExpectedDeliveryDate, header.strStatusTransTime || header.strStatusTransTime);
      statusHistory.push({
        code: header.strStatusRelCode || null,
        action: header.strStatus || header.strCNProduct || null,
        manifest: header.strRtoNumber || header.strRefNo || null,
        origin: header.strOrigin || null,
        destination: header.strDestination || null,
        actionDate: headerDate,
        remarks: header.strRemarks || null,
        raw: header,
      });
    }

    // sort history by date asc (oldest first). items with null date go to end.
    statusHistory.sort((a, b) => {
      if (!a.actionDate && !b.actionDate) return 0;
      if (!a.actionDate) return 1;
      if (!b.actionDate) return -1;
      return new Date(a.actionDate) - new Date(b.actionDate);
    });

    // derive a friendly current status (prefer header.strStatus, fallback to last history action)
    const latestStatus =
      header.strStatus ||
      statusHistory.length
        ? (statusHistory[statusHistory.length - 1]?.action || statusHistory[statusHistory.length - 1]?.raw?.strAction || null)
        : null;

    // ensure the response has a place where existing code expects statusDescription
    if (Array.isArray(trackResp.data.trackDetails) && trackResp.data.trackDetails.length) {
      trackResp.data.trackDetails[0].statusDescription = trackResp.data.trackDetails[0].statusDescription || latestStatus;
    } else {
      // create a synthetic entry so downstream code can read statusDescription
      trackResp.data.trackDetails = [{ statusDescription: latestStatus }];
    }

    // prepare shipping_details payload and persist
    const shippingDetails = {
      ...order.shipping_details,
      platform: order.shipping_details?.platform || "dtdc",
      reference_number: header.strShipmentNo || header.strRefNo || order.shipping_details?.reference_number || null,
      tracking_url: order.shipping_details?.tracking_url || `https://www.dtdc.in/tracking?awb=${header.strShipmentNo || header.strRefNo || ""}`,
      status_history: statusHistory,
      current_status: latestStatus || order.status || "unknown",
      last_updated: new Date().toISOString(),
      raw_response: trackResp.data,
    };

    // console.log("DTDC tracking details to be saved:", shippingDetails);

    await this.orderRepository.updateOrder(order._id, { shipping_details: shippingDetails });
    

    return {
      success: true,
      message: "DTDC tracking fetched successfully",
      trackingNumber: referenceNumber,
    };
  }

  // Delhivery tracking
  async trackDelhiveryShipment(order) {
    try {
      const referenceNumber = order?.shipping_details?.reference_number;
      if (!referenceNumber) {
        throw new Error("Reference number not found in order shipping details");
      }

      const apiUrl = `https://track.delhivery.com/api/v1/packages/json/?waybill=${referenceNumber}`;

      console.log("Fetching Delhivery tracking for waybill:", referenceNumber);
console.log("Delhivery tracking API URL:", apiUrl);
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Token ${process.env.DELHIVERY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      // Normalize response payload (supporting various shapes)
      const respData = response.data || {};
      const shipmentArray =
        Array.isArray(respData.ShipmentData) && respData.ShipmentData.length
          ? respData.ShipmentData
          : respData.ShipmentData
          ? [respData.ShipmentData]
          : respData.Shipment
          ? [{ Shipment: respData.Shipment }]
          : [];

      const firstEntry = shipmentArray[0];
      const shipment = firstEntry ? firstEntry.Shipment || firstEntry : null;

      // Build status history from Scans and top-level Status
      const statusHistory = [];

      if (shipment?.Scans && Array.isArray(shipment.Scans)) {
        for (const scanWrapper of shipment.Scans) {
          const sd = scanWrapper?.ScanDetail || scanWrapper;
          const dateStr = sd?.ScanDateTime || sd?.StatusDateTime || null;
          statusHistory.push({
        code: sd?.StatusCode || null,
        action: sd?.Scan || sd?.ScanType || sd?.Status || null,
        manifest: shipment?.AWB || shipment?.ReferenceNo || null,
        origin: sd?.ScannedLocation || shipment?.Origin || shipment?.PickupLocation || null,
        destination:
          shipment?.Consignee?.City ||
          shipment?.Destination ||
          (shipment?.Consignee?.PinCode ? String(shipment.Consignee.PinCode) : null),
        actionDate: dateStr ? new Date(dateStr).toISOString() : null,
        remarks: sd?.Instructions || sd?.Remarks || null,
        raw: sd,
          });
        }
      }

      if (shipment?.Status) {
        const s = shipment.Status;
        const dateStr = s?.StatusDateTime || s?.StatusDateTime || null;
        statusHistory.push({
          code: s?.StatusCode || null,
          action: s?.Status || s?.StatusType || null,
          manifest: shipment?.AWB || shipment?.ReferenceNo || null,
          origin: s?.StatusLocation || shipment?.Origin || null,
          destination: shipment?.Consignee?.City || shipment?.Destination || null,
          actionDate: dateStr ? new Date(dateStr).toISOString() : null,
          remarks: s?.Instructions || null,
          raw: s,
        });
      }

      // sort by date ascending (oldest first). Null dates go to end.
      statusHistory.sort((a, b) => {
        if (!a.actionDate && !b.actionDate) return 0;
        if (!a.actionDate) return 1;
        if (!b.actionDate) return -1;
        return new Date(a.actionDate) - new Date(b.actionDate);
      });

      // derive readable latest status
      const latestStatus =
        (shipment?.Status && shipment.Status.Status) ||
        (statusHistory.length ? statusHistory[statusHistory.length - 1]?.action : null) ||
        null;

      // prepare shipping_details payload for DB
      const referenceNum = shipment?.AWB || shipment?.ReferenceNo || referenceNumber;
      const shippingDetails = {
        ...order.shipping_details,
        platform: "delhivery",
        reference_number: referenceNum,
        waybill: shipment?.AWB || shippingDetails?.waybill || referenceNum,
        tracking_url: `https://track.delhivery.com/api/v1/packages/json/?waybill=${referenceNum}`,
        status_history: statusHistory,
        current_status: latestStatus || order.status || "unknown",
        last_updated: new Date().toISOString(),
        raw_response: respData,
      };

      // persist shipping details to order
      await this.orderRepository.updateOrder(order._id, { shipping_details: shippingDetails });

      

      return {
        success: true,
        message: "Delhivery tracking fetched successfully",
        trackingNumber: referenceNumber,
        data: response.data,
      };
    } catch (error) {
      console.error("Delhivery tracking failed:", error);
      return {
        success: false,
        message: `Delhivery tracking failed: ${error.message}`,
        trackingNumber: order?.shipping_details?.waybill || "",
        data: {},
        error: error.message,
      };
    }
  }

  // Bluedart tracking (stub)
  async trackBluedartShipment(order) {
    // For now, return static response
    return {
      success: true,
      message: "Bluedart tracking not implemented yet",
      trackingNumber: order?.shipping_details?.reference_number || "",
      data: {},
    };
  }

  // ========== Build Common Helpers ========== //
  async buildProductDescription(order) {
    console.log("Building product description for order:", order);

    return order?.items
      ?.map((i) => `${i.quantity}x ${i.product?.name || "Item"}`)
      .join(", ");
  }

  async buildPiecesDetail(order) {
    console.log(
      "Building pieces detail for order:",
      order.items.map((i) => ({
        description: i.product?.name || "Product",
        declared_value: i.price.toString(),
        weight: (i.price / 1000).toFixed(2), // dummy logic: price ≈ weight/1000
        height: "5",
        length: "5",
        width: "5",
      }))
    );
    return order.items.map((i) => ({
      description: i.product?.name || "Product",
      declared_value: i.price.toString(),
      weight: (i.price / 1000).toFixed(2), // dummy logic: price ≈ weight/1000
      height: "5",
      length: "5",
      width: "5",
    }));
  }

  // ========== DELHIVERY SERVICE ========== //
  // ✅ Create Delhivery Shipment (Single or Multi-Package)

  // 📦 Create Delhivery Shipment (Supports MPS)
  async createDelhiveryShipment(order, shipping) {
    try {
      console.log("Creating Delhivery shipment for order:", order);

      const isCOD = order.paymentMode === "COD";
      const packageCount = order.items?.length > 1 ? order.items.length : 1;

      // --- 1️⃣ Get Waybills ---
      const waybillsResp = await this.getDelhiveryWaybill(packageCount);
      const waybills = Array.isArray(waybillsResp)
        ? waybillsResp
        : typeof waybillsResp === "string"
        ? waybillsResp.split(",").map((w) => w.trim())
        : [];

      if (!waybills.length)
        throw new Error("Failed to get Delhivery waybill numbers");

      const masterWaybill = waybills[0];
      const childrenWaybills = waybills.slice(1);

      // --- 2️⃣ Verify Serviceability ---
      const pin = order.shippingAddress.postalCode;
      const serviceResp = await axios.get(
        `https://track.delhivery.com/c/api/pin-codes/json/?token=${process.env.DELHIVERY_API_TOKEN}&filter_codes=${pin}`
      );

      const serviceData = serviceResp.data.delivery_codes?.[0]?.postal_code;
      console.log(
        "📦 Checking Delhivery serviceability for PIN:",
        pin,
        serviceData
      );

      if (!serviceData)
        throw new Error(`Invalid response received for PIN ${pin}`);

      const isServiceable =
        serviceData.pre_paid === "Y" ||
        serviceData.cod === "Y" ||
        serviceData.pickup === "Y";

      if (!isServiceable || serviceData.is_oda === "Y")
        throw new Error(
          `Destination PIN ${pin} is not serviceable by Delhivery`
        );

      // --- 3️⃣ Build Pickup Location ---
      const pickup_location = {
        name: "BHARATGRAM B2C",
        add: "34 GOHANA VPO THASKA MAHARA, GOHANA VPO THASKA MAHARA, Sonipat, HARYANA, India 131301",
        city: "SONEPAT",
        pin: "131301",
        country: "India",
        phone: order.billingAddress.phoneNumber || "9999999999",
      };

      // --- 4️⃣ Build Shipments Array ---
      const shipments = [];

      // 🧱 Master Shipment
      shipments.push({
        waybill: masterWaybill,
        order: `${order._id}-MASTER`,
        weight: Math.max(100, Math.round(order.total / 10)),
        shipment_height: shipping?.dimensions?.height || 10,
        shipment_width: shipping?.dimensions?.width || 11,
        shipment_length: shipping?.dimensions?.length || 12,
        seller_inv: order.paymentId || order._id.toString(),
        pin,
        products_desc: await this.buildProductDescription(order),
        add: `${order.shippingAddress.addressLine1}${
          order.shippingAddress.addressLine2
            ? ", " + order.shippingAddress.addressLine2
            : ""
        }`,
        state: order.shippingAddress.state,
        city: order.shippingAddress.city,
        phone: order.shippingAddress.phoneNumber,
        payment_mode: isCOD ? "COD" : "Prepaid",
        cod_amount: isCOD ? order.total : 0,
        order_date: new Date(order.createdAt || Date.now()).toISOString(),
        name: order.shippingAddress.fullName,
        total_amount: order.total,
        country: order.shippingAddress.country || "India",
        hsn_code: order.items[0]?.hsn || "",
        quantity: order.items.reduce((sum, i) => sum + i.quantity, 0),
        shipping_mode: shipping?.shippingMethod || "Surface",
        address_type: "home",
        mps_master: packageCount > 1 ? "Y" : undefined,
      });

      // 🧱 Child Shipments (if any)
      if (childrenWaybills.length > 0) {
        childrenWaybills.forEach((wb, idx) => {
          shipments.push({
            waybill: wb,
            order: `${order._id}-CHILD${idx + 1}`,
            weight: 100,
            shipment_height: 10,
            shipment_width: 11,
            shipment_length: 12,
            products_desc: `Part ${idx + 1} of ${packageCount}`,
            add: shipments[0].add,
            state: order.shippingAddress.state,
            pin,
            city: order.shippingAddress.city,
            phone: order.shippingAddress.phoneNumber,
            payment_mode: "Prepaid", // ✅ Always Prepaid for child in COD orders
            cod_amount: 0, // ✅ COD only in master
            name: order.shippingAddress.fullName,
            total_amount: order.total,
            country: "India",
            mps_master: "N",
            master_id: masterWaybill,
          });
        });
      }

      // --- 5️⃣ Final Payload ---
      const payload = {
        format: "json",
        data: JSON.stringify({
          pickup_location,
          shipments,
        }),
      };

      console.log(
        "🚚 Delhivery shipment payload:",
        JSON.stringify(payload, null, 2)
      );

      // --- 6️⃣ Create Shipment ---
      const res = await axios.post(
        "https://track.delhivery.com/api/cmu/create.json",
        payload,
        {
          headers: {
            Authorization: `Token ${process.env.DELHIVERY_API_TOKEN}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log("📦 Delhivery shipment response:", res.data);

    // --- 7️⃣ Save Shipment Details ---
    if (res.data.success === true || res.data.package_count > 0) {
      const shippingDetails = {
        platform: "delhivery",
        reference_number: masterWaybill,
        tracking_url: `https://www.delhivery.com/track/package/${masterWaybill}`,
        raw_response: res.data,
        created_at: new Date(),
      };

        await this.orderRepository.updateOrder(order._id, {
          shipping_details: shippingDetails,
        });

        return {
          success: true,
          message: "Delhivery shipment created successfully",
          trackingNumber: masterWaybill,
          waybills,
          data: res.data,
        };
      } else {
        throw new Error(
          `Delhivery API error: ${res.data.rmk || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("❌ Delhivery shipment creation failed:", error);
      return {
        success: false,
        message: `Delhivery shipment creation failed: ${error.message}`,
        error: error.message,
      };
    }
  }

  // 🔢 Get Delhivery Waybill Numbers
  async getDelhiveryWaybill(count = 1) {
    try {
      const response = await axios.get(
        `https://track.delhivery.com/waybill/api/bulk/json/?token=${process.env.DELHIVERY_API_TOKEN}&cl=BHARATGRAM%20B2C&count=${count}`
      );
      console.log("🧾 Delhivery waybill response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to get Delhivery waybill:", error.message);
      throw new Error(`Failed to get Delhivery waybill: ${error.message}`);
    }
  }

  // 🛍️ Build Product Description
  async buildProductDescription(order) {
    return order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ");
  }

  // ========== DTDC (Shipsy) SERVICE ========== //
  async createDtdcShipment(order, shipping) {
    // Build payload dynamically from order object

    console.log("Creating DTDC shipment for order:", order);

    const isCOD = order.paymentMode === "COD";
    const origin = {
      fullName: "BHARATGRAM B2C",
      phoneNumber: order.billingAddress.phoneNumber,
      addressLine1: "34   GOHANA VPO THASKA MAHARA,",
      addressLine2: "GOHANA VPO THASKA MAHARA, Sonipat, HARYANA ,India 131301",
      postalCode: "131301",
      city: "SONEPAT",
      state: "HARYANA",
    };
    const destination = order.shippingAddress;

    // Build pieces_detail from order items
    const piecesDetail = order.items.map((item) => ({
      description: item.product?.name || "Product",
      declared_value: (item.price * item.quantity).toString(),
      weight: item.weight?.toString() || "0.5",
      height: item.product?.dimensions?.height?.toString() || "5",
      length: item.product?.dimensions?.length?.toString() || "5",
      width: item.product?.dimensions?.width?.toString() || "5",
    }));

    const payload = {
      consignments: [
        {
          customer_code: process.env.DTDC_CUSTOMER_CODE,
          service_type_id: shipping?.service_type_id || "B2C PRIORITY",
          load_type: "NON-DOCUMENT",
          description: order.items
            .map((i) => i.product?.name || "Product")
            .join(", "),
          dimension_unit: "cm",
          length: shipping?.dimensions?.length?.toString() || "10.0",
          width: shipping?.dimensions?.width?.toString() || "10.0",
          height: shipping?.dimensions?.height?.toString() || "10.0",
          weight_unit: "kg",
          weight:
            shipping?.weight?.toString() || (order.total / 1000).toFixed(2),
          declared_value: order.total.toString(),
          num_pieces: order.items.length.toString(),
          origin_details: {
            name: origin.fullName,
            phone: origin.phoneNumber,
            alternate_phone: "",
            address_line_1: origin.addressLine1,
            address_line_2: origin.addressLine2 || "",
            pincode: origin.postalCode,
            city: origin.city,
            state: origin.state,
          },
          destination_details: {
            name: destination.fullName,
            phone: destination.phoneNumber,
            alternate_phone: "",
            address_line_1: destination.addressLine1,
            address_line_2: destination.addressLine2 || "",
            pincode: destination.postalCode,
            city: destination.city,
            state: destination.state,
          },
          customer_reference_number: order._id.toString(),
          cod_collection_mode: isCOD ? "cash" : "",
          cod_amount: isCOD ? order.total.toString() : "0",
          commodity_id: "7",
          reference_number: "",
          pieces_detail: piecesDetail,
        },
      ],
    };

    // console.log("DTDC shipment payload:", payload);
    // console.log("Using DTDC API Key:", process.env.DTDC_API_KEY);

    // Make API call
    const res = await axios.post(
      "https://pxapi.dtdc.in/api/customer/integration/consignment/softdata",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.DTDC_API_KEY,
        },
      }
    );

    console.log("DTDC shipment response:", res.data);

    if (res.data.status == "OK" && res.data?.data?.[0]?.reference_number) {
      // Save shipping_details in order model
      const shippingDetails = {
        platform: "dtdc",
        reference_number: res.data?.data?.[0]?.reference_number || null,
        tracking_url: `https://www.dtdc.in/tracking?awb=${res.data?.data?.[0]?.reference_number}`,
        raw_response: res.data,
      };
      // console.log("Shipping details to save:", shippingDetails);

      //save to order
      await this.orderRepository.updateOrder(order._id, {
        shipping_details: shippingDetails,
      });
    } else {
      throw new Error(
        `DTDC shipment creation failed: ${res.data.message || "Unknown error"}`
      );
    }

    // Update order with shipping_details

    // console.log("DTDC shipment response:", res.data);

    // Return formatted response
    return {
      success: true,
      message: "DTDC shipment created successfully",
      trackingNumber:
        res.data?.consignments?.[0]?.reference_number ||
        res.data?.consignments?.[0]?.awb_number,
      data: res.data,
    };
  }

  // ========== BLUEDART SERVICE ========== //
  // ========= BLUEDART CREATE SHIPMENT ========= //
  // async createBluedartShipment(order, shipping) {
  //   try {

  //     // console.log("Creating Bluedart shipment for order:",  process.env.BLUEDART_CLIENT_ID, process.env.BLUEDART_CLIENT_SECRET, order);

  //     // Step 1: Generate authentication token using ClientID and clientSecret headers
  //     const tokenResp = await axios.get(
  //       'https://apigateway.bluedart.com/in/transportation/token/v1/login',
  //       {
  //         headers: {
  //           'ClientID': process.env.BLUEDART_CLIENT_ID,
  //           'clientSecret': process.env.BLUEDART_CLIENT_SECRET,
  //           'Content-Type': 'application/json'
  //         }
  //       }
  //     );

  //     console.log('Bluedart token response status:', tokenResp.status);
  //     console.log('Bluedart token response data:', tokenResp.data);

  //     if (!tokenResp.data?.JWTToken) {
  //       console.error('Authentication failed - no JWT token in response');
  //       throw new Error(`Failed to get Bluedart authentication token: ${JSON.stringify(tokenResp.data)}`);
  //     }

  //     const jwtToken = tokenResp.data.JWTToken;
  //     console.log('Bluedart token generated successfully, length:', jwtToken.length);

  //     // Step 2: Build waybill generation payload
  //     const origin = {
  //       fullName: 'BHARATGRAM B2C',
  //       phoneNumber: order.billingAddress.phoneNumber,
  //       addressLine1: "34 GOHANA VPO THASKA MAHARA",
  //       addressLine2: "GOHANA VPO THASKA MAHARA, Sonipat, HARYANA, India 131301",
  //       postalCode: "131301",
  //       city: "SONEPAT",
  //       state: "HARYANA",
  //     };

  //     const destination = order.shippingAddress;
  //     const isCOD = order.paymentMode === "COD";

  //     // Calculate total weight and pieces
  //     const totalWeight = order.items.reduce((sum, item) => {
  //       const itemWeight = parseFloat(item.weight) || 0.5; // Default 0.5kg per item
  //       return sum + (itemWeight * item.quantity);
  //     }, 0);

  //     const totalPieces = order.items.reduce((sum, item) => sum + item.quantity, 0);

  //     // Build waybill payload according to Bluedart API specification
  //     const waybillPayload = {
  //       Request: {
  //         Consignee: {
  //           ConsigneeName: destination.fullName,
  //           ConsigneeAddress1: destination.addressLine1,
  //           ConsigneeAddress2: destination.addressLine2 || "",
  //           ConsigneeAddress3: "",
  //           ConsigneePincode: destination.postalCode,
  //           ConsigneeCity: destination.city,
  //           ConsigneeState: destination.state,
  //           ConsigneeCountry: destination.country || "IND",
  //           ConsigneeMobile: destination.phoneNumber,
  //           ConsigneeEmailID: destination.email || "",
  //           ConsigneeTelephone: ""
  //         },
  //         Shipper: {
  //           CustomerName: origin.fullName,
  //           CustomerAddress1: origin.addressLine1,
  //           CustomerAddress2: origin.addressLine2,
  //           CustomerAddress3: "",
  //           CustomerPincode: origin.postalCode,
  //           CustomerCity: origin.city,
  //           CustomerState: origin.state,
  //           CustomerCountry: "IND",
  //           CustomerMobile: origin.phoneNumber,
  //           CustomerTelephone: "",
  //           CustomerEmailID: ""
  //         },
  //         Services: {
  //           ProductCode: shipping?.productCode || "A", // A = Express, E = Domestic Express
  //           SubProductCode: isCOD ? "C" : "", // C = COD, empty for prepaid
  //           PickupDate: new Date().toISOString().split("T")[0],
  //           PickupTime: "1500", // 3:00 PM in 24hr format
  //           PieceCount: totalPieces,
  //           Weight: totalWeight.toFixed(2),
  //           DeclaredValue: order.total,
  //           CollectableAmount: isCOD ? order.total : 0,
  //           Commodity: {
  //             CommodityDetail1: order.items.map(i => i.product?.name || "Product").join(", "),
  //             CommodityDetail2: "",
  //             CommodityDetail3: ""
  //           },
  //           SpecialInstruction: "",
  //           DeliveryTimeCode: shipping?.deliveryTimeCode || "",
  //           PackType: "",
  //           DimWeight: "",
  //           Length: shipping?.dimensions?.length || 10,
  //           Width: shipping?.dimensions?.width || 10,
  //           Height: shipping?.dimensions?.height || 10
  //         },
  //         ReferenceNumber: order._id.toString(),
  //         PickupLocationCode: process.env.BLUEDART_PICKUP_LOCATION || "131301",
  //         PickupMode: "P", // P = Pickup, S = Self Drop
  //         TotalCashPaytoCompany: 0,
  //         CreditReferenceNo: order.paymentId || order._id.toString(),
  //        Profile: {
  //     LoginID: "GOH92520",
  //     LicenseKey: "nmilgqfslqloplglu2spkqfhqohf5jim",
  //     Api_type: "S"
  //   },

  //       }
  //     };

  //     console.log('Bluedart waybill payload:', JSON.stringify(waybillPayload, null, 2));

  //     // Step 3: Generate waybill
  //     let waybillResp;
  //     try {
  //       waybillResp = await axios.post(
  //         'https://apigateway.bluedart.com/in/transportation/waybill/v1/GenerateWayBill',
  //         waybillPayload,
  //         {
  //           headers: {
  //             'JWTToken': jwtToken,
  //             'Content-Type': 'application/json'
  //           }
  //         }
  //       );
  //     } catch (err) {
  //       console.error('Bluedart waybill request failed:', err.message);
  //       console.error('Request URL:', 'https://apigateway.bluedart.com/in/transportation/waybill/v1/GenerateWayBill');
  //       console.error('Request payload:', JSON.stringify(waybillPayload, null, 2));
  //       console.error('Request headers:', {
  //         'JWTToken': jwtToken ? 'Token present' : 'Token missing',
  //         'Content-Type': 'application/json'
  //       });
  //       console.error('Response status:', err.response?.status);
  //       console.error('Response headers:', err.response?.headers);
  //       console.error('Response data:', JSON.stringify(err.response?.data, null, 2));

  //       return {
  //         success: false,
  //         message: `Bluedart waybill request failed: ${err.response?.status} - ${err.response?.statusText || err.message}`,
  //         error: {
  //           status: err.response?.status,
  //           statusText: err.response?.statusText,
  //           data: err.response?.data,
  //           message: err.message
  //         },
  //         courier: 'BLUEDART',
  //         orderId: order._id?.toString?.() || null,
  //       };
  //     }

  //     console.log('Bluedart waybill response:', waybillResp.data);

  //     // Step 4: Process response and handle errors
  //     if (!waybillResp.data?.GenerateWayBillResult) {
  //       throw new Error(`Bluedart waybill generation failed: ${waybillResp.data?.ErrorMessage || 'Unknown error'}`);
  //     }

  //     const result = waybillResp.data.GenerateWayBillResult;

  //     if (!result.IsError && result.AWBNo) {
  //       // Step 5: Save shipping details to order (similar to DTDC implementation)
  //       const shippingDetails = {
  //         platform: "bluedart",
  //         awb_number: result.AWBNo,
  //         reference_number: order._id.toString(),
  //         tracking_url: `https://www.bluedart.com/web/guest/trackdartresult?trackFor=0&trackNo=${result.AWBNo}`,
  //         token_number: result.TokenNumber,
  //         destination_location: result.DestinationLocation,
  //         destination_area: result.DestinationArea,
  //         raw_response: waybillResp.data,
  //         created_at: new Date()
  //       };

  //       // Update order with shipping details
  //       await this.orderRepository.updateOrder(order._id, {
  //         shipping_details: shippingDetails,
  //       });

  //       return {
  //         success: true,
  //         message: "Bluedart waybill generated successfully",
  //         trackingNumber: result.AWBNo,
  //         tokenNumber: result.TokenNumber,
  //         destinationLocation: result.DestinationLocation,
  //         destinationArea: result.DestinationArea,
  //         courier: "BLUEDART",
  //         orderId: order._id.toString(),
  //         data: result,
  //       };
  //     } else {
  //       throw new Error(`Bluedart waybill generation failed: ${result.Status?.[0]?.StatusInformation || 'Unknown error'}`);
  //     }

  //   } catch (error) {
  //     console.error("Bluedart shipment creation failed:", error);

  //     // Return structured error response
  //     return {
  //       success: false,
  //       message: `Bluedart shipment creation failed: ${error.message}`,
  //       error: {
  //         message: error.message,
  //         response: error.response?.data || null,
  //         status: error.response?.status || null
  //       },
  //       courier: "BLUEDART",
  //       orderId: order._id.toString(),
  //     };
  //   }
  // }

  async createBluedartShipment(order, shipping) {
    try {
      // Step 1: Generate authentication token
      const tokenResp = await axios.get(
        "https://apigateway.bluedart.com/in/transportation/token/v1/login",
        {
          headers: {
            ClientID: process.env.BLUEDART_CLIENT_ID,
            clientSecret: process.env.BLUEDART_CLIENT_SECRET,
            "Content-Type": "application/json",
          },
        }
      );

      if (!tokenResp.data?.JWTToken) {
        throw new Error(`Failed to get Bluedart authentication token`);
      }

      const jwtToken = tokenResp.data.JWTToken;
      console.log("Bluedart token generated successfully");

      // Step 2: Build waybill generation payload
      const origin = {
        fullName: "BHARATGRAM B2C",
        phoneNumber: order.billingAddress.phoneNumber,
        addressLine1: "34 GOHANA VPO THASKA MAHARA",
        addressLine2:
          "GOHANA VPO THASKA MAHARA, Sonipat, HARYANA, India 131301",
        postalCode: "131301",
        city: "SONEPAT",
        state: "HARYANA",
      };

      const destination = order.shippingAddress;
      const isCOD = order.paymentMode === "COD";

      // Calculate total weight and pieces
      const totalWeight = order.items.reduce((sum, item) => {
        const itemWeight = parseFloat(item.weight) || 0.5;
        return sum + itemWeight * item.quantity;
      }, 0);

      const totalPieces = order.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      // Convert date to Bluedart format: /Date(epochMilliseconds)/
      const pickupDate = new Date();
      pickupDate.setHours(15, 0, 0, 0); // Set to 3 PM
      const dateString = `/Date(${pickupDate.getTime()})/`;

      // Build waybill payload according to Bluedart API specification
      const waybillPayload = {
        Request: {
          Consignee: {
            ConsigneeName: destination.fullName,
            ConsigneeAddress1: destination.addressLine1,
            ConsigneeAddress2: destination.addressLine2 || "",
            ConsigneeAddress3: "",
            ConsigneePincode: destination.postalCode,
            ConsigneeMobile: destination.phoneNumber,
            ConsigneeEmailID: destination.email || "",
            ConsigneeTelephone: "",
            ConsigneeAttention: "",
            ConsigneeGSTNumber: "",
            ConsigneeLatitude: "",
            ConsigneeLongitude: "",
            ConsigneeMaskedContactNumber: "",
            ConsigneeAddressType: "R", // R = Residential, C = Commercial
          },
          Shipper: {
            CustomerName: origin.fullName,
            CustomerAddress1: origin.addressLine1,
            CustomerAddress2: origin.addressLine2,
            CustomerAddress3: "",
            CustomerPincode: origin.postalCode,
            CustomerMobile: origin.phoneNumber,
            CustomerTelephone: "",
            CustomerEmailID: "",
            CustomerCode: process.env.BLUEDART_CUSTOMER_CODE || "951554",
            CustomerGSTNumber: "",
            CustomerLatitude: "",
            CustomerLongitude: "",
            CustomerMaskedContactNumber: "",
            IsToPayCustomer: false,
            Sender: origin.fullName,
            OriginArea: process.env.BLUEDART_ORIGIN_AREA || "GOH",
            VendorCode: process.env.BLUEDART_VENDOR_CODE || "GOH951554",
            PickupLocationCode:
              process.env.BLUEDART_PICKUP_LOCATION_CODE || "GOH",
          },
          Returnadds: {
            ManifestNumber: "",
            ReturnAddress1: origin.addressLine1,
            ReturnAddress2: origin.addressLine2,
            ReturnAddress3: "",
            ReturnContact: origin.fullName,
            ReturnEmailID: "",
            ReturnLatitude: "",
            ReturnLongitude: "",
            ReturnMaskedContactNumber: "",
            ReturnMobile: origin.phoneNumber,
            ReturnPincode: origin.postalCode,
            ReturnTelephone: "",
          },
          Services: {
            AWBNo: "",
            ProductCode: shipping?.productCode || "D", // D = Domestic, A = Apex
            SubProductCode: isCOD ? "C" : "", // C = COD
            ProductType: 0,
            PickupDate: dateString, // Use Bluedart date format
            PickupTime: "1500", // 3:00 PM
            PieceCount: totalPieces.toString(),
            ActualWeight: totalWeight.toFixed(2), // Changed from Weight to ActualWeight
            CreditReferenceNo: order.paymentId || order._id.toString(),
            RegisterPickup: true, // Set to true if you want pickup registered
            SpecialInstruction: "",
            PackType: "",
            Commodity: {
              CommodityDetail1: order.items
                .map((i) => i.product?.name || "Product")
                .join(", ")
                .substring(0, 100),
            },
            Dimensions: Array.from({ length: totalPieces }, () => ({
              Breadth: 10,
              Count: 1,
              Height: 10,
              Length: 10,
            })),
            ECCN: "",
            PDFOutputNotRequired: false, // Set to false if you need PDF
            OTPBasedDelivery: 0, // 0 = No OTP, 1 = OTP required
            OTPCode: "",
            itemdtl: [],
            noOfDCGiven: 0,
          },
        },
        Profile: {
          LoginID: process.env.BLUEDART_LOGIN_ID || "GOH92520",
          LicenceKey:
            process.env.BLUEDART_LICENSE_KEY ||
            "nmilgqfslqloplglu2spkqfhqohf5jim",
          Api_type: "S",
        },
      };

      console.log(
        "Bluedart waybill payload:",
        JSON.stringify(waybillPayload, null, 2)
      );

      // Step 3: Generate waybill
      let waybillResp;
      console?.log("Sending Bluedart waybill request...", jwtToken);
      try {
        waybillResp = await axios.post(
          "https://apigateway.bluedart.com/in/transportation/waybill/v1/GenerateWayBill",
          waybillPayload,
          {
            headers: {
              JWTToken: jwtToken,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (err) {
        console.error("Bluedart waybill request failed:", err.message);
        console.error("Response status:", err.response?.status);
        console.error(
          "Response data:",
          JSON.stringify(err.response?.data, null, 2)
        );

        return {
          success: false,
          message: `Bluedart waybill request failed: ${
            err.response?.data?.title || err.message
          }`,
          error: {
            status: err.response?.status,
            data: err.response?.data,
            message: err.message,
          },
          courier: "BLUEDART",
          orderId: order._id?.toString?.() || null,
        };
      }

      console.log("Bluedart waybill response:", waybillResp.data);

      // Step 4: Process response
      if (!waybillResp.data?.GenerateWayBillResult) {
        throw new Error(
          `Bluedart waybill generation failed: ${
            waybillResp.data?.ErrorMessage || "Unknown error"
          }`
        );
      }

      const result = waybillResp.data.GenerateWayBillResult;

      if (!result.IsError && result.AWBNo) {
        const shippingDetails = {
          platform: "bluedart",
          awb_number: result.AWBNo,
          reference_number: order._id.toString(),
          tracking_url: `https://www.bluedart.com/web/guest/trackdartresult?trackFor=0&trackNo=${result.AWBNo}`,
          token_number: result.TokenNumber,
          destination_location: result.DestinationLocation,
          destination_area: result.DestinationArea,
          raw_response: waybillResp.data,
          created_at: new Date(),
        };

        await this.orderRepository.updateOrder(order._id, {
          shipping_details: shippingDetails,
        });

        return {
          success: true,
          message: "Bluedart waybill generated successfully",
          trackingNumber: result.AWBNo,
          tokenNumber: result.TokenNumber,
          destinationLocation: result.DestinationLocation,
          destinationArea: result.DestinationArea,
          courier: "BLUEDART",
          orderId: order._id.toString(),
          data: result,
        };
      } else {
        throw new Error(
          `Bluedart waybill generation failed: ${
            result.Status?.[0]?.StatusInformation || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Bluedart shipment creation failed:", error);

      return {
        success: false,
        message: `Bluedart shipment creation failed: ${error.message}`,
        error: {
          message: error.message,
          response: error.response?.data || null,
          status: error.response?.status || null,
        },
        courier: "BLUEDART",
        orderId: order._id.toString(),
      };
    }
  }
}

export default OrderService;
