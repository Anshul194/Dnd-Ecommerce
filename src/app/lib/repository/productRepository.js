import CrudRepository from "./CrudRepository.js";
import mongoose from 'mongoose';
import { attributeSchema } from '../models/Attribute.js';


class ProductRepository extends CrudRepository {

  // Fetch all products and attach variants with attributes to each
  async getAll(filter = {}) {
    try {
      const conn = this.model.db;
      if (!conn.models.Attribute) {
        const Attribute = mongoose.models.Attribute || mongoose.model("Attribute", attributeSchema);
        conn.model('Attribute', attributeSchema);
      }
      const populateOptions = [
        { path: 'attributeSet.attributeId' }
      ];
      const products = await this.model.find(filter).populate(populateOptions);
      const results = [];
      for (const productDoc of products) {
        const variants = await this.getVariantsWithAttributes(productDoc._id, conn);
        const productObj = productDoc.toObject ? productDoc.toObject() : productDoc;
        productObj.variants = variants;
        results.push(productObj);
      }
      return results;
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
      // Ensure Attribute model is registered on the same connection as Product
      const conn = this.model.db;
      if (!conn.models.Attribute) {
        // Dynamically require the schema to avoid circular imports
        const Attribute = mongoose.models.Attribute || mongoose.model("Attribute", attributeSchema);
        conn.model('Attribute', attributeSchema);
      }
      // Only populate product attributeSet.attributeId
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
      // Fetch variants for this product with attributes
      const variants = await this.getVariantsWithAttributes(productDoc._id, conn);
      // Attach variants to the returned product object (as plain object)
      const productObj = productDoc.toObject ? productDoc.toObject() : productDoc;
      productObj.variants = variants;
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
