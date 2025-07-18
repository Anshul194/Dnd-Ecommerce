import '../models/Attribute.js';

class ProductController {
  constructor(service) {
    this.service = service;
  }

  create = async (body) => {
    const product = await this.service.createProduct(body);
    return product;
  };

  getAll = async () => {
    const products = await this.service.getAllProducts();
    return products;
  };

  getById = async (id) => {
    const product = await this.service.getProductById(id);
    return product;
  };

  update = async (id, body) => {
    const product = await this.service.updateProduct(id, body);
    return product;
  };

  delete = async (id) => {
    await this.service.deleteProduct(id);
    return { message: 'Product deleted successfully' };
  };
}

export default ProductController;