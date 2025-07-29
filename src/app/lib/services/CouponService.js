import CouponRepository from '../repository/CouponRepository.js';

class CouponService {
  constructor(couponRepository) {
    this.couponRepository = couponRepository;
  }

  async createCoupon(data, conn) {
    try {
      // Validate required fields
      if (!data.code || !data.type || !data.value) {
        throw new Error('Code, type, and value are required');
      }

      // Ensure type is valid
      if (!['percent', 'flat'].includes(data.type)) {
        throw new Error('Invalid coupon type. Must be "percent" or "flat"');
      }

      // Validate value
      if (data.value <= 0) {
        throw new Error('Value must be greater than 0');
      }

      if (data.minCartValue && data.minCartValue < 0) {
        throw new Error('Minimum cart value cannot be negative');
      }

      if (data.usageLimit && data.usageLimit <= 0) {
        throw new Error('Usage limit must be greater than 0');
      }

      // Create coupon
      const coupon = await this.couponRepository.create(data);
      return {
        success: true,
        message: 'Coupon created successfully',
        data: coupon
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  async getAllCoupons(query = {}, conn) {
    try {
      const {
        page = 1,
        limit = 10,
        filters = '{}',
        sort = '{}',
        populateFields = [],
        selectFields = {},
        isActive
      } = query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
      const parsedSort = typeof sort === 'string' ? JSON.parse(sort) : sort;

      // Build filter conditions
      const filterConditions = { ...parsedFilters };
      if (isActive !== undefined) {
        filterConditions.isActive = isActive === 'true' || isActive === true;
      }

      // Build sort conditions
      const sortConditions = {};
      for (const [field, direction] of Object.entries(parsedSort)) {
        sortConditions[field] = direction === 'asc' ? 1 : -1;
      }

      // Fetch coupons with pagination
      const { results, totalCount, currentPage, pageSize } = await this.couponRepository.getAll(
        filterConditions,
        sortConditions,
        pageNum,
        limitNum,
        populateFields,
        selectFields
      );

      // Calculate total pages
      const totalPages = Math.ceil(totalCount / limitNum);

      return {
        success: true,
        message: 'Coupons fetched successfully',
        data: results,
        currentPage,
        totalPages,
        totalCount
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }
}

export default CouponService;