// ...existing code...

import { BlogRepository } from '../repository/blogRepository';
import { saveFile } from '../../config/fileUpload';


export async function handleCreateBlog(form, conn) {
  try {
    const data = Object.fromEntries(form.entries());

    // Parse images[0][url], images[0][alt], images[1][url], ...
    const images = [];
    for (const [key, value] of form.entries()) {
      const match = key.match(/^images\[(\d+)\]\[(url|alt)\]$/);
      if (match) {
        const idx = parseInt(match[1], 10);
        const field = match[2];
        if (!images[idx]) images[idx] = {};
        images[idx][field] = value;
      }
    }
    // Handle file uploads for images
    for (let i = 0; i < images.length; i++) {
      if (images[i].url && typeof images[i].url === 'object' && images[i].url.arrayBuffer) {
        // It's a File object
        images[i].url = await saveFile(images[i].url, 'uploads');
      }
    }
    if (images.length > 0) {
      data.images = images;
    }

    // Parse thumbnail[url], thumbnail[alt]
    const thumbnail = {};
    for (const [key, value] of form.entries()) {
      const match = key.match(/^thumbnail\[(url|alt)\]$/);
      if (match) {
        thumbnail[match[1]] = value;
      }
    }
    // Handle file upload for thumbnail
    if (thumbnail.url && typeof thumbnail.url === 'object' && thumbnail.url.arrayBuffer) {
      thumbnail.url = await saveFile(thumbnail.url, 'uploads');
    }
    if (Object.keys(thumbnail).length > 0) {
      data.thumbnail = thumbnail;
    }

    // Parse tags[]
    if (form.getAll('tags[]').length > 0) {
      data.tags = form.getAll('tags[]');
    } else if (data.tags && typeof data.tags === 'string') {
      try {
        data.tags = JSON.parse(data.tags);
      } catch {}
    }

    const repo = new BlogRepository(conn);
    const blog = await repo.create(data);
    return blog;
  } catch (err) {
    throw err;
  }
}

export async function handleGetBlogs(query, conn) {
  try {
    const repo = new BlogRepository(conn);
    // Pagination params
    const pageNum = parseInt(query.pageNum) || 1;
    const limitNum = parseInt(query.limitNum) || 10;
    // Remove pagination params from filter
    const { pageNum: _p, limitNum: _l, ...filterCon } = query;
    const result = await repo.getAll(filterCon, {}, pageNum, limitNum);
    return result;
  } catch (err) {
    throw err;
  }
}
