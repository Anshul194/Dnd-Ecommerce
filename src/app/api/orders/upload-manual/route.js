import { NextResponse } from "next/server";
import mongoose from "mongoose";
import OrderController from "../../../lib/controllers/orderController.js";
import OrderService from "../../../lib/services/orderService.js";
import OrderRepository from "../../../lib/repository/OrderRepository.js";
import CouponService from "../../../lib/services/CouponService.js";
import CouponRepository from "../../../lib/repository/CouponRepository.js";
import { OrderSchema } from "../../../lib/models/Order.js";
import { CouponSchema } from "../../../lib/models/Coupon.js";
import { ProductSchema } from "../../../lib/models/Product.js";
import { VariantSchema } from "../../../lib/models/Variant.js";

const MONGODB_URI = "mongodb+srv://anshul:anshul149@clusterdatabase.24furrx.mongodb.net/tenant_bharat?retryWrites=true&w=majority";

// Create a cached connection
let cachedConnection = null;

async function getConnection() {
    if (cachedConnection) {
        return cachedConnection;
    }

    const conn = await mongoose.createConnection(MONGODB_URI).asPromise();
    cachedConnection = conn;
    return conn;
}

export async function POST(request) {
    try {
        const conn = await getConnection();

        if (!conn) {
            return NextResponse.json(
                { success: false, message: "DB connection failed" },
                { status: 500 }
            );
        }

        // Initialize models
        const Order = conn.models.Order || conn.model("Order", OrderSchema);
        const Coupon = conn.models.Coupon || conn.model("Coupon", CouponSchema);
        const Product = conn.models.Product || conn.model("Product", ProductSchema);
        const Variant = conn.models.Variant || conn.model("Variant", VariantSchema);

        // Initialize repositories and services
        const orderRepo = new OrderRepository(Order, conn);
        const couponRepo = new CouponRepository(Coupon);
        const couponService = new CouponService(couponRepo);
        const orderService = new OrderService(orderRepo, couponService);
        const orderController = new OrderController(orderService);

        // Parse FormData
        const formData = await request.formData();
        const file = formData.get("excelFile");

        if (!file) {
            return NextResponse.json(
                { success: false, message: "No file uploaded" },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Mock request object for controller
        const mockRequest = {
            file: { buffer },
            user: { _id: "admin" }
        };

        const result = await orderController.uploadManualOrders(mockRequest, conn, null);

        return NextResponse.json(result, { status: result.success ? 200 : 400 });

    } catch (error) {
        console.error("POST /orders/upload-manual error:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
