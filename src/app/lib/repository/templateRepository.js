import CrudRepository from "./CrudRepository.js";
import Template from "../models/Template.js";
import mongoose from "mongoose";

class TemplateRepository extends CrudRepository {
  constructor(conn) {
    // Use the provided connection for tenant DB, or global mongoose if not provided
    const connection = conn || mongoose;
    const TemplateModel =
      connection.models.Template || connection.model("Template", Template);
    super(TemplateModel);
    this.Template = TemplateModel;
    this.connection = connection;
  }

  async create(data) {
    try {
      const template = new this.Template(data);
      return await template.save();
    } catch (error) {
      console.error("TemplateRepository create error:", error);
      throw error;
    }
  }

  async findById(id) {
    try {
      return await this.Template.findById(id);
    } catch (error) {
      console.error("TemplateRepository findById error:", error);
      throw error;
    }
  }

  async findByProductId(productId) {
    try {
      return await this.Template.findOne({ productId });
    } catch (error) {
      console.error("TemplateRepository findByProductId error:", error);
      throw error;
    }
  }

  async getAll(filter = {}, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const templates = await this.Template.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await this.Template.countDocuments(filter);

      return {
        templates,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("TemplateRepository getAll error:", error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const updatedTemplate = await this.Template.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
      return updatedTemplate;
    } catch (error) {
      console.error("TemplateRepository update error:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      return await this.Template.findByIdAndDelete(id);
    } catch (error) {
      console.error("TemplateRepository delete error:", error);
      throw error;
    }
  }

  async findByLayoutId(layoutId) {
    try {
      return await this.Template.find({ layoutId });
    } catch (error) {
      console.error("TemplateRepository findByLayoutId error:", error);
      throw error;
    }
  }

  async findByLayoutName(layoutName) {
    try {
      return await this.Template.find({
        layoutName: new RegExp(layoutName, "i"),
      });
    } catch (error) {
      console.error("TemplateRepository findByLayoutName error:", error);
      throw error;
    }
  }
}

export default TemplateRepository;
