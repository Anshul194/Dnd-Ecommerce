import TemplateRepository from "../repository/templateRepository.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import mongoose from "mongoose";

class TemplateService {
  constructor(conn) {
    console.log(
      "TemplateService initialized with connection:",
      conn ? "Connected" : "No connection"
    );
    this.templateRepo = new TemplateRepository(conn);
    this.conn = conn;
  }

  async createTemplate(data) {
    try {
      // Validate required fields
      if (
        !data.productId ||
        !data.layoutId ||
        !data.layoutName ||
        !data.totalColumns
      ) {
        return errorResponse(
          "Missing required fields: productId, layoutId, layoutName, totalColumns",
          400
        );
      }

      // Validate productId is a number
      if (typeof data.productId !== "number") {
        return errorResponse("productId must be a number", 400);
      }

      // Validate layoutId is a number
      if (typeof data.layoutId !== "number") {
        return errorResponse("layoutId must be a number", 400);
      }

      // Check if template with same productId already exists
      const existingTemplate = await this.templateRepo.findByProductId(
        data.productId
      );
      if (existingTemplate) {
        return errorResponse(
          "Template with this productId already exists",
          409
        );
      }

      const template = await this.templateRepo.create(data);
      return successResponse(template, "Template created successfully", 201);
    } catch (error) {
      console.error("TemplateService createTemplate error:", error);
      return errorResponse("Error creating template", 500, error.message);
    }
  }

  async getAllTemplates(query = {}) {
    try {
      const { page = 1, limit = 10, ...filter } = query;
      const templates = await this.templateRepo.getAll(
        filter,
        parseInt(page),
        parseInt(limit)
      );
      return successResponse(templates, "Templates fetched successfully", 200);
    } catch (error) {
      console.error("TemplateService getAllTemplates error:", error);
      return errorResponse("Error fetching templates", 500, error.message);
    }
  }

  async getTemplateById(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return errorResponse("Invalid template ID", 400);
      }

      const template = await this.templateRepo.findById(id);
      if (!template) {
        return errorResponse("Template not found", 404);
      }

      return successResponse(template, "Template fetched successfully", 200);
    } catch (error) {
      console.error("TemplateService getTemplateById error:", error);
      return errorResponse("Error fetching template", 500, error.message);
    }
  }

  async getTemplateByProductId(productId) {
    try {
      if (typeof productId !== "number" && isNaN(parseInt(productId))) {
        return errorResponse("Invalid product ID", 400);
      }

      const template = await this.templateRepo.findByProductId(
        parseInt(productId)
      );
      if (!template) {
        return errorResponse("Template not found for this product", 404);
      }

      return successResponse(template, "Template fetched successfully", 200);
    } catch (error) {
      console.error("TemplateService getTemplateByProductId error:", error);
      return errorResponse(
        "Error fetching template by product ID",
        500,
        error.message
      );
    }
  }

  async updateTemplate(id, data) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return errorResponse("Invalid template ID", 400);
      }

      const existingTemplate = await this.templateRepo.findById(id);
      if (!existingTemplate) {
        return errorResponse("Template not found", 404);
      }

      // If productId is being updated, check for conflicts
      if (data.productId && data.productId !== existingTemplate.productId) {
        const conflictTemplate = await this.templateRepo.findByProductId(
          data.productId
        );
        if (conflictTemplate && conflictTemplate._id.toString() !== id) {
          return errorResponse(
            "Template with this productId already exists",
            409
          );
        }
      }

      const updatedTemplate = await this.templateRepo.update(id, data);
      return successResponse(
        updatedTemplate,
        "Template updated successfully",
        200
      );
    } catch (error) {
      console.error("TemplateService updateTemplate error:", error);
      return errorResponse("Error updating template", 500, error.message);
    }
  }

  async deleteTemplate(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return errorResponse("Invalid template ID", 400);
      }

      const existingTemplate = await this.templateRepo.findById(id);
      if (!existingTemplate) {
        return errorResponse("Template not found", 404);
      }

      await this.templateRepo.delete(id);
      return successResponse(null, "Template deleted successfully", 200);
    } catch (error) {
      console.error("TemplateService deleteTemplate error:", error);
      return errorResponse("Error deleting template", 500, error.message);
    }
  }
}

export default TemplateService;
