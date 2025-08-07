import mongoose from 'mongoose';
import { ReviewSchema } from '../models/Review.js';

export default class ReviewRepository {
  constructor(connection) {
    this.connection = connection || mongoose;
    this.Review = this.connection.models.Review || this.connection.model('Review', ReviewSchema);
    console.log('ReviewRepository initialized with connection:', this.connection ? this.connection.name || 'global mongoose' : 'no connection');
  }

  async create(data) {
    try {
      console.log('Creating review with data:', JSON.stringify(data, null, 2));
      return await this.Review.create(data);
    } catch (error) {
      console.error('ReviewRepository Create Error:', error.message);
      throw error;
    }
  }

  async findById(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid reviewId: ${id}`);
      }
      const review = await this.Review.findById(id);
      if (!review) {
        throw new Error(`Review ${id} not found`);
      }
      return review;
    } catch (error) {
      console.error('ReviewRepository findById Error:', error.message);
      throw error;
    }
  }

  async findByProductId(productId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error(`Invalid productId: ${productId}`);
      }
      return await this.Review.find({ productId }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('ReviewRepository findByProductId Error:', error.message);
      throw error;
    }
  }

  async update(id, data) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid reviewId: ${id}`);
      }
      const review = await this.Review.findByIdAndUpdate(id, data, { new: true });
      if (!review) {
        throw new Error(`Review ${id} not found`);
      }
      return review;
    } catch (error) {
      console.error('ReviewRepository update Error:', error.message);
      throw error;
    }
  }

  async delete(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid reviewId: ${id}`);
      }
      const review = await this.Review.findByIdAndDelete(id);
      if (!review) {
        throw new Error(`Review ${id} not found`);
      }
      return true;
    } catch (error) {
      console.error('ReviewRepository delete Error:', error.message);
      throw error;
    }
  }
}