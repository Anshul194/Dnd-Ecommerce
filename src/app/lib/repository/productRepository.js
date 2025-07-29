import CrudRepository from "./CrudRepository.js";
import mongoose from 'mongoose';
import { attributeSchema } from '../models/Attribute.js';


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
      console.log('Repo findById called with:', id);
      // Ensure Attribute model is registered on the same connection as Product
      const conn = this.model.db;
      if (!conn.models.Attribute) {
        // Dynamically require the schema to avoid circular imports
                    const Attribute =mongoose.models.Attribute || mongoose.model("Attribute",attributeSchema);
        
        conn.model('Attribute', attributeSchema);
      }
      //check if it is id or slug using mongoose.Types.ObjectId.isValid(id)
      if (mongoose.Types.ObjectId.isValid(id)) {
        return await this.model.findById(id).populate({
          path: "attributeSet.attributeId",
        });
      } else {
        return await this.model.findOne({ slug: id }).populate('attributeSet.attributeId');
      }
    } catch (error) {
      console.error("Repository FindById Error:", error.message);
      throw error;
    }
  }

  async delete(id) {
    try {
      console.log("Repo softDelete called with:", id);
      return await this.model.findByIdAndUpdate(
        id,
        { deletedAt: new Date() },
        { new: true }
      );
    } catch (err) {
      console.error("Repo softDelete error:", err);
      throw err;
    }
  }
}

export default ProductRepository;
