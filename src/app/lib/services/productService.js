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

  async getAllProducts(conn) {
    if (conn && conn.models && conn.models.Product) {
      this.productRepository.model = conn.models.Product;
    }
    return await this.productRepository.findAll();
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