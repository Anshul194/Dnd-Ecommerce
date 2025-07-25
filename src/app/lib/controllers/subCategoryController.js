import SubCategoryService from '../../lib/services/SubCategoryService.js';
import { saveFile, validateImageFile } from '../../config/fileUpload.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { subCategoryCreateValidator, subCategoryUpdateValidator } from '../../validators/subCategoryValidator.js';
import SubCategory from '../../lib/models/SubCategory.js';
import Category from '../../lib/models/Category.js'; // ✅ Import Category model

const subCategoryService = new SubCategoryService();

export async function createSubCategory(form) {
  try {
    let imageUrl = '';
    let thumbnailUrl = '';

    const name = form.get('name');
    const slug = form.get('slug');
    const description = form.get('description');
    const image = form.get('image');
    const thumbnail = form.get('thumbnail');
    const seoTitle = form.get('seoTitle');
    const seoDescription = form.get('seoDescription');
    const status = form.get('status');
    const sortOrder = form.get('sortOrder');
    const isFeatured = form.get('isFeatured');
    const parentCategory = form.get('parentCategory');

    // ✅ Check if parent category exists
    const parentExists = await Category.findById(parentCategory);
    if (!parentExists) {
      return {
        status: 400,
        body: errorResponse('Parent category does not exist', 400),
      };
    }

    const existing = await subCategoryService.findByName(name);
    if (existing?.status !== 404) {
      return {
        status: 400,
        body: errorResponse('Subcategory with this name already exists', 400),
      };
    }

    if (image && image instanceof File) {
      validateImageFile(image);
      imageUrl = await saveFile(image, 'subcategory-images');
    } else if (typeof image === 'string') {
      imageUrl = image;
    }

    if (thumbnail && thumbnail instanceof File) {
      validateImageFile(thumbnail);
      thumbnailUrl = await saveFile(thumbnail, 'subcategory-thumbnails');
    } else if (typeof thumbnail === 'string') {
      thumbnailUrl = thumbnail;
    }

    const { error, value } = subCategoryCreateValidator.validate({
      name,
      slug,
      description,
      image: imageUrl,
      thumbnail: thumbnailUrl,
      seoTitle,
      seoDescription,
      status,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' || isFeatured === true : undefined,
      parentCategory
    });

    if (error) {
      console.error("🚫 Validation failed:", error.details);
      return {
        status: 400,
        body: errorResponse('Validation error', 400, error.details),
      };
    }

    const newSubCategory = await subCategoryService.createSubCategory(value);
    return {
      status: 201,
      body: successResponse("Subcategory created", newSubCategory),
    };
  } catch (err) {
    console.error('Create Subcategory error:', err.message);
    return {
      status: 500,
      body: errorResponse('Server error', 500),
    };
  }
}

export async function getSubCategories(query) {
  try {
    const result = await subCategoryService.getAllSubCategories(query);
    return {
      status: 200,
      body: successResponse("Subcategories fetched successfully", result),
    };
  } catch (err) {
    console.error('Get Subcategories error:', err.message);
    return {
      status: 500,
      body: errorResponse('Server error', 500),
    };
  }
}

export async function getSubCategoryById(id) {
  try {
    const subCategory = await subCategoryService.getSubCategoryById(id);
    if (!subCategory) {
      return {
        status: 404,
        body: errorResponse("Subcategory not found", 404),
      };
    }
    return {
      status: 200,
      body: successResponse("Subcategory fetched", subCategory),
    };
  } catch (err) {
    console.error('Get Subcategory error:', err.message);
    return {
      status: 500,
      body: { success: false, message: 'Server error' },
    };
  }
}

export async function updateSubCategory(id, data) {
  try {
    let imageUrl = '';
    const { image, ...fields } = data;

    if (image && image instanceof File) {
      validateImageFile(image);
      imageUrl = await saveFile(image, 'subcategory-images');
    }

    const cleanedFields = Object.entries(fields).reduce((acc, [key, value]) => {
      if (value !== '') acc[key] = value;
      return acc;
    }, {});

    const payload = imageUrl ? { ...cleanedFields, image: imageUrl } : cleanedFields;

    const { error, value } = subCategoryUpdateValidator.validate(payload);
    if (error) {
      return {
        status: 400,
        body: errorResponse("Validation error", 400, error.details),
      };
    }
    const updated = await subCategoryService.updateSubCategory(id, value);
    if (!updated) {
      return {
        status: 404,
        body: errorResponse("Subcategory not found", 404),
      };
    }
    return {
      status: 200,
      body: successResponse("Subcategory updated", updated),
    };
  } catch (err) {
    console.error('Update Subcategory error:', err.message);
    return {
      status: 500,
      body: { success: false, message: 'Server error' },
    };
  }
}

export async function deleteSubCategory(id) {
  try {
    const deleted = await subCategoryService.deleteSubCategory(id);
    if (!deleted) {
      return {
        status: 404,
        body: errorResponse("Subcategory not found", 404),
      };
    }
    return {
      status: 200,
      body: successResponse("Subcategory deleted", deleted),
    };
  } catch (err) {
    console.error('Delete Subcategory error:', err.message);
    return {
      status: 500,
      body: { success: false, message: 'Server error' },
    };
  }
}