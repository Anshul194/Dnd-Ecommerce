import Attribute from '../models/Attribute.js';

class AttributeRepository {
  async create(data) {
    return await Attribute.create(data);
  }

  async findAll() {
    return await Attribute.find({ deletedAt: null }).sort({ createdAt: -1 });
  }

  async findById(id) {
    return await Attribute.findOne({ _id: id, deletedAt: null });
  }

  async update(id, data) {
    return await Attribute.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Attribute.findByIdAndDelete(id, { deletedAt: new Date(), status: 'inactive' }, { new: true });
  }

  async searchByName(name) {
    return await Attribute.find({
      name: { $regex: name, $options: 'i' },
      deletedAt: null,
    });
  }
}

export default AttributeRepository;