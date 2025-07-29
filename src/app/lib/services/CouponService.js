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


  async applyCoupon(data, conn) {
    try {
      const { code, cartValue } = data;
      if (!code || cartValue === undefined) {
        throw new Error('Coupon code and cart value are required');
      }
      if (typeof cartValue !== 'number' || cartValue < 0) {
        throw new Error('Cart value must be a non-negative number');
      }

      const coupon = await this.couponRepository.findByCode(code);
      if (!coupon) {
        throw new Error('Invalid Coupon');
      }

      // Check expiration
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        throw new Error('Coupon has expired');
      }

      // Check usage limit
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw new Error('Coupon usage limit exceeded');
      }

      // Check minimum cart value
      if (cartValue < coupon.minCartValue) {
        throw new Error(`Cart value must be at least ${coupon.minCartValue}`);
      }

      // Calculate discount
      let discount = 0;
      if (coupon.type === 'flat') {
        discount = coupon.value;
      } else if (coupon.type === 'percent') {
        discount = (coupon.value / 100) * cartValue;
      }

      // Increment usedCount
      await this.couponRepository.incrementUsedCount(coupon._id);

      return {
        success: true,
        message: 'Coupon applied successfully',
        data: {
          discount,
          coupon
        }
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