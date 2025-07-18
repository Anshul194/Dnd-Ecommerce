class ProductService {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async createProduct(data) {
    return await this.productRepository.create(data);
  }

  async getAllProducts() {
    return await this.productRepository.findAll();
  }

  async getProductById(id) {
    return await this.productRepository.findById(id);
  }

  async updateProduct(id, data) {
    return await this.productRepository.update(id, data);
  }

  async deleteProduct(id) {
    return await this.productRepository.delete(id);
  }
}

export default ProductService;