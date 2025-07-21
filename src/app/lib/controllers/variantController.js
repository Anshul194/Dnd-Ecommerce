import VariantService from '../services/VariantService.js';
import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../../utils/response.js';

const variantService = new VariantService();

// ✅ POST /api/variant
export const createVariant = async (req, res) => {
  try {
    const data = req.body;

    // Step 1: Validate required fields
    if (!data.title || typeof data.title !== 'string') {
      return errorResponse(res, 'Validation failed', 400, ['Title is required and must be a string.']);
    }

    if (!data.productId || !Array.isArray(data.attributes)) {
      return errorResponse(res, 'Validation failed', 400, ['Product ID and attributes are required.']);
    }

    // Step 2: Get the product
    const product = await Product.findById(data.productId).lean();
    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    const allowedAttributeIds = product.attributeSet
      .map(attr => attr.attributeId)
      .filter(id => id)
      .map(id => id.toString());

    const providedAttributeIds = data.attributes.map(attr => attr.attributeId?.toString());

    // Step 3: Validate attributes
    const invalidAttributes = providedAttributeIds.filter(id => !allowedAttributeIds.includes(id));

    if (invalidAttributes.length > 0) {
      return errorResponse(
        res,
        'Validation failed',
        400,
        invalidAttributes.map(id => `Attribute ${id || 'undefined'} is not allowed for this product.`)
      );
    }

    // Step 4: Create the variant
    const variant = await variantService.create(data);
    return successResponse(res, variant, 'Variant created successfully');

  } catch (err) {
    return errorResponse(res, err.message || 'Failed to create variant', 400, err.details || []);
  }
};