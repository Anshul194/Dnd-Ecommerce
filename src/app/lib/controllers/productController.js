import { categorySchema } from '../models/Category.js';
import { attributeSchema } from '../models/Attribute.js';
import mongoose from 'mongoose';


function normalizeProductBody(body) {
  // Parse JSON arrays/objects if sent as strings (from FormData)
  const arrayFields = [
    "howToUseSteps",
    "ingredients",
    "benefits",
    "precautions",
    "attributeSet",
    "frequentlyPurchased",
    "highlights"
  ];
  arrayFields.forEach((field) => {
    if (typeof body[field] === "string") {
      try {
        body[field] = JSON.parse(body[field]);
      } catch {
        // fallback: wrap single value in array of object if needed
        if (["howToUseSteps", "ingredients", "benefits", "precautions"].includes(field)) {
          body[field] = [ { description: body[field] } ];
        } else {
          body[field] = [body[field]];
        }
      }
    }
  });
  // Convert boolean fields
  if (typeof body.isTopRated === "string") {
    body.isTopRated = body.isTopRated === "true";
  }
  return body;
}

class ProductController {
  constructor(service) {
    this.service = service;
  }

  async create(body, conn) {
    body = normalizeProductBody(body);
    try {
      // Basic validation
      console.log("Creating product with body:", conn);
      if (!body.name || !body.category) {
        return {
          success: false,
          message: "Name and category are required",
          data: null,
        };
      }
      // Check for duplicate by name or slug
      const existing = await this.service.productRepository.model.findOne({
        $or: [
          { name: body.name },
          { slug: body.slug || body.name?.toLowerCase().replace(/\s+/g, "-") },
        ],
        deletedAt: null,
      });
      if (existing) {
        return {
          success: false,
          message: "Duplicate product found (name or slug already exists)",
          data: null,
        };
      }

      // Validate referenced ObjectIds
      if (!conn || !conn.models) {
        return {
          success: false,
          message: "Database connection error: models not found",
          data: null,
        };
      }
      const models = conn.models;
      console.log("Validating referenced ObjectIds:", models);
      // Category
      if (body.category) {
        // Register Category model if missing
        if (!models.Category) {
          models.Category = conn.model("Category", categorySchema);
        }
        const catExists = await models.Category.findOne({
          _id: body.category,
          deletedAt: null,
          status: { $regex: /^active$/i },
        });
        if (!catExists)
          return {
            success: false,
            message: "Category does not exist or is inactive/deleted",
            data: null,
          };
      }
      // Subcategory
      if (body.subcategory) {
        if (!models.Subcategory) {
          models.Subcategory = conn.model("Subcategory", categorySchema);
        }
        const subcatExists = await models.Subcategory.findOne({
          _id: body.subcategory,
          deletedAt: null,
          status: { $regex: /^active$/i },
        });
        if (!subcatExists)
          return {
            success: false,
            message: "Subcategory does not exist or is inactive/deleted",
            data: null,
          };
      }
      // Brand
      if (body.brand) {
        const brandExists = await models.Brand?.findById(body.brand);
        if (!brandExists)
          return {
            success: false,
            message: "Brand does not exist",
            data: null,
          };
      }
      // attributeSet
      if (Array.isArray(body.attributeSet)) {
        for (const attr of body.attributeSet) {
          if (attr.attributeId) {
            if (!models.Attribute) {
              models.Attribute = conn.model(
                "Attribute",
                require("../models/Attribute.js").attributeSchema
              );
            }
            const attrExists = await models.Attribute?.findById(
              attr.attributeId
            );
            if (!attrExists)
              return {
                success: false,
                message: `AttributeId ${attr.attributeId} does not exist`,
                data: null,
              };
          }
        }
      }
      // frequentlyPurchased
      if (Array.isArray(body.frequentlyPurchased)) {
        for (const prodId of body.frequentlyPurchased) {
          const prodExists =
            await this.service.productRepository.model.findById(prodId);
          if (!prodExists)
            return {
              success: false,
              message: `FrequentlyPurchased ProductId ${prodId} does not exist`,
              data: null,
            };
        }
      }

      const product = await this.service.createProduct(body, conn);
      return { success: true, message: "Product created", data: product };
    } catch (error) {
      return { success: false, message: error.message, data: null };
    }
  }

async getAll(query, conn) {
  console.log('Controller received query:', query); // Log query
  try {
    const products = await this.service.getAllProducts(query, conn);
    return {
      success: true,
      message: "Products fetched",
      data: products
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: null
    };
  }
}

  async getById(id, conn) {
    try {
      const product = await this.service.getProductById(id, conn);
      if (!product)
        return { success: false, message: "Product not found", data: null };
      return { success: true, message: "Product fetched", data: product };
    } catch (error) {
      return { success: false, message: error.message, data: null };
    }
  }

  async update(id, body, conn) {
    body = normalizeProductBody(body);
    try {
      // Check if product exists
      const existing = await this.service.getProductById(id, conn);
      if (!existing) {
        return {
          success: false,
          message: "Product not found for update",
          data: null,
        };
      }
      // Optionally check for duplicate name/slug if updating name/slug
      // if (body.name || body.slug) {
      //   const duplicate = await this.service.productRepository.model.findOne({
      //     $or: [
      //       body.name ? { name: body.name } : {},
      //       body.slug ? { slug: body.slug } : {}
      //     ],
      //     _id: { $ne: id },
      //     deletedAt: null
      //   });
      //   if (duplicate) {
      //     return { success: false, message: "Duplicate product found (name or slug already exists)", data: null };
      //   }
      // }

      // Validate referenced ObjectIds
      const models = conn.models;
      if (body.category) {
        const catExists = await models.Category?.findById(body.category);
        if (!catExists)
          return {
            success: false,
            message: "Category does not exist",
            data: null,
          };
      }
      if (body.subcategory) {
        const subcatExists = await models.Subcategory?.findById(
          body.subcategory
        );
        if (!subcatExists)
          return {
            success: false,
            message: "Subcategory does not exist",
            data: null,
          };
      }
      if (body.brand) {
        const brandExists = await models.Brand?.findById(body.brand);
        if (!brandExists)
          return {
            success: false,
            message: "Brand does not exist",
            data: null,
          };
      }
      if (Array.isArray(body.attributeSet)) {
        for (const attr of body.attributeSet) {
          if (attr.attributeId) {
            const Attribute =mongoose.models.Attribute || mongoose.model("Attribute",attributeSchema);
            const attrExists = await Attribute.findById(attr.attributeId);
            if (!attrExists) return { success: false, message: `AttributeId ${attr.attributeId} does not exist`, data: null };
          }
        }
      }
      if (Array.isArray(body.frequentlyPurchased)) {
        for (const prodId of body.frequentlyPurchased) {
          const prodExists =
            await this.service.productRepository.model.findById(prodId);
          if (!prodExists)
            return {
              success: false,
              message: `FrequentlyPurchased ProductId ${prodId} does not exist`,
              data: null,
            };
        }
      }

      const product = await this.service.updateProduct(id, body, conn);
      return { success: true, message: "Product updated", data: product };
    } catch (error) {
      return { success: false, message: error.message, data: null };
    }
  }

  async delete(id, conn) {
    try {
      // Check if product exists
      const existing = await this.service.getProductById(id, conn);
      if (!existing) {
        return {
          success: false,
          message: "Product not found for delete",
          data: null,
        };
      }
      await this.service.deleteProduct(id, conn);
      return {
        success: true,
        message: "Product deleted successfully",
        data: null,
      };
    } catch (error) {
      return { success: false, message: error.message, data: null };
    }
  }
}

export default ProductController;
