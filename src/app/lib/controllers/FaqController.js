export default class FaqController {
  constructor(faqService) {
    this.faqService = faqService;
  }

  async getAll(query, conn) {
    try {
      console.log('Controller getAll called with query:', query);
      return await this.faqService.getAll(query, conn);
    } catch (error) {
      console.error('Controller getAll error:', error.message);
      throw error;
    }
  }

  async getById(id, conn) {
    try {
      console.log('Controller getById called with id:', id);
      return await this.faqService.getById(id, conn);
    } catch (error) {
      console.error('Controller getById error:', error.message);
      throw error;
    }
  }

  async create(data, conn) {
    try {
      console.log('Controller create called with data:', data);
      return await this.faqService.create(data, conn);
    } catch (error) {
      console.error('Controller create error:', error.message);
      throw error;
    }
  }

  async update(id, data, conn) {
    try {
      console.log('Controller update called with id:', id, 'and data:', data);
      return await this.faqService.update(id, data, conn);
    } catch (error) {
      console.error('Controller update error:', error.message);
      throw error;
    }
  }

  async delete(id, conn) {
    try {
      console.log('Controller delete called with id:', id);
      return await this.faqService.delete(id, conn);
    } catch (error) {
      console.error('Controller delete error:', error.message);
      throw error;
    }
  }
}
