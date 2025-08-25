import { categorySchema } from "../models/Category.js";
import { attributeSchema } from "../models/Attribute.js";
import mongoose from "mongoose";

function normalizeProductBody(body) {
  const arrayFields = [
    "howToUseSteps",
    "ingredients",
    "benefits",
    "precautions",
    "attributeSet",
    "frequentlyPurchased",
    "highlights",
    "searchKeywords",
  ];

  arrayFields.forEach((field) => {
    if (typeof body[field] === "string") {
      try {
        body[field] = JSON.parse(body[field]);
      } catch {
        body[field] = [];
      }
    } else if (
      body[field] === "" ||
      body[field] === null ||
      body[field] === undefined
    ) {
      body[field] = [];
    }

    // Normalize array fields that expect objects
    if (
      ["howToUseSteps", "ingredients", "benefits", "precautions"].includes(
        field
      ) &&
      Array.isArray(body[field])
    ) {
      body[field] = body[field]
        .filter((item) => item && typeof item === "object")
        .map((item) => ({
          title: item.title || "",
          description: item.description || "",
          image: item.image || undefined, // Keep as string (URL)
          alt: item.alt || undefined,
          name: item.name || undefined, // For ingredients
          quantity: item.quantity || undefined, // For ingredients
        }));
    }
  });

  // Normalize images and descriptionImages
  if (body.images) {
    body.images = body.images.filter(Boolean).map((img) => ({
      url: img.url || "",
      alt: img.alt || "",
    }));
  }
  if (body.descriptionImages) {
    body.descriptionImages = body.descriptionImages
      .filter(Boolean)
      .map((img) => ({
        url: img.url || "",
        alt: img.alt || "",
      }));
  }

  // Handle thumbnail normalization - FIXED
  if (body.thumbnail) {
    // If thumbnail is a string (URL), convert to object
    if (typeof body.thumbnail === "string") {
      body.thumbnail = {
        url: body.thumbnail,
        alt: "",
      };
    } else if (typeof body.thumbnail === "object") {
      // Ensure thumbnail object has both url and alt
      body.thumbnail = {
        url: body.thumbnail.url || "",
        alt: body.thumbnail.alt || "",
      };
    }

    // If no valid URL, remove thumbnail
    if (!body.thumbnail.url) {
      delete body.thumbnail;
    }
  }

  // Convert boolean fields
  if (typeof body.isTopRated === "string") {
    body.isTopRated = body.isTopRated === "true";
  }
  if (typeof body.isAddon === "string") {
    body.isAddon = body.isAddon === "true";
  }

  // Handle ObjectId fields
  const optionalObjectIdFields = ["subcategory", "brand", "templateId"];
  optionalObjectIdFields.forEach((field) => {
    if (
      body[field] === "" ||
      body[field] === null ||
      body[field] === undefined
    ) {
      body[field] = null;
    } else if (
      body[field] &&
      typeof body[field] === "string" &&
      mongoose.Types.ObjectId.isValid(body[field])
    ) {
      body[field] = new mongoose.Types.ObjectId(body[field]);
    }
  });

  if (
    body.category &&
    typeof body.category === "string" &&
    mongoose.Types.ObjectId.isValid(body.category)
  ) {
    body.category = new mongoose.Types.ObjectId(body.category);
  }

  // Normalize attributeSet
  if (Array.isArray(body.attributeSet)) {
    body.attributeSet = body.attributeSet.map((attr) => ({
      attributeId:
        typeof attr.attributeId === "string" &&
        mongoose.Types.ObjectId.isValid(attr.attributeId)
          ? new mongoose.Types.ObjectId(attr.attributeId)
          : attr.attributeId,
    }));
  }

  return body;
}

class ProductController {
  constructor(service) {
    this.service = service;
  }

  async create(body, conn) {
    body = normalizeProductBody(body);
    console.log("Normalized product body:", JSON.stringify(body, null, 2));

    try {
      if (!body.name || !body.category) {
        return {
          success: false,
          message: "Name and category are required",
          data: null,
        };
      }

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

      if (!conn || !conn.models) {
        return {
          success: false,
          message: "Database connection error: models not found",
          data: null,
        };
      }

      const models = conn.models;

      if (body.category) {
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

      if (Array.isArray(body.attributeSet)) {
        for (const attr of body.attributeSet) {
          if (attr.attributeId) {
            if (!models.Attribute) {
              models.Attribute = conn.model("Attribute", attributeSchema);
            }
            const attrExists = await models.Attribute.findById(
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
      console.error("Create error:", error);
      return { success: false, message: error.message, data: null };
    }
  }

  async getAll(query, conn) {
    console.log("Controller received query:", query);
    try {
      const products = await this.service.getAllProducts(query, conn);
      return {
        success: true,
        message: "Products fetched",
        data: products,
      };
    } catch (error) {
      console.error("GetAll error:", error);
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  async getById(id, conn) {
    try {
      const product = await this.service.getProductById(id, conn);
      if (!product) {
        return { success: false, message: "Product not found", data: null };
      }

      const productObj = product.toObject ? product.toObject() : product;

      if (Array.isArray(productObj.images)) {
        productObj.images = productObj.images.map((img) => ({
          url: img.url || "",
          alt: img.alt || "",
          _id: img._id || null,
        }));
      }
      if (Array.isArray(productObj.descriptionImages)) {
        productObj.descriptionImages = productObj.descriptionImages.map(
          (img) => ({
            url: img.url || "",
            alt: img.alt || "",
            _id: img._id || null,
          })
        );
      }
      if (productObj.thumbnail) {
        productObj.thumbnail = {
          url: productObj.thumbnail.url || "",
          alt: productObj.thumbnail.alt || "",
        };
      }

      const nestedImageFields = [
        "ingredients",
        "benefits",
        "precautions",
        "howToUseSteps",
      ];
      for (const field of nestedImageFields) {
        if (Array.isArray(productObj[field])) {
          productObj[field] = productObj[field].map((item) => {
            if (!item) return item;
            return {
              title: item.title || "",
              description: item.description || "",
              image: item.image || undefined, // Keep as string (URL)
              alt: item.alt || undefined,
              name: item.name || undefined,
              quantity: item.quantity || undefined,
            };
          });
        }
      }

      if (Array.isArray(productObj.influencerVideos)) {
        productObj.influencerVideos = productObj.influencerVideos.map(
          (video) => ({
            _id: video._id,
            title: video.title || "",
            description: video.description || "",
            videoUrl: video.videoUrl || "",
            videoType: video.videoType || "",
            type: video.type || "",
            productId: video.productId || null,
            createdAt: video.createdAt || null,
            updatedAt: video.updatedAt || null,
          })
        );
      } else {
        productObj.influencerVideos = [];
      }

      return { success: true, message: "Product fetched", data: productObj };
    } catch (error) {
      console.error("GetById error:", error);
      return { success: false, message: error.message, data: null };
    }
  }

  async update(id, body, conn) {
    body = normalizeProductBody(body);
    try {
      const existing = await this.service.getProductById(id, conn);
      if (!existing) {
        return {
          success: false,
          message: "Product not found for update",
          data: null,
        };
      }

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
        // if (!subcatExists)
        //   return {
        //     success: false,
        //     message: "Subcategory does not exist",
        //     data: null,
        //   };
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
            const Attribute =
              conn.models.Attribute || conn.model("Attribute", attributeSchema);
            if (!Attribute) {
              return {
                success: false,
                message: "Attribute model not found",
                data: null,
              };
            }
            if (
              typeof attr.attributeId === "string" &&
              mongoose.Types.ObjectId.isValid(attr.attributeId)
            ) {
              attr.attributeId = new mongoose.Types.ObjectId(attr.attributeId);
            }
            const attrExists = await Attribute.findById(attr.attributeId);
            if (!attrExists)
              return {
                success: false,
                message: `AttributeId ${attr.attributeId} does not exist`,
                data: null,
              };
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
      console.error("Update error:", error);
      return { success: false, message: error.message, data: null };
    }
  }

  async delete(id, conn) {
    try {
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
      console.error("Delete error:", error);
      return { success: false, message: error.message, data: null };
    }
  }
}

export default ProductController;
