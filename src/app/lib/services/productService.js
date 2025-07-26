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
    // Support pagination, filtering, search, and sorting like variant
    const {
      page = 1,
      limit = 10,
      filters = '{}',
      searchFields = '{}',
      sort = '{}',
      populateFields = [],
      selectFields = {}
    } = query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
    const parsedSearchFields = typeof searchFields === 'string' ? JSON.parse(searchFields) : searchFields;
    const parsedSort = typeof sort === 'string' ? JSON.parse(sort) : sort;

    // Build filter conditions
    const filterConditions = { deletedAt: null, ...parsedFilters };
    // Build search conditions
    const searchConditions = [];
    for (const [field, term] of Object.entries(parsedSearchFields)) {
      searchConditions.push({ [field]: { $regex: term, $options: 'i' } });
    }
    if (searchConditions.length > 0) {
      filterConditions.$or = searchConditions;
    }
    // Build sort conditions
    const sortConditions = {};
    for (const [field, direction] of Object.entries(parsedSort)) {
      sortConditions[field] = direction === 'asc' ? 1 : -1;
    }

    // Call repository getAll for paginated, filtered, sorted results
    return await this.productRepository.getAll(
      filterConditions,
      sortConditions,
      pageNum,
      limitNum,
      populateFields,
      selectFields
    );
  }

  async getProductById(id, conn) {
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