import VariantService from '../services/VariantService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

const variantService = new VariantService();

// POST /api/variant
export const createVariant = async (req, res) => {
  try {
    const data = req.body;
    const variant = await variantService.create(data);
    return successResponse(res, variant, 'Variant created successfully');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to create variant');
  }
};

// GET /api/variant
export const getAllVariants = async (req, res) => {
  try {
    const variants = await variantService.getAll();
    return successResponse(res, variants, 'Variants fetched successfully');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to fetch variants');
  }
};

// GET /api/variant/[id]
export const getVariantById = async (id) => {
  try {
    const variant = await variantService.getById(id);
    if (!variant) {
      return { success: false, message: 'Variant not found', data: null };
    }
    return { success: true, message: 'Variant fetched successfully', data: variant };
  } catch (err) {
    return { success: false, message: err.message || 'Failed to fetch variant', data: null };
  }
};

// PUT /api/variant/[id]
export const updateVariant = async (id, data) => {
  try {
    const updatedVariant = await variantService.update(id, data);
    if (!updatedVariant) {
      return { success: false, message: 'Variant not found or not updated', data: null };
    }
    return { success: true, message: 'Variant updated successfully', data: updatedVariant };
  } catch (err) {
    return { success: false, message: err.message || 'Failed to update variant', data: null };
  }
};

// DELETE /api/variant/[id]
export const deleteVariant = async (id) => {
  try {
    const variant = await variantService.delete(id);  // was softDelete
    return {
      success: true,
      message: 'Variant deleted successfully',
      data: variant
    };
  } catch (err) {
    return {
      success: false,
      message: err.message || 'Failed to delete variant',
      data: null
    };
  }
};