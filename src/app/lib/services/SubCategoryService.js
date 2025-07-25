import SubCategoryRepository from '../repository/SubCategoryRepository.js';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { successResponse, errorResponse } from '../../utils/response.js';

class SubCategoryService {
  constructor(conn) {
    this.conn = conn;
    this.subCategoryRepo = new SubCategoryRepository(conn);
  }

  async getSubCategoriesByParentCategoryId(categoryId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return errorResponse('Invalid parent category ID', StatusCodes.BAD_REQUEST);
      }

      const subCategories = await this.subCategoryRepo.findByParentCategory(categoryId);
      return successResponse(subCategories, 'Subcategories fetched', StatusCodes.OK);
    } catch (error) {
      console.error('Error in getSubCategoriesByParentCategoryId:', error.message);
      return errorResponse('Cannot fetch subcategories', StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  async getAllSubCategories(query) {
    try {
      const { page = 1, limit = 10, filters = "{}", searchFields = "{}", sort = "{}" } = query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      const parsedFilters = JSON.parse(filters);
      const parsedSearchFields = JSON.parse(searchFields);
      const parsedSort = JSON.parse(sort);

      const filterConditions = { deletedAt: null };
      for (const [key, value] of Object.entries(parsedFilters)) {
        filterConditions[key] = value;
      }

      const searchConditions = [];
      for (const [field, term] of Object.entries(parsedSearchFields)) {
        searchConditions.push({ [field]: { $regex: term, $options: "i" } });
      }
      if (searchConditions.length > 0) {
        filterConditions.$or = searchConditions;
      }

      const sortConditions = {};
      for (const [field, direction] of Object.entries(parsedSort)) {
        sortConditions[field] = direction === "asc" ? 1 : -1;
      }

      const subCategories = await this.subCategoryRepo.getAll(filterConditions, sortConditions, pageNum, limitNum);
      return successResponse(subCategories, 'Subcategories fetched', StatusCodes.OK);
    } catch (error) {
      console.error("Error fetching all subcategories:", error.message);
      return errorResponse("Cannot fetch subcategory data", StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  async getSubCategoryById(id) {
    try {
      const subCategory = await this.subCategoryRepo.findById(id);
      if (!subCategory) {
        return errorResponse('Subcategory not found', StatusCodes.NOT_FOUND);
      }
      return successResponse(subCategory, 'Subcategory fetched', StatusCodes.OK);
    } catch (error) {
      console.error('Error in getSubCategoryById:', error);
      return errorResponse('Error fetching subcategory', StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  async createSubCategory(data) {
    try {
      const created = await this.subCategoryRepo.create(data);
      return successResponse(created, 'Subcategory created', StatusCodes.CREATED);
    } catch (error) {
      console.error('Error in createSubCategory:', error.message);
      return errorResponse('Error creating subcategory', StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  async findByName(name) {
    try {
      const found = await this.subCategoryRepo.findByName(name);
      if (!found) {
        return errorResponse('Subcategory not found', StatusCodes.NOT_FOUND);
      }
      return successResponse(found, 'Subcategory found', StatusCodes.OK);
    } catch (error) {
      console.error('Error in findByName:', error);
      return errorResponse('Error finding subcategory', StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  async updateSubCategory(id, data) {
    try {
      const updated = await this.subCategoryRepo.update(id, data);
      if (!updated) {
        return errorResponse('Subcategory not found', StatusCodes.NOT_FOUND);
      }
      return successResponse(updated, 'Subcategory updated', StatusCodes.OK);
    } catch (error) {
      console.error('Error in updateSubCategory:', error);
      return errorResponse('Error updating subcategory', StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  async deleteSubCategory(id) {
    try {
      const deleted = await this.subCategoryRepo.softDelete(id);
      if (!deleted) {
        return errorResponse('Subcategory not found', StatusCodes.NOT_FOUND);
      }
      return successResponse(deleted, 'Subcategory deleted', StatusCodes.OK);
    } catch (error) {
      console.error('Error in deleteSubCategory:', error);
      return errorResponse('Error deleting subcategory', StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
  }
}

export default SubCategoryService;