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
      return res.status(400).json(errorResponse('Title is required and must be a string.'));
    }

    if (!data.productId || !Array.isArray(data.attributes)) {
      return res.status(400).json(errorResponse('Product ID and attributes are required.'));
    }

    // Step 2: Get the product
    const product = await Product.findById(data.productId).lean();
    if (!product) {
      return res.status(404).json(errorResponse('Product not found'));
    }

    const allowedAttributeIds = product.attributeSet
      .map(attr => attr.attributeId)
      .filter(id => id)
      .map(id => id.toString());

    const providedAttributeIds = data.attributes.map(attr => attr.attributeId?.toString());

    // Step 3: Validate attributes
    const invalidAttributes = providedAttributeIds.filter(id => !allowedAttributeIds.includes(id));

    if (invalidAttributes.length > 0) {
      return res.status(400).json(errorResponse(
        invalidAttributes.map(id => `Attribute ${id || 'undefined'} is not allowed for this product.`).join(', ')
      ));
    }

    // Step 4: Create the variant
    const variant = await variantService.create(data);
    return res.status(201).json(successResponse('Variant created successfully', variant));

  } catch (err) {
    return res.status(500).json(errorResponse(err.message || 'Failed to create variant'));
  }
};