import BrandService from "../services/brandService.js";
import { successResponse, errorResponse } from "../../../utils/response.js";

const brandService = new BrandService();

// Create Brand
export const createBrand = async (req, res) => {
  try {
    const brand = await brandService.createBrand(req.body);
    return successResponse(res, brand, "Brand created successfully", 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// Get All Brands (with optional search)
export const getAllBrands = async (req, res) => {
  try {
    const search = req.query.search || "";
    const brands = await brandService.getAllBrands(search);
    return successResponse(res, brands, "Brands fetched");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// Get Brand by ID
export const getBrandById = async (req, res) => {
  try {
    const brand = await brandService.getBrandById(req.params.id);
    if (!brand) return errorResponse(res, "Brand not found", 404);
    return successResponse(res, brand, "Brand found");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ✅ Update Brand (allows updating all fields)
export const updateBrand = async (req, res) => {
  try {
    const brand = await brandService.updateBrand(req.params.id, req.body);
    if (!brand) return errorResponse(res, "Brand not found", 404);
    return successResponse(res, brand, "Brand updated");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// Delete Brand
export const deleteBrand = async (req, res) => {
  try {
    const result = await brandService.deleteBrand(req.params.id);
    if (!result) return errorResponse(res, "Brand not found", 404);
    return successResponse(res, null, "Brand deleted");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};