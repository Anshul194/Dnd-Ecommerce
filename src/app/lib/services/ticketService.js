import TicketRepository from '../repository/ticketRepository.js';

class TicketService {
  constructor(conn) {
    this.repo = new TicketRepository(conn);
  }

  async createTicket(data) {
    return await this.repo.create(data);
  }

  async getAllTickets(query = {}) {
    const {
      page = 1,
      limit = 10,
      filters = '{}',
      searchFields = '{}',
      sort = '{}',
      populateFields = [],
      selectFields = {}
    } = query;

    const parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
    const parsedSearchFields = typeof searchFields === 'string' ? JSON.parse(searchFields) : searchFields;
    const parsedSort = typeof sort === 'string' ? JSON.parse(sort) : sort;
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    const filterConditions = { isDeleted: false, ...parsedFilters };
    const searchConditions = [];

    for (const [field, term] of Object.entries(parsedSearchFields)) {
      searchConditions.push({ [field]: { $regex: term, $options: 'i' } });
    }
    if (searchConditions.length) {
      filterConditions.$or = searchConditions;
    }

    const sortConditions = {};
    for (const [field, direction] of Object.entries(parsedSort)) {
      sortConditions[field] = direction === 'asc' ? 1 : -1;
    }

    return await this.repo.getAll(filterConditions, sortConditions, parsedPage, parsedLimit, populateFields, selectFields);
  }

  async getTicketById(id) {
    return await this.repo.getById(id);
  }

  async updateTicket(id, data) {
    return await this.repo.update(id, data);
  }

  async deleteTicket(id) {
    return await this.repo.update(id, { isDeleted: true });
  }

  async replyToTicket(ticketId, replyData) {
    return await this.repo.replyToTicket(ticketId, replyData);
  }

  async getTicketsByCustomer(customerId) {
    return await this.repo.findByCustomer(customerId);
  }
}

export default TicketService;
