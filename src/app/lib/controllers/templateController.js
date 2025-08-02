import TemplateService from "../services/templateService.js";

// Remove global instance, always use tenant-based connection

export async function createTemplate(data, conn) {
  try {
    console.log("Creating template with data:", data);
    console.log(
      "Using tenant connection:",
      conn ? "Connected" : "No connection"
    );
    const templateService = new TemplateService(conn);
    const result = await templateService.createTemplate(data);
    return result;
  } catch (error) {
    console.error("createTemplate error:", error);
    return {
      status: 500,
      body: {
        success: false,
        message: "Error creating template",
        error: error.message,
      },
    };
  }
}

export async function getAllTemplates(query = {}, conn) {
  try {
    console.log("Getting all templates with query:", query);
    const templateService = new TemplateService(conn);
    const result = await templateService.getAllTemplates(query);
    return result;
  } catch (error) {
    console.error("getAllTemplates error:", error);
    return {
      status: 500,
      body: {
        success: false,
        message: "Error fetching templates",
        error: error.message,
      },
    };
  }
}

export async function getTemplateById(id, conn) {
  try {
    console.log("Getting template by ID:", id);
    const templateService = new TemplateService(conn);
    const result = await templateService.getTemplateById(id);
    return result;
  } catch (error) {
    console.error("getTemplateById error:", error);
    return {
      status: 500,
      body: {
        success: false,
        message: "Error fetching template",
        error: error.message,
      },
    };
  }
}

export async function getTemplateByProductId(productId, conn) {
  try {
    console.log("Getting template by Product ID:", productId);
    const templateService = new TemplateService(conn);
    const result = await templateService.getTemplateByProductId(productId);
    return result;
  } catch (error) {
    console.error("getTemplateByProductId error:", error);
    return {
      status: 500,
      body: {
        success: false,
        message: "Error fetching template by product ID",
        error: error.message,
      },
    };
  }
}

export async function updateTemplate(id, data, conn) {
  try {
    console.log("Updating template:", id, "with data:", data);
    const templateService = new TemplateService(conn);
    const result = await templateService.updateTemplate(id, data);
    return result;
  } catch (error) {
    console.error("updateTemplate error:", error);
    return {
      status: 500,
      body: {
        success: false,
        message: "Error updating template",
        error: error.message,
      },
    };
  }
}

export async function deleteTemplate(id, conn) {
  try {
    console.log("Deleting template:", id);
    const templateService = new TemplateService(conn);
    const result = await templateService.deleteTemplate(id);
    return result;
  } catch (error) {
    console.error("deleteTemplate error:", error);
    return {
      status: 500,
      body: {
        success: false,
        message: "Error deleting template",
        error: error.message,
      },
    };
  }
}
