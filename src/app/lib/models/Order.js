import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      required: false,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, required: false },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phoneNumber: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    total: {
      type: Number,
      required: true,
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    discount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "completed", "cancelled"],
      default: "pending",
    },
    placedAt: {
      type: Date,
      default: Date.now,
    },
    shippingAddress: {
      type: addressSchema,
      required: true,
    },
    billingAddress: {
      type: addressSchema,
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
    deliveryOption: {
      type: String,
      enum: ["standard_delivery", "express_delivery", "overnight_delivery"],
      required: true,
    },
    shippingCharge: {
      type: Number,
      default: 0,
    },
    paymentMode: {
      type: String,
      enum: ["COD", "Prepaid"],
      required: true,
    },
    codBlockedReason: {
      type: String,
      default: null,
    },
    shippingMethod: {
      type: String,
      required: false,
    },
    shippingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipping",
      required: false,
    },
    shippingName: {
      type: String,
      required: false,
    },
    shippingPriority: {
      type: Number,
      required: false,
      default: 0,
    },
    shipping_details: {
      platform: { type: String, enum: ['dtdc', 'delhivery', 'bluedart', null], default: null },
      reference_number: { type: String, default: null }, // e.g., AWB, order_ref, consignment_no
      tracking_url: { type: String, default: null },
      raw_response: { type: Object, default: null }, // Store full API response safely
      labelUrl: { type: String, default: null },
      status_history: { type: Array, default: [] }, // Array of status updates
      current_status: { type: String, default: null }, // Latest status
      last_updated: { type: Date, default: Date.now },
      
    }
  },
  {
    timestamps: true,
  }
);

export const OrderSchema = orderSchema;
export const OrderModel =
  mongoose.models.Order || mongoose.model("Order", orderSchema);
export default OrderModel;
