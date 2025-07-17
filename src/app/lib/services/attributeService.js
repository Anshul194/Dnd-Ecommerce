import AttributeRepository from '../repository/attributeRepository.js';

class AttributeService {
  constructor() {
    this.attributeRepo = new AttributeRepository();
  }

  async createAttribute(data) {
    return await this.attributeRepo.create(data);
  }

  async getAllAttributes() {
    return await this.attributeRepo.findAll();
  }

  async getAttributeById(id) {
    return await this.attributeRepo.findById(id);
  }

  async updateAttribute(id, data) {
    return await this.attributeRepo.update(id, data);
  }

  async deleteAttribute(id) {
    return await this.attributeRepo.delete(id);
  }

  async searchAttributesByName(name) {
    return await this.attributeRepo.searchByName(name);
  }
}

export default AttributeService;