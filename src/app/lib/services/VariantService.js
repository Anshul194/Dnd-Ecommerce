import VariantRepository from '../repository/variantRepository.js';

class VariantService {
  constructor() {
    this.variantRepo = new VariantRepository();
  }

  async create(data) {
    return await this.variantRepo.createVariant(data);
  }

  async getAll() {
    return await this.variantRepo.getAllVariants();
  }

  async getById(id) {
    return await this.variantRepo.getVariantById(id);
  }

  async getByProductId(productId) {
    return await this.variantRepo.getVariantsByProductId(productId);
  }

  async update(id, data) {
    return await this.variantRepo.updateVariant(id, data);
  }

  async delete(id) {
    return await this.variantRepo.deleteVariant(id);
  }
}

export default VariantService;