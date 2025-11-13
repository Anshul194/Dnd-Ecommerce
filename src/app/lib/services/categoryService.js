
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { successResponse, errorResponse } from '../../utils/response.js';
import CategoryRepository from '../repository/categoryRepository.js';

class CategoryService {
  constructor(conn) {
    this.conn = conn;
    this.categoryRepo = new CategoryRepository(conn);
  }

  async getSubCategoriesByCategoryId(categoryId) {
    try {
      console.log('Fetching subcategories for categoryId:', categoryId);

      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        console.warn('Invalid categoryId:', categoryId);
        return errorResponse('Invalid categoryId', StatusCodes.BAD_REQUEST);
      }

      //   const subCategories = await SubCategory.find({ category: categoryId, deletedAt: null });
      //   console.log('Subcategories found:', subCategories);
      //   return successResponse(subCategories, 'Subcategories fetched', StatusCodes.OK);
    } catch (error) {
      console.log('Error in getSubCategoriesByCategoryId:', error.message);
      return errorResponse('Cannot fetch subcategories', StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  async getAllCategories(query) {
    try {
      console.log("Query Parameters category:", query);
      const { page = 1, limit = 10, filters = "{}", searchFields = "{}", sort = "{}" } = query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);


      // Parse JSON strings from query parameters to objects
      const parsedFilters = JSON.parse(filters);
      const parsedSearchFields = JSON.parse(searchFields);
      const parsedSort = JSON.parse(sort);

      // Build filter conditions for multiple fields
      const filterConditions = { deletedAt: null };

      for (const [key, value] of Object.entries(parsedFilters)) {
        filterConditions[key] = value;
      }

      // Build search conditions for multiple fields with partial matching
      const searchConditions = [];
      for (const [field, term] of Object.entries(parsedSearchFields)) {
        searchConditions.push({ [field]: { $regex: term, $options: "i" } });
      }
      if (searchConditions.length > 0) {
        filterConditions.$or = searchConditions;
      }

      // Build sort conditions
      const sortConditions = {};
      for (const [field, direction] of Object.entries(parsedSort)) {
        sortConditions[field] = direction === "asc" ? 1 : -1;
      }

      // Execute query with dynamic filters, sorting, and pagination
      const courseCategories = await this.categoryRepo.getAll(filterConditions, sortConditions, pageNum, limitNum);
      return successResponse(courseCategories, 'Categories fetched', StatusCodes.OK);
    } catch (error) {
      console.log("error category", error.message);
      return errorResponse("Cannot fetch data of all the courseCategories", StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  async getCategoryById(id) {
    try {
      const category = await this.categoryRepo.findById(id);
      if (!category) {
        return errorResponse('Category not found', StatusCodes.NOT_FOUND);
      }
      return successResponse(category, 'Category fetched', StatusCodes.OK);
    } catch (error) {
      console.error('Error in getCategoryById:', error);
      return errorResponse('Error fetching category', StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  async createCategory(data) {
    try {
      const created = await this.categoryRepo.create(data);
      return successResponse(created, 'Category created', StatusCodes.CREATED);
    } catch (error) {
      console.log('Error in createCategory:', error.message);
      return errorResponse('Error creating category', StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  async findByName(name) {
    try {
      const found = await this.categoryRepo.findByName(name);
      if (!found) {
        return errorResponse('Category not found', StatusCodes.NOT_FOUND);
      }
      return successResponse(found, 'Category found', StatusCodes.OK);
    } catch (error) {
      console.error('Error in findByName:', error);
      return errorResponse('Error finding category', StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  async updateCategory(id, data) {
    try {
      console.log('Service updateCategory called with:', id, data);
      const updated = await this.categoryRepo.update(id, data);
      if (!updated) {
        return errorResponse('Category not found', StatusCodes.NOT_FOUND);
      }
      return successResponse(updated, 'Category updated', StatusCodes.OK);
    } catch (error) {
      console.error('Error in updateCategory:', error);
      return errorResponse('Error updating category', StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  async deleteCategory(id) {
    try {
      console.log('Service deleteCategory called with:', id);
      const deleted = await this.categoryRepo.softDelete(id);
      if (!deleted) {
        return errorResponse('Category not found', StatusCodes.NOT_FOUND);
      }
      return successResponse(deleted, 'Category deleted', StatusCodes.OK);
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      return errorResponse('Error deleting category', StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
  }
}

export default CategoryService;
     