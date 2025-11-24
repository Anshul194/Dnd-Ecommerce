// lib/services/productService.js
import mongoose from "mongoose";
import { VariantSchema, variantSchema } from "../models/Variant.js";
import { attributeSchema } from "../models/Attribute.js";
import { wishlistSchema } from "../models/Wishlist";

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
      // keep legacy names but we'll also accept `min`/`max` below
      minPrice,
      maxPrice,
      name,
      sortBy,
      sortOrder,
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

    // Accept multiple query param names for backwards-compatibility
    const minQuery =
      minPrice || query.min || query.min_price || query.minprice || null;
    const maxQuery =
      maxPrice || query.max || query.max_price || query.maxprice || null;

    if (minQuery || maxQuery) {
      const minVal = minQuery ? parseFloat(minQuery) : null;
      const maxVal = maxQuery ? parseFloat(maxQuery) : null;

      // Build variant filters so we find variants where either price OR salePrice lies within the requested range.
      // If both min and max are provided, we require the field (price or salePrice) to be between min and max.
      const variantFilters = { deletedAt: null };

      if (minVal != null && maxVal != null) {
        // Match variants where price is between min and max OR salePrice is between min and max
        variantFilters.$or = [
          { price: { $gte: minVal, $lte: maxVal } },
          { salePrice: { $gte: minVal, $lte: maxVal } },
        ];
      } else if (minVal != null) {
        variantFilters.$or = [
          { price: { $gte: minVal } },
          { salePrice: { $gte: minVal } },
        ];
      } else if (maxVal != null) {
        variantFilters.$or = [
          { price: { $lte: maxVal } },
          { salePrice: { $lte: maxVal } },
        ];
      }

      // Debug logging to help diagnose why price filters might not match
      //consolle.log("Price filter - minQuery:", minQuery, "maxQuery:", maxQuery);
      //consolle.log("Computed minVal:", minVal, "maxVal:", maxVal);
      //consolle.log("Variant filters:", JSON.stringify(variantFilters));

      // Register Variant model for the tenant-specific connection
      const Variant =
        conn.models.Variant || conn.model("Variant", VariantSchema);
      const matchingVariants = await Variant.find(variantFilters).distinct(
        "productId"
      );
      //consolle.log(
      //   "Matching variant productIds count:",
      //   matchingVariants.length
      // );

      // If there are no matching variants, enforce a clause that yields no products
      if (Array.isArray(matchingVariants) && matchingVariants.length > 0) {
        filterConditions._id = { $in: matchingVariants };
      } else {
        // No matching variants -> no products should be returned. Use a false condition.
        filterConditions._id = { $in: [] };
      }
    }

    const searchConditions = [];
    for (const [field, term] of Object.entries(parsedSearchFields)) {
      searchConditions.push({ [field]: { $regex: term, $options: "i" } });
    }
    if (searchConditions.length > 0) {
      filterConditions.$or = searchConditions;
    }

    // Sorting logic: handle sortBy/sortOrder and merge with parsedSort
    const sortConditions = {};
    // If sort param is provided, parse it first
    for (const [field, direction] of Object.entries(parsedSort)) {
      sortConditions[field] = direction === "asc" ? 1 : -1;
    }
    // If sortBy is provided, override/add it
    if (sortBy) {
      // Remove leading/trailing quotes from sortBy
      const cleanSortBy = typeof sortBy === "string" ? sortBy.replace(/^"+|"+$/g, "") : sortBy;
      sortConditions[cleanSortBy] = (sortOrder === "asc" ? 1 : -1);
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
    //consolle.log("Fetching product with ID:", id);

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
