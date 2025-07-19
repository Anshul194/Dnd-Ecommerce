import '../models/Attribute.js';

class ProductController {
  constructor(service) {
    this.service = service;
  }

  create = async (body) => {
    try {
      const product = await this.service.createProduct(body);
      return { success: true, data: product };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  getAll = async () => {
    try {
      const products = await this.service.getAllProducts();
      return { success: true, data: products };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  getById = async (id) => {
    try {
      const product = await this.service.getProductById(id);
      if (!product) return { success: false, message: "Product not found" };
      return { success: true, data: product };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  update = async (id, body) => {
    try {
      const product = await this.service.updateProduct(id, body);
      return { success: true, data: product };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  delete = async (id) => {
    try {
      await this.service.deleteProduct(id);
      return { success: true, message: 'Product deleted successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };
}

export default ProductController;