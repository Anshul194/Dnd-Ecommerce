import Variant from '../models/Variant.js';

class VariantRepository {
  async createVariant(data) {
    return await new Variant(data).save();
  }

  async getAllVariants() {
    return await Variant.find({ deletedAt: null });
  }

  async getVariantById(id) {
    return await Variant.findOne({ _id: id, deletedAt: null });
  }

  async getVariantsByProductId(productId) {
    return await Variant.find({ productId, deletedAt: null });
  }

  async updateVariant(id, data) {
    return await Variant.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteVariant(id) {
    return await Variant.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
  }
}

export default VariantRepository;