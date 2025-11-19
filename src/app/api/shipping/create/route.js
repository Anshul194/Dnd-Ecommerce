import { NextResponse } from "next/server";

import { OrderSchema } from "@/app/lib/models/Order.js";
import { ShippingValidation } from "@/app/lib/validation/shippingValidation.js";
import { getDbConnection, getSubdomain } from "@/app/lib/tenantDb.js";
import { BlueDartShippingService } from "@/app/lib/services/shippingProviderService";
import DTDCShippingService from "@/app/lib/services/DTDCShippingService";

export async function POST(req) {
  try {
    const tenant = req.headers.get("x-tenant");
    const body = await req.json();

    //consolle.log(
    //   "Shipping creation request body:",
    //   JSON.stringify(body, null, 2)
    // );

    // Validate request body
    const validation = ShippingValidation.validateCreateShippingRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const subdomain = getSubdomain(req);
    //consolle.log("Subdomain:", subdomain);

    const conn = await getDbConnection(subdomain);
    if (!conn) {
      //consolle.error("No database connection established");
      return NextResponse.json(
        { success: false, message: "DB not found" },
        { status: 404 }
      );
    }

    // Get Order model and fetch order details
    const orderSchema = OrderSchema;
    const Order = conn.models.Order || conn.model("Order", orderSchema);

    const order = await Order.findById(body.orderId).populate("items");
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Validate order data
    const orderValidation = ShippingValidation.validateOrderData(order);
    if (!orderValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Order validation failed",
          errors: orderValidation.errors,
        },
        { status: 400 }
      );
    }

    let shippingResult;
    const shippingMethod = body.shipping_method.toLowerCase();

    switch (shippingMethod) {
      case "dtdc":
        // Validate DTDC environment configuration
        const envValidation = ShippingValidation.validateEnvironmentConfig();
        if (!envValidation.isValid) {
          return NextResponse.json(
            {
              success: false,
              message: "DTDC configuration error",
              errors: envValidation.errors,
            },
            { status: 500 }
          );
        }

        const dtdcService = new DTDCShippingService();
        shippingResult = await dtdcService.createShipment(
          {
            order_id: order._id.toString(),
            customer_name: order.customer_name,
            customer_phone: order.customer_phone,
            shipping_address: order.shipping_address,
            total_amount: order.total_amount,
            payment_method: order.payment_method,
            items: order.items,
          },
          {
            service_type_id: body.service_type_id || "B2C PRIORITY",
            dimensions: body.dimensions,
            weight: body.weight,
          }
        );
        break;

      case "bluedart":
      case "blue dart":
        const blueDartService = new BlueDartShippingService();
        shippingResult = await blueDartService.createShipment(
          {
            order_id: order._id.toString(),
            customer_name: order.customer_name,
            customer_phone: order.customer_phone,
            shipping_address: order.shipping_address,
            total_amount: order.total_amount,
            payment_method: order.payment_method,
            items: order.items,
          },
          {
            service_type_id: body.service_type_id,
            dimensions: body.dimensions,
            weight: body.weight,
          }
        );
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            message: `Shipping method '${body.shipping_method}' is not supported. Supported methods: DTDC, Blue Dart`,
          },
          { status: 400 }
        );
    }

    if (!shippingResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: shippingResult.error || "Failed to create shipping",
        },
        { status: 400 }
      );
    }

    // Update order with shipping information
    if (shippingResult.trackingNumber) {
      await Order.findByIdAndUpdate(body.orderId, {
        $set: {
          shipping_provider: body.shipping_method,
          tracking_number: shippingResult.trackingNumber,
          shipping_status: "shipped",
          shipped_at: new Date(),
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Shipping created successfully",
        data: {
          orderId: body.orderId,
          shipping_method: body.shipping_method,
          tracking_number: shippingResult.trackingNumber,
          provider_response: shippingResult.data,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    //consolle.error("Shipping creation error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
