import mongoose from 'mongoose';
import CrudRepository from './CrudRepository.js';
import { ProductSchema } from '../models/Product.js';
import { VariantSchema } from '../models/Variant.js';

class OrderRepository extends CrudRepository {
  constructor(model, connection) {
    super(model);
    this.model = model;
    this.connection = connection || mongoose; // Fallback to global mongoose if connection is undefined
  }

  async create(data) {
    try {
      return await this.model.create(data);
    } catch (error) {
      console.error('OrderRepository Create Error:', error.message);
      throw error;
    }
  }

  async findProductById(productId) {

    console.log('Finding product by ID:', productId);
    try {
      if (!this.connection) {
        throw new Error('Database connection is not provided');
      }
      const Product = this.connection.models.Product|| this.connection.model('Product', ProductSchema);

      console.log('Using Product model:', Product.modelName);
      console.log('Product ID to find:', productId);
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error(`Invalid productId: ${productId}`);
      }
      const product = await Product.findById({_id:productId}).select('price');
      if (!product) {
        throw new Error(`Product ${productId} not found`);
      }
      return product;
    } catch (error) {
      console.error('OrderRepository findProductById Error:', error.message);
      throw error;
    }
  }

  async findVariantById(variantId) {
    try {
      if (!this.connection) {
        throw new Error('Database connection is not provided');
      }
      const Variant = this.connection.models.Variant || this.connection.model('Variant', VariantSchema);
      if (!mongoose.Types.ObjectId.isValid(variantId)) {
        throw new Error(`Invalid variantId: ${variantId}`);
      }
      const variant = await Variant.findById(variantId).select('price');
      if (!variant) {
        throw new Error(`Variant ${variantId} not found`);
      }
      return variant;
    } catch (error) {
      console.error('OrderRepository findVariantById Error:', error.message);
      throw error;
    }
  }
}

export default OrderRepository;