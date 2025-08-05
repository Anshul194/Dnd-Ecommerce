import { boolean } from "joi";
import mongoose from "mongoose";
import { type } from "os";
import slugify from "slugify";

export const productSchema = new mongoose.Schema(
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
      // type:String
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
    },


searchKeywords: {
      type: [String],
      default: [],
    },


    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },

    // Media
    images: [
      {
      url: String, // Image URL
      alt: String, // Alt text for accessibility/SEO
      },
    ], // Product gallery images
    thumbnail: {
      url: String, // Primary display image URL
      alt: String, // Alt text for thumbnail
    },

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


    ingredients: [
      {
        name: String,
        quantity: String,
        description: String,
        image: String,
        alt: String,
      },
    ],

    benefits: [
      {
        title: String,
        description: String,
        image: String,
        alt: String,
      },
    ],

    precautions: [
      {
        title: String,
        description: String,
        image: String,
        alt: String,
      },
    ],


    // Description Media Section
    descriptionImages: [
      {
      url: String,
      alt: String,
      },
    ],
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

    isTopRated: {
      type: Boolean,
      default: false,
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

    custom_template: {type:boolean, default: false}, // Custom template for product page
    templateId  : {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
    },
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

export const ProductSchema = productSchema;
export const ProductModel = mongoose.models.Product || mongoose.model('Product', productSchema);
export default ProductModel;
