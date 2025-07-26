import '../models/Attribute.js';

class ProductController {
  constructor(service) {
    this.service = service;
  }

  create = async (body) => {
    try {
      const product = await this.service.createProduct(body);
      return { success: true, message: "Product created", data: product };
    } catch (error) {
      return { success: false, message: error.message, data: null };
    }
  };

  getAll = async () => {
    try {
      const products = await this.service.getAllProducts();
      return { success: true, message: "Products fetched", data: products };
    } catch (error) {
      return { success: false, message: error.message, data: null };
    }
  };

  getById = async (id) => {
    try {
      const product = await this.service.getProductById(id);
      if (!product) return { success: false, message: "Product not found", data: null };
      return { success: true, message: "Product fetched", data: product };
    } catch (error) {
      return { success: false, message: error.message, data: null };
    }
  };

  update = async (id, body) => {
    try {
      const product = await this.service.updateProduct(id, body);
      return { success: true, message: "Product updated", data: product };
    } catch (error) {
      return { success: false, message: error.message, data: null };
    }
  };

  delete = async (id) => {
    try {
      await this.service.deleteProduct(id);
      return { success: true, message: "Product deleted successfully", data: null };
    } catch (error) {
      return { success: false, message: error.message, data: null };
    }
  };
}

export default ProductController;