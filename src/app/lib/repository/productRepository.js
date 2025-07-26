class ProductRepository {
  constructor(model) {
    this.model = model;
  }

  setModel(model) {
    this.model = model;
  }

  async create(data) {
    try {
      return await this.model.create(data);
    } catch (error) {
      console.error("Repository Create Error:", error.message);
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.model.find().populate('attributeSet.attributeId');
    } catch (error) {
      console.error("Repository FindAll Error:", error.message);
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

  async update(id, data) {
    try {
      return await this.model.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      console.error("Repository Update Error:", error.message);
      throw error;
    }
  }

  async delete(id) {
    try {
      return await this.model.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
    } catch (error) {
      console.error("Repository Delete Error:", error.message);
      throw error;
    }
  }
}

export default ProductRepository;