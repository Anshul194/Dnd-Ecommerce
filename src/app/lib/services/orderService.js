import mongoose from "mongoose";
import OrderRepository from "../repository/OrderRepository";
import CouponService from "./CouponService";
import EmailService from "./EmailService";
import { SettingSchema } from "../models/Setting";
import axios from "axios";
import https from "https"; // if using ES modules
import { ShippingSchema } from "../models/Shipping.js";

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

      const Setting =
        conn.models.Setting || conn.model("Setting", SettingSchema);
      const settings = await Setting.findOne({ tenant }).lean();

      // Calculate subtotal
      let subtotal = 0;
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
        const Order =
          conn.models.Order ||
          conn.model("Order", mongoose.model("Order").schema);
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
          conn.models.Order ||
          conn.model("Order", mongoose.model("Order").schema);
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
        throw new Error("Destination postal code missing for Bluedart service check");
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

 // ========== Build Common Helpers ========== //
async function buildProductDescription(order) {
  return order.items
    .map(i => `${i.quantity}x ${i.product?.name || "Item"}`)
    .join(", ");
}

async function buildPiecesDetail(order) {
  return order.items.map(i => ({
    description: i.product?.name || "Product",
    declared_value: i.price.toString(),
    weight: (i.price / 1000).toFixed(2), // dummy logic: price ≈ weight/1000
    height: "5",
    length: "5",
    width: "5"
  }));
}

// ========== DELHIVERY SERVICE ========== //
async function createDelhiveryShipment(order, shipping) {
  const payload = {
    format: "json",
    data: JSON.stringify({
      shipments: [
        {
          name: order.shippingAddress.fullName,
          add: `${order.shippingAddress.addressLine1}, ${order.shippingAddress.addressLine2 || ""}`,
          pin: order.shippingAddress.postalCode,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          country: order.shippingAddress.country,
          phone: order.shippingAddress.phoneNumber,
          order: order._id.toString(),
          payment_mode: order.paymentMode === "COD" ? "COD" : "Prepaid",
          cod_amount: order.paymentMode === "COD" ? order.total : "",
          total_amount: order.total,
          products_desc: buildProductDescription(order),
          hsn_code: order.items[0]?.hsn || "",
          quantity: order.items.reduce((sum, i) => sum + i.quantity, 0),
          seller_add: order.billingAddress.addressLine1,
          seller_name: order.billingAddress.fullName,
          seller_inv: order.paymentId,
          waybill: "",
          shipment_width: "50",
          shipment_height: "50",
          weight: (order.total / 1000).toFixed(2), // dummy approx
          shipping_mode: shipping?.shippingMethod || "Surface",
          address_type: "home"
        }
      ],
      pickup_location: {
        name: "Warehouse",
        add: "Warehouse Address Line",
        city: "New Delhi",
        pin: "110046",
        country: "India",
        phone: "9999999999"
      }
    })
  };

  const res = await axios.post(
    process.env.DELHIVERY_API_URL || "https://staging-express.delhivery.com/api/cmu/create.json",
    payload,
    {
      headers: {
        Authorization: `Token ${process.env.DELHIVERY_API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    }
  );

  return res.data;
}

// ========== DTDC (Shipsy) SERVICE ========== //
async function createDtdcShipment(order, shipping) {
  const payload = {
    consignments: [
      {
        customer_code: process.env.DTDC_CUSTOMER_CODE,
        service_type_id: "B2C PRIORITY",
        load_type: "NON-DOCUMENT",
        description: buildProductDescription(order),
        dimension_unit: "cm",
        length: "10.0",
        width: "10.0",
        height: "10.0",
        weight_unit: "kg",
        weight: (order.total / 1000).toFixed(2), // dummy logic
        declared_value: order.total.toString(),
        num_pieces: order.items.length.toString(),
        origin_details: {
          name: order.billingAddress.fullName,
          phone: order.billingAddress.phoneNumber,
          address_line_1: order.billingAddress.addressLine1,
          address_line_2: order.billingAddress.addressLine2 || "",
          pincode: order.billingAddress.postalCode,
          city: order.billingAddress.city,
          state: order.billingAddress.state
        },
        destination_details: {
          name: order.shippingAddress.fullName,
          phone: order.shippingAddress.phoneNumber,
          address_line_1: order.shippingAddress.addressLine1,
          address_line_2: order.shippingAddress.addressLine2 || "",
          pincode: order.shippingAddress.postalCode,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state
        },
        customer_reference_number: order._id.toString(),
        cod_collection_mode: order.paymentMode === "COD" ? "cash" : "none",
        cod_amount: order.paymentMode === "COD" ? order.total.toString() : "0",
        commodity_id: "7",
        pieces_detail: buildPiecesDetail(order)
      }
    ]
  };

  const res = await axios.post(
    process.env.DTDC_API_URL || "https://alphademodashboardapi.shipsy.io/api/customer/integration/consignment/softdata",
    payload,
    {
      headers: {
        Authorization: `Bearer ${process.env.DTDC_API_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );

  return res.data;
}

// ========== BLUEDART (Mock) SERVICE ========== //
// ========= BLUEDART CREATE SHIPMENT ========= //
async createBluedartShipment(order, shipping) {
  try {
    // Generate JWT Token
    const tokenResp = await axios.post(
      process.env.BLUEDART_AUTH_URL,
      {
        client_id: process.env.BLUEDART_CLIENT_ID,
        client_secret: process.env.BLUEDART_CLIENT_SECRET,
      }
    );
    const jwtToken = tokenResp.data?.access_token;

    const payload = {
      Consignee: {
        Name: order.shippingAddress.fullName,
        Address1: order.shippingAddress.addressLine1,
        Address2: order.shippingAddress.addressLine2 || "",
        Pincode: order.shippingAddress.postalCode,
        City: order.shippingAddress.city,
        State: order.shippingAddress.state,
        Mobile: order.shippingAddress.phoneNumber,
      },
      Shipper: {
        Name: order.billingAddress.fullName,
        Address1: order.billingAddress.addressLine1,
        Address2: order.billingAddress.addressLine2 || "",
        Pincode: order.billingAddress.postalCode,
        City: order.billingAddress.city,
        State: order.billingAddress.state,
        Mobile: order.billingAddress.phoneNumber,
      },
      Services: {
        ProductCode: "A", // Express product
        SubProductCode: "P", // Prepaid
        PickupDate: new Date().toISOString().split("T")[0],
        PickupTime: "1500",
        PieceCount: order.items.length,
        Weight: (order.total / 1000).toFixed(2), // approx kg
        DeclaredValue: order.total,
        CollectableAmount: order.paymentMode === "COD" ? order.total : 0,
        Commodity: "General",
      },
      ReferenceNo: order._id.toString(),
    };

    const res = await axios.post(
      process.env.BLUEDART_API_URL + "/GenerateWayBill",
      payload,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      message: "Bluedart shipment created successfully",
      orderId: order._id.toString(),
      courier: "Bluedart",
      trackingNumber: res.data?.AWBNo,
      label: res.data?.LabelURL,
    };
  } catch (error) {
    console.error("Bluedart shipment creation failed:", error.message);
    return {
      success: false,
      message: "Bluedart shipment creation failed",
      error: error.message,
    };
  }
}

}

export default OrderService;
