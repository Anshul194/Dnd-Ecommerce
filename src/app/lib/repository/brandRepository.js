import Brand from "../models/Brand.js";

export default class BrandRepository {
  async create(data) {
    return await Brand.create(data);
  }

  async findAll(search = "") {
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" }; // case-insensitive search on name
    }

    return await Brand.find(query).sort({ createdAt: -1 }); // optional: sort by recent
  }

  async findById(id) {
    return await Brand.findById(id);
  }

  async update(id, data) {
    return await Brand.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Brand.findByIdAndDelete(id);
  }
}