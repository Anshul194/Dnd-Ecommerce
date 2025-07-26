import AttributeService from '../services/attributeService.js';
import { attributeCreateValidator, attributeUpdateValidator } from '../../validators/attributeValidator.js';

export async function createAttribute(req, conn) {
  try {
    const { error } = attributeCreateValidator.validate(req.body);
    if (error) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Validation error',
          data: error.details
        }
      };
    }

    const attributeService = new AttributeService(conn);
    const attribute = await attributeService.createAttribute(req.body);

    return {
      status: 201,
      body: {
        success: true,
        message: 'Attribute created successfully',
        data: attribute
      }
    };
  } catch (err) {
    console.error('Create Attribute Error:', err.message);
    return {
      status: 500,
      body: {
        success: false,
        message: 'Server error',
        data: null
      }
    };
  }
}

export async function getAllAttributes(req, conn) {
  try {
    const attributeService = new AttributeService(conn);
    const query = req.query || {};
    const attributes = await attributeService.getAllAttributes(query);

    return {
      status: 200,
      body: {
        success: true,
        message: 'Attributes fetched successfully',
        data: attributes
      }
    };
  } catch (err) {
    console.error('Get All Attributes Error:', err.message);
    return {
      status: 500,
      body: {
        success: false,
        message: 'Server error',
        data: null
      }
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
          message: 'Attribute not found',
          data: null
        }
      };
    }

    return {
      status: 200,
      body: {
        success: true,
        message: 'Attribute found',
        data: attribute
      }
    };
  } catch (err) {
    console.error('Get Attribute Error:', err.message);
    return {
      status: 500,
      body: {
        success: false,
        message: 'Server error',
        data: null
      }
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
          message: 'Validation error',
          data: error.details
        }
      };
    }

    const attributeService = new AttributeService(conn);
    const updated = await attributeService.updateAttribute(id, data);

    return {
      status: 200,
      body: {
        success: true,
        message: 'Attribute updated successfully',
        data: updated
      }
    };
  } catch (err) {
    console.error('Update Attribute Error:', err.message);
    return {
      status: 500,
      body: {
        success: false,
        message: 'Server error',
        data: null
      }
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
        message: 'Attribute deleted successfully',
        data: deleted
      }
    };
  } catch (err) {
    console.error('Delete Attribute Error:', err.message);
    return {
      status: 500,
      body: {
        success: false,
        message: 'Server error',
        data: null
      }
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
          message: 'Name query parameter is required',
          data: null
        }
      };
    }

    const attributeService = new AttributeService(conn);
    const attributes = await attributeService.searchAttributesByName(name);

    return {
      status: 200,
      body: {
        success: true,
        message: 'Attributes found',
        data: attributes
      }
    };
  } catch (err) {
    console.error('Search Attributes Error:', err.message);
    return {
      status: 500,
      body: {
        success: false,
        message: 'Server error',
        data: null
      }
    };
  }
}

