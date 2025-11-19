import mongoose, { ObjectId } from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String },
  images: [
    {
      url: { type: String },
      alt: { type: String },
    },
  ],
  price: { type: Number, required: true },
  salePrice: { type: Number },
  stock: { type: Number, default: 0 },
  category: { type: ObjectId, ref: "Category" },
  subcategory: { type: ObjectId, ref: "Subcategory" },
  brand: { type: ObjectId, ref: "Brand" },
  attributes: [
    {
      attributeId: { type: ObjectId, ref: "Attribute" },
      value: { type: String },
    },
  ],
  variants: [
    {
      type: ObjectId,
      ref: "Variant",
    },
  ],
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // New metrics fields
  views: { type: Number, default: 0 },
  cartCount: { type: Number, default: 0 },
  wishlistCount: { type: Number, default: 0 },
  searchAppearances: { type: Number, default: 0 },
  clickThrough: { type: Number, default: 0 },
  purchaseCount: { type: Number, default: 0 },
  lastViewedAt: { type: Date },
  lastPurchasedAt: { type: Date },
  abandonedCount: { type: Number, default: 0 },
});

export const ProductSchema = productSchema;
export default productSchema;