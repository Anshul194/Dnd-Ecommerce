import { attributeSchema } from '../models/Attribute.js';
import CrudRepository from './CrudRepository.js';

class AttributeRepository extends CrudRepository {
  constructor(conn) {
    const connection = conn || require('mongoose');
    const AttributeModel = connection.models.Attribute || connection.model('Attribute', attributeSchema);
    super(AttributeModel);
    this.Attribute = AttributeModel;
  }

  // Custom method for attribute search
  async searchByName(name) {
    return await this.Attribute.find({
      name: { $regex: name, $options: 'i' },
      deletedAt: null,
    });
  }

  // Custom soft delete (status inactive)
  async delete(id) {
    return await this.Attribute.findByIdAndUpdate(id, { deletedAt: new Date(), status: 'inactive' }, { new: true });
  }
}

export default AttributeRepository;