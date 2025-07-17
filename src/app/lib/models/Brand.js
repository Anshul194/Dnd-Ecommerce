import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true
  },
  image: {
    type: String,
    required: false
  },
  description: {
    type: String,
    default: ""
  },
  status: {
    type: Boolean,
    default: true
  },
  website: {
    type: String,
    default: ""
  },
  country: {
    type: String,
    default: ""
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Brand = mongoose.models.Brand || mongoose.model("Brand", brandSchema);
export default Brand;