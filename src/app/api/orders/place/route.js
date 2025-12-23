import { NextResponse } from "next/server";
import mongoose from "mongoose";
import OrderController from "../../../lib/controllers/orderController.js";
import OrderService from "../../../lib/services/orderService.js";
import OrderRepository from "../../../lib/repository/OrderRepository.js";
import CouponService from "../../../lib/services/CouponService.js";
import CouponRepository from "../../../lib/repository/CouponRepository.js";
import EmailService from "../../../lib/services/EmailService.js";
import WhatsappService from "../../../lib/services/WhatsappService.js";
import { OrderSchema } from "../../../lib/models/Order.js";
import { CouponSchema } from "../../../lib/models/Coupon.js";
import { ProductSchema } from "../../../lib/models/Product.js";
import { VariantSchema } from "../../../lib/models/Variant.js";
import { getSubdomain, getDbConnection } from "../../../lib/tenantDb";
import { getUserById, withUserAuth } from "../../../middleware/commonAuth.js";
import userSchema from "@/app/lib/models/User.js";
import UserService from "@/app/lib/services/userService.js";

export async function POST(req) {
  try {
    const tenant = req.headers.get("x-tenant");
    const body = await req.json();
    //consolle.log('Route received create order body:', JSON.stringify(body, null, 2));
    const subdomain = getSubdomain(req);
    //consolle.log('Subdomain:', subdomain);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      //consolle.error('No database connection established');
      return NextResponse.json(
        { success: false, message: "DB not found" },
        { status: 404 }
      );
    }
    //consolle.log('Connection name in route:', conn.name);
    const Order = conn.models.Order || conn.model("Order", OrderSchema);
    const Coupon = conn.models.Coupon || conn.model("Coupon", CouponSchema);
    const Product = conn.models.Product || conn.model("Product", ProductSchema);
    const Variant = conn.models.Variant || conn.model("Variant", VariantSchema);
    //consolle.log('Models registered:', { Order: Order.modelName, Coupon: Coupon.modelName, Product: Product.modelName, Variant: Variant.modelName });
    const orderRepo = new OrderRepository(Order, conn);
    const couponRepo = new CouponRepository(Coupon);
    const couponService = new CouponService(couponRepo);
    const emailService = new EmailService();
    const orderService = new OrderService(
      orderRepo,
      couponService,
      emailService
    );
    const orderController = new OrderController(orderService);
    const result = await orderController.create({ body }, conn, tenant);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    // Send WhatsApp notification after order placed (non-blocking)
    const whatsappService = new WhatsappService();
    console.log("result of order creation is: ", result);

    const userService = new UserService(conn);
    const user = await userService.getUserById(
      result.data.order.user.toString()
    );
    console.log("fetched user is ", user);
    result.data.userName = user?.name || "Customer";

    const payload = {
      phone: user.phone,
      name: user.name,
      email: user.email,
      extraFields: {
        orderId: result.data.order._id.toString(),
        orderTotal: result.data.order.total.toString(),
        status: result.data.order.status,
      },
    };

    console.log();

    const items = result.data.order.items || [];
    const productPromises = items.map(async (item) => {
      // If item has a productId, fetch by id; otherwise try to find by product name as a fallback
      if (item.product) {
        return Product.findById(item.product)
          .lean()
          .exec()
          .catch((err) => {
            console.error("Failed to fetch product by id", item.product, err);
            return null;
          });
      } else if (item.product) {
        return Product.findOne({ _id: item.product })
          .lean()
          .exec()
          .catch((err) => {
            console.error("Failed to fetch product by name", item.product, err);
            return null;
          });
      } else {
        console.warn(
          "No productId or product name available for order item",
          item
        );
        return null;
      }
    });
    const products = await Promise.all(productPromises);
    console.log("products ===> ", products);
    products.forEach((product, index) => {
      const item = items[index];
      payload.extraFields[`productName${index + 1}`] =
        product?.name || item?.product || "";
    });

    console.log("payload is ===> ", payload);
    const response = await whatsappService.sendWebhookRequest({ ...payload });
    console.log("api response ==> ",response);

    if (!response.success) {
      console.log("filed to send message on whatsapp");
      result.whatsappError = response.error;
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.log("Route POST order error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export const GET = withUserAuth(async function (request) {
  try {
    const subdomain = getSubdomain(request);
    //consolle.log('Subdomain:', subdomain);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      //consolle.error('No database connection established');
      return NextResponse.json(
        { success: false, message: "DB not found" },
        { status: 404 }
      );
    }
    //consolle.log('Connection name in route:', conn.name);
    const Order = conn.models.Order || conn.model("Order", OrderSchema);
    const Coupon = conn.models.Coupon || conn.model("Coupon", CouponSchema);
    const Product = conn.models.Product || conn.model("Product", ProductSchema);
    const Variant = conn.models.Variant || conn.model("Variant", VariantSchema);
    const orderRepo = new OrderRepository(Order, conn);
    const couponRepo = new CouponRepository(Coupon);
    const couponService = new CouponService(couponRepo);
    const emailService = new EmailService();
    const orderService = new OrderService(
      orderRepo,
      couponService,
      emailService
    );
    const orderController = new OrderController(orderService);
    const result = await orderController.getUserOrders(request, conn);
    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalCount: result.totalCount,
    });
  } catch (error) {
    //consolle.error('Route GET my orders error:', error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
});
