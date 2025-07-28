import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    image: { type: String },
    thumbnail: { type: String },
    seoTitle: { type: String },
    seoDescription: { type: String },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    sortOrder: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export { categorySchema };

const Category =
  mongoose.models?.Category || mongoose.model("Category", categorySchema);

export default Category;
