import mongoose from 'mongoose';
import CrudRepository from './CrudRepository.js';
import { ProductSchema } from '../models/Product.js';
import { VariantSchema } from '../models/Variant.js';

class OrderRepository extends CrudRepository {
  constructor(model, connection) {
    super(model);
    this.model = model;
    this.connection = connection || mongoose;
    console.log('OrderRepository initialized with connection:', this.connection ? this.connection.name || 'global mongoose' : 'no connection');
  }

  async create(data) {
    try {
      console.log('Creating order with data:', JSON.stringify(data, null, 2));
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
      console.log('Connection name:', this.connection.name || 'global mongoose');
      const Product = this.connection.models.Product || this.connection.model('Product', ProductSchema);
      console.log('Using Product model:', Product.modelName);
      console.log('Database:', this.connection.name || 'global mongoose');

      // Log all available product IDs
      const allProducts = await Product.find({}, '_id');
      const allProductIds = allProducts.map(p => p._id.toString());
      console.log('All available product IDs:', allProductIds);
      console.log('Total products:', allProductIds.length);

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error(`Invalid productId: ${productId}`);
      }

      const product = await Product.findById(productId).select('price');
      if (!product) {
        throw new Error(`Product ${productId} not found`);
      }
      console.log('Found product:', product);
      return product;
    } catch (error) {
      console.error('OrderRepository findProductById Error:', error.message);
      throw error;
    }
  }

  async findVariantById(variantId) {
    console.log('Finding variant by ID:', variantId);
    try {
      if (!this.connection) {
        throw new Error('Database connection is not provided');
      }
      console.log('Connection name:', this.connection.name || 'global mongoose');
      const Variant = this.connection.models.Variant || this.connection.model('Variant', VariantSchema);
      console.log('Using Variant model:', Variant.modelName);
      console.log('Database:', this.connection.name || 'global mongoose');

      // Log all available variant IDs
      const allVariants = await Variant.find({}, '_id');
      const allVariantIds = allVariants.map(v => v._id.toString());
      console.log('All available variant IDs:', allVariantIds);
      console.log('Total variants:', allVariantIds.length);

      if (!mongoose.Types.ObjectId.isValid(variantId)) {
        throw new Error(`Invalid variantId: ${variantId}`);
      }

      const variant = await Variant.findById(variantId).select('price');
      if (!variant) {
        throw new Error(`Variant ${variantId} not found`);
      }
      console.log('Found variant:', variant);
      return variant;
    } catch (error) {
      console.error('OrderRepository findVariantById Error:', error.message);
      throw error;
    }
  }
}

export default OrderRepository;