import AttributeService from "../services/attributeService.js";
import {
  attributeCreateValidator,
  attributeUpdateValidator,
} from "../../validators/attributeValidator.js";

export async function createAttribute(req, conn) {
  try {
    const { error } = attributeCreateValidator.validate(req.body);
    if (error) {
      return {
        status: 400,
        body: {
          success: false,
          message: "Validation error",
          data: error.details,
        },
      };
    }

    const attributeService = new AttributeService(conn);
    const attribute = await attributeService.createAttribute(req.body);

    return {
      status: 201,
      body: {
        success: true,
        message: "Attribute created successfully",
        data: attribute,
      },
    };
  } catch (err) {
    //consolle.error("Create Attribute Error:", err.message);
    return {
      status: 500,
      body: {
        success: false,
        message: "Server error",
        data: null,
      },
    };
  }
}

export async function getAllAttributes(queryOrReq, conn) {
  try {
    const attributeService = new AttributeService(conn);

    // route handlers sometimes pass a plain query object, other times an object like { query }
    const query =
      queryOrReq && queryOrReq.query ? queryOrReq.query : queryOrReq || {};

    const attributes = await attributeService.getAllAttributes(query);

    return {
      status: 200,
      body: {
        success: true,
        message: "Attributes fetched successfully",
        data: attributes,
      },
    };
  } catch (err) {
    //consolle.error(
    //   "Get All Attributes Error:",
    //   err && err.message ? err.message : err
    // );
    return {
      status: 500,
      body: {
        success: false,
        message: "Server error",
        data: null,
      },
    };
  }
}

//getByProductId
export async function getByProductId(productId, conn) {
  try {
    const attributeService = new AttributeService(conn);
    const attributes = await attributeService.getAttributesByProductId(
      productId
    );

    if (!attributes || attributes.length === 0) {
      return {
        status: 404,
        body: {
          success: false,
          message: "No attributes found for this product",
          data: null,
        },
      };
    }

    return {
      status: 200,
      body: {
        success: true,
        message: "Attributes found",
        data: attributes,
      },
    };
  } catch (err) {
    //consolle.error("Get Attributes by Product ID Error:", err.message);
    return {
      status: 500,
      body: {
        success: false,
        message: "Server error",
        data: null,
      },
    };
  }
}

export async function getAttributeById(id, conn) {
  try {
    const attributeService = new AttributeService(conn);
    const attribute = await attributeService.getAttributeById(id);

    if (!attribute) {
      return {
        status: 404,
        body: {
          success: false,
          message: "Attribute not found",
          data: null,
        },
      };
    }

    return {
      status: 200,
      body: {
        success: true,
        message: "Attribute found",
        data: attribute,
      },
    };
  } catch (err) {
    //consolle.error("Get Attribute Error:", err.message);
    return {
      status: 500,
      body: {
        success: false,
        message: "Server error",
        data: null,
      },
    };
  }
}

export async function updateAttribute(id, data, conn) {
  try {
    const { error } = attributeUpdateValidator.validate(data);
    if (error) {
      return {
        status: 400,
        body: {
          success: false,
          message: "Validation error",
          data: error.details,
        },
      };
    }

    const attributeService = new AttributeService(conn);
    const updated = await attributeService.updateAttribute(id, data);

    return {
      status: 200,
      body: {
        success: true,
        message: "Attribute updated successfully",
        data: updated,
      },
    };
  } catch (err) {
    //consolle.error("Update Attribute Error:", err.message);
    return {
      status: 500,
      body: {
        success: false,
        message: "Server error",
        data: null,
      },
    };
  }
}

export async function deleteAttribute(id, conn) {
  try {
    const attributeService = new AttributeService(conn);
    const deleted = await attributeService.deleteAttribute(id);

    return {
      status: 200,
      body: {
        success: true,
        message: "Attribute deleted successfully",
        data: deleted,
      },
    };
  } catch (err) {
    //consolle.error("Delete Attribute Error:", err.message);
    return {
      status: 500,
      body: {
        success: false,
        message: "Server error",
        data: null,
      },
    };
  }
}

export async function searchAttributesByName(req, conn) {
  try {
    const name = req.query.name;
    if (!name) {
      return {
        status: 400,
        body: {
          success: false,
          message: "Name query parameter is required",
          data: null,
        },
      };
    }

    const attributeService = new AttributeService(conn);
    const attributes = await attributeService.searchAttributesByName(name);

    return {
      status: 200,
      body: {
        success: true,
        message: "Attributes found",
        data: attributes,
      },
    };
  } catch (err) {
    //consolle.error("Search Attributes Error:", err.message);
    return {
      status: 500,
      body: {
        success: false,
        message: "Server error",
        data: null,
      },
    };
  }
}
