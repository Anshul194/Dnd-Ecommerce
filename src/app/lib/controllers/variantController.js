import VariantService from '../services/VariantService.js';

export async function createVariant(req, conn) {
  try {
    const { productId, attributes } = req.body;
    if (!productId || !Array.isArray(attributes)) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'productId and attributes are required',
          data: null
        }
      };
    }

    // Fetch the product and its attributeSet
    const ProductModel = conn.models.Product || conn.model('Product');
    const product = await ProductModel.findById(productId).lean();
    if (!product) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Product not found',
          data: null
        }
      };
    }
    const allowedAttributeIds = (product.attributeSet || []).map(a => String(a.attributeId));
    // Validate each attributeId in the variant
    for (const attr of attributes) {
      if (!allowedAttributeIds.includes(String(attr.attributeId))) {
        return {
          status: 400,
          body: {
            success: false,
            message: `AttributeId ${attr.attributeId} is not allowed for this product`,
            data: null
          }
        };
      }
    }

    const variantService = new VariantService(conn);
    const variant = await variantService.createVariant(req.body);
    return {
      status: 201,
      body: {
        success: true,
        message: 'Variant created successfully',
        data: variant
      }
    };
  } catch (err) {
    return {
      status: 500,
      body: {
        success: false,
        message: 'Server error',
        data: null
      }
    };
  }
}

export async function getAllVariants(req, conn) {
  try {
    const variantService = new VariantService(conn);
    const query = req.query || {};
    const variants = await variantService.getAllVariants(query);
    return {
      status: 200,
      body: {
        success: true,
        message: 'Variants fetched successfully',
        data: variants
      }
    };
  } catch (err) {
    return {
      status: 500,
      body: {
        success: false,
        message: 'Server error',
        data: null
      }
    };
  }
}

export async function getVariantById(id, conn) {
  try {
    const variantService = new VariantService(conn);
    const variant = await variantService.getVariantById(id);
    if (!variant) {
      return {
        status: 404,
        body: {
          success: false,
          message: 'Variant not found',
          data: null
        }
      };
    }
    return {
      status: 200,
      body: {
        success: true,
        message: 'Variant found',
        data: variant
      }
    };
  } catch (err) {
    return {
      status: 500,
      body: {
        success: false,
        message: 'Server error',
        data: null
      }
    };
  }
}

export async function updateVariant(id, data, conn) {
  try {

   

    const variantService = new VariantService(conn);
    const updated = await variantService.updateVariant(id, data);
    return {
      status: 200,
      body: {
        success: true,
        message: 'Variant updated successfully',
        data: updated
      }
    };
  } catch (err) {
    console.log('Update Variant Error:', err.message);

    return {
      status: 500,
      body: {
        success: false,
        message: 'Server error',
        data: null
      }
    };
  }
}

export async function deleteVariant(id, conn) {
  try {
    const variantService = new VariantService(conn);
    const deleted = await variantService.deleteVariant(id);
    return {
      status: 200,
      body: {
        success: true,
        message: 'Variant deleted successfully',
        data: deleted
      }
    };
  } catch (err) {
    return {
      status: 500,
      body: {
        success: false,
        message: 'Server error',
        data: null
      }
    };
  }
}

export async function searchVariantsByTitle(req, conn) {
  try {
    const title = req.query.title;
    if (!title) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Title query parameter is required',
          data: null
        }
      };
    }
    const variantService = new VariantService(conn);
    const variants = await variantService.searchVariantsByTitle(title);
    return {
      status: 200,
      body: {
        success: true,
        message: 'Variants found',
        data: variants
      }
    };
  } catch (err) {
    return {
      status: 500,
      body: {
        success: false,
        message: 'Server error',
        data: null
      }
    };
  }
}
