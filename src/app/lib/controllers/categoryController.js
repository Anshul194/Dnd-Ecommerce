import CategoryService from '../.././lib/services/categoryService.js';
import { saveFile, validateImageFile } from '../../config/fileUpload.js';
import Category from '../../lib/models/Category.js';
import initRedis from '../../config/redis.js';
import { categoryCreateValidator, categoryUpdateValidator } from '../../validators/categoryValidator.js';
import { successResponse, errorResponse } from '../../utils/response.js';

const categoryService = new CategoryService();
const redis = initRedis(); 

// Helper to refresh allCategories cache
async function refreshCategoriesCache() {
  const allCategories = await categoryService.getAllCategories({});
  await redis.set('allCategories', JSON.stringify(allCategories));
}

export async function createCategory(form) {
  try {
    let imageUrl = '';
    let thumbnailUrl = '';

     console.log('Create Category form:', form);
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

    const existing = await categoryService.findByName(name);
    console.log('Existing Category:', existing?.status);
 
    if (existing?.status !== 404) {
      return {
        status: 400,
        body: errorResponse('Category with this name already exists', 400),
      };
    }
    console.log('Category name:', image);
    console.log('Category description:', image instanceof File);
    
    if (image && image instanceof File) {
      try {
        validateImageFile(image);
        imageUrl = await saveFile(image, 'category-images');
        console.log('Image saved at:', imageUrl);
      } catch (fileError) {
        return {
          status: 400,
          body: errorResponse('Image upload error', 400, fileError.message),
        };
      }
    } else if (typeof image === 'string') {
      imageUrl = image;
    }

    if (thumbnail && thumbnail instanceof File) {
      try {
        validateImageFile(thumbnail);
        thumbnailUrl = await saveFile(thumbnail, 'category-thumbnails');
      } catch (fileError) {
        return {
          status: 400,
          body: errorResponse('Thumbnail upload error', 400, fileError.message),
        };
      }
    } else if (typeof thumbnail === 'string') {
      thumbnailUrl = thumbnail;
    }

    const { error, value } = categoryCreateValidator.validate({
      name,
      slug,
      description,
      image: imageUrl,
      thumbnail: thumbnailUrl,
      seoTitle,
      seoDescription,
      status,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' || isFeatured === true : undefined
    });

    if (error) {
      return {
        status: 400,
        body: errorResponse('Validation error', 400, error.details),
      };
    }

    const newCategory = await categoryService.createCategory(value);
    await refreshCategoriesCache();
    console.log('New Category created:', newCategory);

    return {
      status: 201,
      body: successResponse("Category created", newCategory),
    };
  } catch (err) {
    console.error('Create Category error:', err.message);
    return {
      status: 500,
      body: errorResponse('Server error', 500),
    };
  }
}




export async function getCategories(query) {
  try {
    console.log('Get Categories query:', query);
    const result = await categoryService.getAllCategories(query);

    return {
      status: 200,
      body: successResponse("Categories fetched successfully", result),
    };
  } catch (err) {
    console.error('Get Categories error:', err.message);
    return {
      status: 500,
      body: errorResponse('Server error', 500),
    };
  }
}



export async function getCategoryById(id) {
  try {
    const category = await categoryService.getCategoryById(id);
    if (!category) {
      return {
        status: 404,
        body: errorResponse("Category not found", 404),
      };
    }
    return {
      status: 200,
      body: successResponse("Category fetched", category),
    };
  } catch (err) {
    console.error('Get Category error:', err.message);
    return {
      status: 500,
      body: { success: false, message: 'Server error' }
    };
  }
}

export async function updateCategory(id, data) {
  try {
    let imageUrl = '';
    const { image, ...fields } = data;

    if (image && image instanceof File) {
      try {
        validateImageFile(image);
        imageUrl = await saveFile(image, 'category-images');
      } catch (fileError) {
        return {
          status: 400,
          body: { success: false, message: 'Image upload error', details: fileError.message }
        };
      }
    }

    const cleanedFields = Object.entries(fields).reduce((acc, [key, value]) => {
      if (value !== '') acc[key] = value;
      return acc;
    }, {});

    const payload = imageUrl ? { ...cleanedFields, image: imageUrl } : cleanedFields;

    const { error, value } = categoryUpdateValidator.validate(payload);
    if (error) {
      return {
        status: 400,
        body: errorResponse("Validation error", 400, error.details),
      };
    }
    if (!updated) {
      return {
        status: 404,
        body: errorResponse("Category not found", 404),
      };
    }

    // Invalidate and refresh cache
    await refreshCategoriesCache();

    return {
      status: 200,
      body: successResponse("Category updated", updated),
    };
  } catch (err) {
    console.error('Update Category error:', err.message);
    return {
      status: 500,
      body: { success: false, message: 'Server error' }
    };
  }
}

export async function deleteCategory(id) {
  try {
    const deleted = await categoryService.deleteCategory(id);
    if (!deleted) {
      return {
        status: 404,
        body: errorResponse("Category not found", 404),
      };
    }

    // Invalidate and refresh cache
    await refreshCategoriesCache();

    return {
      status: 200,
      body: successResponse("Category deleted", deleted),
    };
  } catch (err) {
    console.error('Delete Category error:', err.message);
    return {
      status: 500,
      body: { success: false, message: 'Server error' }
    };
  }
}





export async function getAttributesByCategoryId(categoryId) {
  try {
    const attributes = await ProductAttribute.find({
      category_id: categoryId,
      deletedAt: null
    });

    return {
      status: 200,
      body: successResponse("Attributes fetched successfully", attributes),
    };
  } catch (err) {
    console.error('Error fetching attributes for category:', err.message);
    return {
      status: 500,
      body: errorResponse('Failed to fetch attributes', 500)
    };
  }
}

export async function getNavbarCategoriesWithAttributes() {
  try {
    const categories = await Category.find({ deletedAt: null });

    const categoryIds = categories.map((c) => c._id.toString());

    const attributes = await ProductAttribute.find({
      category_id: { $in: categoryIds },
      deletedAt: null,
    });

    // Group attributes by category_id
    const groupedAttributes = {};
    for (const attr of attributes) {
      const catId = attr.category_id.toString();
      if (!groupedAttributes[catId]) groupedAttributes[catId] = [];
      groupedAttributes[catId].push(attr);
    }

    // Attach attributes to each category
    const result = categories.map((cat) => {
      return {
        _id: cat._id,
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        status: cat.status,
        attributes: groupedAttributes[cat._id.toString()] || [],
      };
    });

    return {
      status: 200,
      body: successResponse("Categories with attributes fetched", result),
    };
  } catch (err) {
    console.error('Navbar fetch error:', err.message);
    return {
      status: 500,
      body: errorResponse('Failed to fetch categories', 500),
    };
  }
}
