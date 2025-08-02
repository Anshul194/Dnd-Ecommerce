import CrudRepository from './CrudRepository.js';

class CouponRepository extends CrudRepository {
  constructor(model) {
    super(model);
    this.model = model;
  }

  async create(data) {
    try {
      return await this.model.create(data);
    } catch (error) {
      console.error('CouponRepository Create Error:', error.message);
      throw error;
    }
  }

  async getAll(filterConditions = {}, sortConditions = {}, page, limit, populateFields = [], selectFields = {}) {
    try {
      let query = this.model.find(filterConditions).select(selectFields);
      
      if (populateFields.length > 0) {
        populateFields.forEach(field => {
          query = query.populate(field);
        });
      }

      if (Object.keys(sortConditions).length > 0) {
        query = query.sort(sortConditions);
      }

      const totalCount = await this.model.countDocuments(filterConditions);

      if (page && limit) {
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
      }

      const results = await query.exec();

      return {
        results,
        totalCount,
        currentPage: page || 1,
        pageSize: limit || 10
      };
    } catch (error) {
      console.error('CouponRepository getAll Error:', error.message);
      throw error;
    }
  }

  async findByCode(code) {
    try {
      return await this.model.findOne({ code, isActive: true });
    } catch (error) {
      console.error('CouponRepository findByCode Error:', error.message);
      throw error;
    }
  }

  async softDelete(couponId) {
    try {
      return await this.model.findByIdAndUpdate(
        couponId,
        { isDeleted: true },
        { new: true }
      );
    } catch (error) {
      console.error('CouponRepository softDelete Error:', error.message);
      throw error;
    }
  }

  async incrementUsedCount(couponId) {
    try {
      return await this.model.findByIdAndUpdate(
        couponId,
        { $inc: { usedCount: 1 } },
        { new: true }
      );
    } catch (error) {
      console.error('CouponRepository incrementUsedCount Error:', error.message);
      throw error;
    }
  }
}

export default CouponRepository;