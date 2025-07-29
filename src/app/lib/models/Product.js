import mongoose from "mongoose";
import slugify from "slugify";
import Attribute from "./Attribute";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },

    // Category, Subcategory, Brand as references
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },

    // Media
    images: [String], // Product gallery images
    thumbnail: String, // Primary display image

    // How To Use Section
    howToUseTitle: String,
    howToUseVideo: String, // Video URL
    howToUseSteps: [
      {
        title: String,
        description: String,
        icon: String, // optional icons
      },
    ],

    // Description Media Section
    descriptionImages: [String],
    descriptionVideo: String,

    // Highlights / Features
    highlights: [String],

    // Ratings and Reviews
    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        name: String,
        rating: Number,
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Attributes for variants
    attributeSet: [
      {
        attributeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Attribute",
        },
      },
    ],

    // Frequently Bought Together
    frequentlyPurchased: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    // Status and Soft Delete
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});
productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.name) {
    update.slug = slugify(update.name, { lower: true });
  }
  next();
});

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
