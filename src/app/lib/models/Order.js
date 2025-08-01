import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Variant',
    required: false
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: false });

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String, required: false },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phoneNumber: { type: String, required: true }
}, { _id: false });

const paymentSchema = new mongoose.Schema({
  cardNumber: { type: String, required: true },
  expiryDate: { type: String, required: true },
  cvv: { type: String, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: true
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    default: null
  },
  discount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'completed', 'cancelled'],
    default: 'pending'
  },
  placedAt: {
    type: Date,
    default: Date.now
  },
  shippingAddress: {
    type: addressSchema,
    required: true
  },
  billingAddress: {
    type: addressSchema,
    required: true
  },
  paymentDetails: {
    type: paymentSchema,
    required: true
  },
  deliveryOption: {
    type: String,
    enum: ['standard_delivery', 'express_delivery', 'overnight_delivery'],
    required: true
  }
}, {
  timestamps: true
});

export const OrderSchema = orderSchema;
export const OrderModel = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default OrderModel;