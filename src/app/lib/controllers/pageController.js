
import PageService from '../services/pageService.js';
import { successResponse, errorResponse } from '../../../app/utils/response.js';

export async function createPage(data, conn) {
  try {
    const pageService = new PageService(conn);
    const result = await pageService.createPage(data);
    return {
      status: 201,
      body: successResponse(result.data, 'Page created successfully'),
    };
  } catch (err) {
    return {
      status: 500,
      body: errorResponse('Server error', 500),
    };
  }
}

export async function getPageById(id, conn) {
  try {
    const pageService = new PageService(conn);
    const result = await pageService.getPageById(id);
    if (!result.data) {
      return {
        status: 404,
        body: errorResponse('Page not found', 404),
      };
    }
    return {
      status: 200,
      body: successResponse(result.data, 'Page fetched successfully'),
    };
  } catch (err) {
    return {
      status: 500,
      body: errorResponse('Server error', 500),
    };
  }
}

export async function updatePage(id, data, conn) {
  try {
    const pageService = new PageService(conn);
    const result = await pageService.updatePage(id, data);
    if (!result.data) {
      return {
        status: 404,
        body: errorResponse('Page not found', 404),
      };
    }
    return {
      status: 200,
      body: successResponse(result.data, 'Page updated successfully'),
    };
  } catch (err) {
    return {
      status: 500,
      body: errorResponse('Server error', 500),
    };
  }
}

export async function deletePage(id, conn) {
  try {
    const pageService = new PageService(conn);
    const result = await pageService.deletePage(id);
    if (!result.data) {
      return {
        status: 404,
        body: errorResponse('Page not found', 404),
      };
    }
    return {
      status: 200,
      body: successResponse(result.data, 'Page deleted successfully'),
    };
  } catch (err) {
    return {
      status: 500,
      body: errorResponse('Server error', 500),
    };
  }
}
