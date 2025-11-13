// lib/services/productService.js
import { VariantSchema } from "../../lib/models/Variant.js"; // Adjust path as needed
import mongoose from "mongoose";
import { attributeSchema } from "../models/Attribute.js";
import { wishlistSchema } from "../models/Wishlist";
import { variantSchema } from "../models/Variant";

class ProductService {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async createProduct(data, conn) {
    if (conn && conn.models && conn.models.Product) {
      this.productRepository.model = conn.models.Product;
    }
    return await this.productRepository.create(data);
  }

  async getAllProducts(query = {}, conn) {
    if (conn && conn.models && conn.models.Product) {
      this.productRepository.model = conn.models.Product;
    }

    const {
      page = 1,
      limit = 10,
      filters = "{}",
      searchFields = "{}",
      sort = "{}",
      populateFields = [],
      selectFields = {},
      status,
      category,
      subcategory,
      isAddon,
      minPrice,
      maxPrice,
      name,
    } = query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const parsedFilters =
      typeof filters === "string" ? JSON.parse(filters) : filters;
    const parsedSearchFields =
      typeof searchFields === "string"
        ? JSON.parse(searchFields)
        : searchFields;
    const parsedSort = typeof sort === "string" ? JSON.parse(sort) : sort;

    const filterConditions = { deletedAt: null, ...parsedFilters };

    if (status) {
      filterConditions.status = status;
    }

    if (category) {
      // store category as ObjectId when possible
      try {
        filterConditions.category = mongoose.Types.ObjectId.isValid(category)
          ? new mongoose.Types.ObjectId(category)
          : category;
      } catch (e) {
        filterConditions.category = category;
      }
    }

    if (subcategory) {
      // Product model uses `subcategory` (lowercase) field name. Normalize incoming query.
      try {
        filterConditions.subcategory = mongoose.Types.ObjectId.isValid(
          subcategory
        )
          ? new mongoose.Types.ObjectId(subcategory)
          : subcategory;
      } catch (e) {
        filterConditions.subcategory = subcategory;
      }
    }

    if (isAddon) {
      filterConditions.isAddon = isAddon === "true" ? true : false;
    }

    if (name) {
      filterConditions.name = { $regex: name, $options: "i" };
    }

    if (minPrice || maxPrice) {
      const variantFilters = { deletedAt: null };
      if (minPrice) {
        variantFilters.$or = [
          { price: { $gte: parseFloat(minPrice) } },
          { salePrice: { $gte: parseFloat(minPrice) } },
        ];
      }
      if (maxPrice) {
        variantFilters.$or = variantFilters.$or || [];
        variantFilters.$or.push(
          { price: { $lte: parseFloat(maxPrice) } },
          { salePrice: { $lte: parseFloat(maxPrice) } }
        );
      }

      // Register Variant model for the tenant-specific connection
      const Variant =
        conn.models.Variant || conn.model("Variant", VariantSchema);
      const matchingVariants = await Variant.find(variantFilters).distinct(
        "productId"
      );
      filterConditions._id = { $in: matchingVariants };
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

    return await this.productRepository.getAll(
      filterConditions,
      sortConditions,
      pageNum,
      limitNum,
      populateFields,
      selectFields,
      conn // Pass connection to repository
    );
  }

  async getProductById(id, conn) {
    console.log("Fetching product with ID:", id);

    if (!conn) throw new Error("Database connection is required");
    if (!conn.models || !conn.models.Product) {
      throw new Error("Product model not found in the provided connection");
    }
    if (conn && conn.models && conn.models.Product) {
      this.productRepository.model = conn.models.Product;
    }
    return await this.productRepository.findById(id);
  }

  async updateProduct(id, data, conn) {
    if (conn && conn.models && conn.models.Product) {
      this.productRepository.model = conn.models.Product;
    }
    return await this.productRepository.update(id, data);
  }

  async deleteProduct(id, conn) {
    if (conn && conn.models && conn.models.Product) {
      this.productRepository.model = conn.models.Product;
    }
    return await this.productRepository.delete(id);
  }
}

export default ProductService;
