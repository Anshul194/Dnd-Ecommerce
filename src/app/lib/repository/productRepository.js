class ProductRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return await this.model.create(data);
  }

  async findAll() {
    return await this.model.find().populate('attributeSet.attributeId');
  }

  async findById(id) {
    return await this.model.findById(id).populate('attributeSet.attributeId');
  }

  async update(id, data) {
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await this.model.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
  }
}

export default ProductRepository;