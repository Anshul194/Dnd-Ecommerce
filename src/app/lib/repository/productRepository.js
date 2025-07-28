import CrudRepository from './CrudRepository.js';

class ProductRepository extends CrudRepository {
  constructor(model) {
    super(model);
    this.model = model;
  }

  setModel(model) {
    this.model = model;
  }

  // Optionally override create/findById/update/delete if you need custom logic
  async create(data) {
    try {
      return await this.model.create(data);
    } catch (error) {
      console.error("Repository Create Error:", error.message);
      throw error;
    }
  }

  async findById(id) {
    try {
      return await this.model.findById(id).populate('attributeSet.attributeId');
    } catch (error) {
      console.error("Repository FindById Error:", error.message);
      throw error;
    }
  }
}

export default ProductRepository;