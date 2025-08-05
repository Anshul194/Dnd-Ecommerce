import mongoose from 'mongoose';
import CrudRepository from './CrudRepository';
import TicketSchema from '../models/Ticket';

class TicketRepository extends CrudRepository {
  constructor(conn) {
    const TicketModel = conn.models.Ticket || conn.model('Ticket', TicketSchema);
    super(TicketModel);
    this.Ticket = TicketModel;
    this.connection = conn || mongoose;
    console.log('TicketRepository initialized with connection:', this.connection ? this.connection.name || 'global mongoose' : 'no connection');
  }

  async create(data, conn) {
    try {
      console.log('Creating ticket with data:', JSON.stringify(data, null, 2));
      return await this.Ticket.create(data);
    } catch (error) {
      console.error('TicketRepository Create Error:', error.message);
      throw error;
    }
  }

  async getAll(filterConditions = {}, sortConditions = {}, page, limit, populateFields = [], selectFields = {}, conn) {
    try {
      let query = this.Ticket.find(filterConditions).select(selectFields);

      if (populateFields.length > 0) {
        populateFields.forEach(field => {
          query = query.populate(field);
        });
      }

      if (Object.keys(sortConditions).length > 0) {
        query = query.sort(sortConditions);
      }

      const totalCount = await this.Ticket.countDocuments(filterConditions);

      if (page && limit) {
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
      }

      const results = await query.exec();

      return {
        results,
        totalCount,
        currentPage: page || 1,
        pageSize: limit || 10
      };
    } catch (error) {
      console.error('TicketRepository getAll Error:', error.message);
      throw error;
    }
  }

  async getById(id, conn) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ticketId: ${id}`);
      }
      const ticket = await this.Ticket.findById(id).exec();
      if (!ticket || ticket.isDeleted) {
        throw new Error('Ticket not found');
      }
      return ticket;
    } catch (error) {
      console.error('TicketRepository getById Error:', error.message);
      throw error;
    }
  }

  async update(id, data, conn) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ticketId: ${id}`);
      }
      const ticket = await this.Ticket.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
      if (!ticket || ticket.isDeleted) {
        throw new Error('Ticket not found');
      }
      return ticket;
    } catch (error) {
      console.error('TicketRepository update Error:', error.message);
      throw error;
    }
  }

  async findByCustomer(customerId, conn) {
    try {
      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        throw new Error(`Invalid customerId: ${customerId}`);
      }
      return await this.Ticket.find({ customer: customerId, isDeleted: false }).exec();
    } catch (error) {
      console.error('TicketRepository findByCustomer Error:', error.message);
      throw error;
    }
  }

  async replyToTicket(ticketId, reply, conn) {
    try {
      if (!mongoose.Types.ObjectId.isValid(ticketId)) {
        throw new Error(`Invalid ticketId: ${ticketId}`);
      }
      const ticket = await this.Ticket.findByIdAndUpdate(
        ticketId,
        { $push: { replies: reply } },
        { new: true }
      ).exec();
      if (!ticket || ticket.isDeleted) {
        throw new Error('Ticket not found');
      }
      return ticket;
    } catch (error) {
      console.error('TicketRepository replyToTicket Error:', error.message);
      throw error;
    }
  }

  async getRecentTickets(limit = 5, populateFields = [], conn) {
    try {
      let query = this.Ticket.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(limit);

      if (populateFields.length > 0) {
        populateFields.forEach(field => {
          query = query.populate(field);
        });
      }

      const tickets = await query.exec();
      return tickets;
    } catch (error) {
      console.error('TicketRepository getRecentTickets Error:', error.message);
      throw error;
    }
  }
}

export default TicketRepository;
