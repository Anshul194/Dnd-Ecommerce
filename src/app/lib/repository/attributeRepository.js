import { attributeSchema } from '../models/Attribute.js';
import { ProductSchema } from '../models/Product.js';
import CrudRepository from './CrudRepository.js';

class AttributeRepository extends CrudRepository {
  constructor(conn) {
    const connection = conn || require('mongoose');

    const AttributeModel = connection.models.Attribute || connection.model('Attribute', attributeSchema);

    const ProductModel = connection.models.Product || connection.model('Product', ProductSchema);

    super(AttributeModel);
    this.Attribute = AttributeModel;
    this.Product = ProductModel;
  }

  // Custom method for attribute search
  async searchByName(name) {
    return await this.Attribute.find({
      name: { $regex: name, $options: 'i' },
      deletedAt: null,
    });
  }

  //findByProductId
  async findByProductId(productId) {
    if (!productId) {
      throw new Error('Product ID is required to find attributes');
    }

    const Product = this.Product.findOne({ _id: productId, deletedAt: null });
    if (!Product) {
      throw new Error(`Product with ID ${productId} not found or deleted`);
    }

    const product = await Product;
    if (!product || !product.attributeSet) {
      throw new Error('Product or attributeSet not found');
    }

    // Extract attributeIds from attributeSet array
    const attributeIds = product.attributeSet.map(item => item.attributeId);

    // Populate attributes for dropdown
    const attributes = await this.Attribute.find({
      _id: { $in: attributeIds },
      deletedAt: null,
    });

    return attributes;

    
  }

  // Custom soft delete (status inactive)
  async delete(id) {
    return await this.Attribute.findByIdAndUpdate(id, { deletedAt: new Date(), status: 'inactive' }, { new: true });
  }
}

export default AttributeRepository;
