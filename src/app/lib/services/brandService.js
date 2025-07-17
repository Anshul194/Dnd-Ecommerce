import BrandRepository from "../repository/brandRepository";

export default class BrandService {
  constructor() {
    this.brandRepository = new BrandRepository();
  }

  async createBrand(data) {
    return await this.brandRepository.create(data);
  }

  async getAllBrands(search = "") {
    return await this.brandRepository.findAll(search);
  }

  async getBrandById(id) {
    return await this.brandRepository.findById(id);
  }

  async updateBrand(id, data) {
    return await this.brandRepository.update(id, data);
  }

  async deleteBrand(id) {
    return await this.brandRepository.delete(id);
  }

  // ✅ Add this method for search
  async searchBrandsByName(searchQuery) {
    return await this.brandRepository.findAll(searchQuery);
  }
}