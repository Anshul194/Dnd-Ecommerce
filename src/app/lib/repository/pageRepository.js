
import CrudRepository from './CrudRepository.js';
import { PageSchema } from '../models/Page.js';

class PageRepository extends CrudRepository {
  constructor(conn) {
    const connection = conn || require('mongoose');
    const PageModel = connection.models.Page || connection.model('Page', PageSchema);
    super(PageModel);
    this.Page = PageModel;
  }

  async findById(id) {
    try {
      return await this.Page.findOne({ _id: id, deletedAt: null });
    } catch (error) {
      throw error;
    }
  }

  async create(data) {
    try {
      const page = new this.Page(data);
      return await page.save();
    } catch (error) {
      throw error;
    }
  }

  async update(id, data) {
    try {
      const page = await this.Page.findById(id);
      if (!page) return null;
      page.set(data);
      return await page.save();
    } catch (err) {
      throw err;
    }
  }

  async softDelete(id) {
    try {
      return await this.Page.findByIdAndUpdate(
        id,
        { deletedAt: new Date() },
        {deleted:true},
        { new: true }
      );
    } catch (err) {
      throw err;
    }
  }

  
}

export default PageRepository;
