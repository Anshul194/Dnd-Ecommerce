import mongoose from 'mongoose';
import TicketRepository from '../repository/ticketRepository';

class TicketService {
  constructor(conn) {
    this.conn = conn; // Store conn for tenant-specific operations
    this.repo = new TicketRepository(conn);
  }

  async createTicket(data, conn = this.conn) {
    try {
      if (!data.assignedTo) {
        const staff = await this.repo.User.findOne({ role: 'staff', isDeleted: false }).exec();
        if (staff) {
          data.assignedTo = staff._id;
        }
      }
      return await this.repo.create(data, conn);
    } catch (error) {
      throw new Error(`Failed to create ticket: ${error.message}`);
    }
  }

  async getAllTickets(query = {}, conn = this.conn) {
    try {
      const {
        page = 1,
        limit = 10,
        filters = '{}',
        searchFields = '{}',
        sort = '{}',
        populateFields = '[]',
        selectFields = '{}'
      } = query;

      let parsedFilters, parsedSearchFields, parsedSort, parsedPopulateFields, parsedSelectFields;
      try {
        parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
        parsedSearchFields = typeof searchFields === 'string' ? JSON.parse(searchFields) : searchFields;
        parsedSort = typeof sort === 'string' ? JSON.parse(sort) : sort;
        parsedPopulateFields = typeof populateFields === 'string' ? JSON.parse(populateFields) : populateFields;
        parsedSelectFields = typeof selectFields === 'string' ? JSON.parse(selectFields) : selectFields;
      } catch (parseError) {
        throw new Error(`Invalid query parameter format: ${parseError.message}`);
      }

      const parsedPage = parseInt(page);
      const parsedLimit = parseInt(limit);

      const filterConditions = { isDeleted: false, ...parsedFilters };
      const searchConditions = [];

      for (const [field, term] of Object.entries(parsedSearchFields)) {
        searchConditions.push({ [field]: { $regex: term, $options: 'i' } });
      }
      if (searchConditions.length > 0) {
        filterConditions.$or = searchConditions;
      }

      const sortConditions = {};
      for (const [field, direction] of Object.entries(parsedSort)) {
        sortConditions[field] = direction === 'asc' ? 1 : -1;
      }

      return await this.repo.getAll(
        filterConditions,
        sortConditions,
        parsedPage,
        parsedLimit,
        parsedPopulateFields,
        parsedSelectFields,
        conn
      );
    } catch (error) {
      throw new Error(`Failed to get all tickets: ${error.message}`);
    }
  }

  async getTicketById(id, conn = this.conn) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ticket ID');
      }
      return await this.repo.getById(id, conn);
    } catch (error) {
      throw new Error(`Failed to get ticket by ID: ${error.message}`);
    }
  }

  async updateTicket(id, data, conn = this.conn) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ticket ID');
      }
      const updated = await this.repo.update(id, data, conn);
      console.log('Updated Ticket:', updated);
      return updated;
    } catch (error) {
      throw new Error(`Failed to update ticket: ${error.message}`);
    }
  }

  async deleteTicket(id, conn = this.conn) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ticket ID');
      }
      const result = await this.repo.update(id, { isDeleted: true }, conn);
      console.log('Delete result:', result);
      return result;
    } catch (error) {
      throw new Error(`Failed to delete ticket: ${error.message}`);
    }
  }

  async replyToTicket(ticketId, replyData, conn = this.conn) {
    try {
      return await this.repo.replyToTicket(ticketId, replyData, conn);
    } catch (error) {
      throw new Error(`Failed to reply to ticket: ${error.message}`);
    }
  }

  async getTicketsByCustomer(customerId, conn = this.conn) {
    try {
      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        throw new Error('Invalid customer ID');
      }
      return await this.repo.findByCustomer(customerId, conn);
    } catch (error) {
      throw new Error(`Failed to get tickets by customer: ${error.message}`);
    }
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
