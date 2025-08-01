
import { handleCreateBlog, handleGetBlogs } from '../services/blogService';


export async function createBlogController(form, conn) {
  try {
    const blog = await handleCreateBlog(form, conn);
    return { status: 201, body: { success: true, message: 'Blog created successfully', data: blog } };
  } catch (err) {
    return { status: 400, body: { success: false, message: err.message || 'Failed to create blog' } };
  }
}

export async function updateBlogController(form, conn, id) {
  try {
    const blogRepo = new (await import('../repository/blogRepository')).BlogRepository(conn);
    const data = Object.fromEntries(form.entries());
    const updated = await blogRepo.update(id, data);
    if (!updated) {
      return { status: 404, body: { success: false, message: 'Blog not found' } };
    }
    return { status: 200, body: { success: true, message: 'Blog updated successfully', data: updated } };
  } catch (err) {
    return { status: 500, body: { success: false, message: err.message || 'Failed to update blog' } };
  }
}

export async function deleteBlogController(conn, id) {
  try {
    const blogRepo = new (await import('../repository/blogRepository')).BlogRepository(conn);
    const deleted = await blogRepo.destroy(id);
    if (!deleted) {
      return { status: 404, body: { success: false, message: 'Blog not found' } };
    }
    return { status: 200, body: { success: true, message: 'Blog deleted successfully', data: deleted } };
  } catch (err) {
    return { status: 500, body: { success: false, message: err.message || 'Failed to delete blog' } };
  }
}
export async function getBlogsController(query, conn) {
  try {
    const blogs = await handleGetBlogs(query, conn);
    return {
      status: 200,
      body: {
        success: true,
        data: blogs.result,
        currentPage: blogs.currentPage,
        totalPages: blogs.totalPages,
        totalDocuments: blogs.totalDocuments,
      },
    };
  } catch (err) {
    return { status: 500, body: { success: false, message: err.message || 'Failed to fetch blogs' } };
  }
}
