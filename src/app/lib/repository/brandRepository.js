import mongoose from 'mongoose';
import { BrandSchema } from '../models/Brand.js';

export default class BrandRepository {
  constructor(connection) {
    this.connection = connection || mongoose;
    this.Brand = this.connection.models.Brand || this.connection.model('Brand', BrandSchema);
    console.log('BrandRepository initialized with connection:', this.connection ? this.connection.name || 'global mongoose' : 'no connection');
  }

  async create(data) {
    try {
      console.log('Creating brand with data:', JSON.stringify(data, null, 2));
      return await this.Brand.create(data);
    } catch (error) {
      console.error('BrandRepository Create Error:', error.message);
      throw error;
    }
  }

  async findAll({ search = "", page = 1, limit = 10 }) {
    try {
      const query = {};
      if (search) {
        query.name = { $regex: search, $options: "i" }; // Case-insensitive search
      }

      const skip = (page - 1) * limit;
      const totalCount = await this.Brand.countDocuments(query);
      const results = await this.Brand.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return {
        results,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        pageSize: limit,
      };
    } catch (error) {
      console.error('BrandRepository findAll Error:', error.message);
      throw error;
    }
  }

  async findById(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid brandId: ${id}`);
      }
      const brand = await this.Brand.findById(id);
      if (!brand) {
        throw new Error(`Brand ${id} not found`);
      }
      return brand;
    } catch (error) {
      console.error('BrandRepository findById Error:', error.message);
      throw error;
    }
  }

  async update(id, data) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid brandId: ${id}`);
      }
      const brand = await this.Brand.findByIdAndUpdate(id, data, { new: true });
      if (!brand) {
        throw new Error(`Brand ${id} not found`);
      }
      return brand;
    } catch (error) {
      console.error('BrandRepository update Error:', error.message);
      throw error;
    }
  }

  async delete(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid brandId: ${id}`);
      }
      const brand = await this.Brand.findByIdAndDelete(id);
      if (!brand) {
        throw new Error(`Brand ${id} not found`);
      }
      return true;
    } catch (error) {
      console.error('BrandRepository delete Error:', error.message);
      throw error;
    }
  }
}