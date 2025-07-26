import VariantRepository from '../repository/variantRepository.js';
import { validateVariantInput } from '../../validators/variantValidator.js';

class VariantService {
  constructor() {
    this.variantRepo = new VariantRepository();
  }

  async create(data) {
    // ✅ Step 1: Validate variant data
    const errors = await validateVariantInput(data);
    if (errors.length > 0) {
      const error = new Error('Validation failed');
      error.status = 400;
      error.details = errors;
      throw error;
    }

    // ✅ Step 2: Create variant if validation passes
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