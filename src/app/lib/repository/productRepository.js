// lib/repository/productRepository.js
import CrudRepository from "./CrudRepository.js";
import mongoose from 'mongoose';
import { attributeSchema } from '../models/Attribute.js';
import { variantSchema } from '../models/Variant.js'; 
import { influencerVideoSchema } from '../models/InfluencerVideo.js';

class ProductRepository extends CrudRepository {

  // Fetch all products and attach variants with attributes to each
async getAll(filter = {}, sortConditions = {}, pageNum = 1, limitNum = 10, populateFields = [], selectFields = {}, conn) {
  try {
    const connection = conn || this.model.db;
    
    // Register Attribute model if not already registered
    if (!connection.models.Attribute) {
      const Attribute = mongoose.models.Attribute || mongoose.model("Attribute", attributeSchema);
      connection.model('Attribute', attributeSchema);
    }
    
    // Register Wishlist model with your schema if not already registered
    let Wishlist;
    if (!connection.models.Wishlist) {
      // Import your wishlist schema
      const wishlistItemSchema = new mongoose.Schema({
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
        addedAt: {
          type: Date,
          default: Date.now
        }
      }, { _id: false });

      const wishlistSchema = new mongoose.Schema({
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
          unique: true
        },
        items: [wishlistItemSchema],
        updatedAt: {
          type: Date,
          default: Date.now
        }
      }, {
        timestamps: true
      });

      wishlistSchema.pre('save', function(next) {
        this.updatedAt = Date.now();
        next();
      });

      Wishlist = connection.model('Wishlist', wishlistSchema);
    } else {
      Wishlist = connection.models.Wishlist;
    }

    const populateOptions = [
      { path: 'attributeSet.attributeId' }
    ];

    // Calculate skip value for pagination
    const skip = (pageNum - 1) * limitNum;

    // Find products with pagination and sorting
    const products = await this.model
      .find(filter)
      .populate(populateOptions)
      .sort(sortConditions)
      .skip(skip)
      .limit(limitNum)
      .select(selectFields);

    const results = [];
    
    for (const productDoc of products) {
      const variants = await this.getVariantsWithAttributes(productDoc._id, connection);
      const productObj = productDoc.toObject ? productDoc.toObject() : productDoc;
      
      // Get wishlist data for this product using aggregation
      const wishlistUsers = await Wishlist.aggregate([
        {
          $match: {
            "items.product": productDoc._id
          }
        },
        {
          $unwind: "$items"
        },
        {
          $match: {
            "items.product": productDoc._id
          }
        },
        {
          $project: {
            userId: "$user",
            variantId: "$items.variant",
            addedAt: "$items.addedAt",
            _id: 0
          }
        }
      ]);
      
      // Format wishlist data - only userId
      const uniqueUsers = [...new Set(wishlistUsers.map(item => item.userId.toString()))];
      productObj.wishlist = uniqueUsers;
      
      // Add wishlist count for convenience
      productObj.wishlistCount = uniqueUsers.length;
      
      productObj.variants = variants;
      results.push(productObj);
    }

    // Get total count for pagination info
    const totalCount = await this.model.countDocuments(filter);
    
    return {
      products: results,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
        hasPrevPage: pageNum > 1
      }
    };
  } catch (error) {
    console.error('Repository getAll Error:', error.message);
    throw error;
  }
}
  constructor(model) {
    super(model);
    this.model = model;
  }

  setModel(model) {
    this.model = model;
  }

  // Optionally override create/findById/update/delete if you need custom logic
  async create(data) {
    try {
      return await this.model.create(data);
    } catch (error) {
      console.error("Repository Create Error:", error.message);
      throw error;
    }
  }

 async findById(id) {
    try {
      console.log('Repo findById called with:', id);
      const conn = this.model.db;
      
      if (!conn.models.Attribute) {
        conn.model('Attribute', attributeSchema);
      }
      if (!conn.models.InfluencerVideo) {
        conn.model('InfluencerVideo', influencerVideoSchema);
      }

      const populateOptions = [
        { path: 'attributeSet.attributeId' }
      ];

      let productDoc;
      if (mongoose.Types.ObjectId.isValid(id)) {
        productDoc = await this.model.findById(id)
          .populate(populateOptions);
      } else {
        productDoc = await this.model.findOne({ slug: id })
          .populate(populateOptions);
      }

      if (!productDoc) return null;

      const variants = await this.getVariantsWithAttributes(productDoc._id, conn);

      // Fetch InfluencerVideos where productId matches and type is "product"
      const InfluencerVideo = conn.models.InfluencerVideo;
      const influencerVideos = await InfluencerVideo.find({
        productId: productDoc._id,
        type: 'product'
      }).select('title description videoUrl videoType type productId createdAt updatedAt');

      const productObj = productDoc.toObject ? productDoc.toObject() : productDoc;
      productObj.variants = variants;
      productObj.influencerVideos = influencerVideos;

      return productObj;
    } catch (error) {
      console.error("Repository FindById Error:", error.message);
      throw error;
    }
  }

  // Helper to fetch all variants for a product, with their attributes populated
  async getVariantsWithAttributes(productId, conn) {
    try {
      // Dynamically require Variant schema/model
      const Variant = conn.models.Variant || conn.model('Variant', variantSchema);
      if (!conn.models.Attribute) {
        conn.model('Attribute', attributeSchema);
      }
      return Variant.find({ productId, deletedAt: null })
        .populate('attributes.attributeId');
    } catch (error) {
      console.error('getVariantsWithAttributes error:', error.message);
      throw error;
    }
  }

  async delete(id) {
    try {
      console.log("Repo softDelete called with:", id);
      return await this.model.findByIdAndUpdate(
        id,
        { deletedAt: new Date() },
        { new: true }
      );
    } catch (err) {
      console.error("Repo softDelete error:", err);
      throw err;
    }
  }
}

export default ProductRepository;