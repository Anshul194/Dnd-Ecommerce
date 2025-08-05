import TicketRepository from '../repository/ticketRepository';

class TicketService {
  constructor(conn) {
    this.conn = conn; // Store conn for tenant-specific operations
    this.repo = new TicketRepository(conn);
  }

  async createTicket(data, conn = this.conn) {
    return await this.repo.create(data, conn);
  }

  async getAllTickets(query = {}, conn = this.conn) {
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

    return await this.repo.getAll(filterConditions, sortConditions, parsedPage, parsedLimit, populateFields, selectFields, conn);
  }

  async getTicketById(id, conn = this.conn) {
    return await this.repo.getById(id, conn);
  }

  async updateTicket(id, data, conn = this.conn) {
    return await this.repo.update(id, data, conn);
  }

  async deleteTicket(id, conn = this.conn) {
    return await this.repo.update(id, { isDeleted: true }, conn);
  }

  async replyToTicket(ticketId, replyData, conn = this.conn) {
    return await this.repo.replyToTicket(ticketId, replyData, conn);
  }

  async getTicketsByCustomer(customerId, conn = this.conn) {
    return await this.repo.findByCustomer(customerId, conn);
  }

  async getRecentTickets(conn = this.conn) {
    try {
      const tickets = await this.repo.getRecentTickets(5, ['customer', 'assignedTo'], conn);
      return tickets;
    } catch (error) {
      throw new Error(`Failed to fetch recent tickets: ${error.message}`);
    }
  }
}

export default TicketService;