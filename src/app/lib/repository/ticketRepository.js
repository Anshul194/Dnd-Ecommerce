import CrudRepository from './CrudRepository.js';
import ticketSchema from '../models/Ticket.js';
import userSchema from '../models/User.js';

class TicketRepository extends CrudRepository {
  constructor(conn) {
    if (!conn.models.User) {
      conn.model('User', userSchema);
    }

    const TicketModel = conn.models.Ticket || conn.model('Ticket', ticketSchema);
    super(TicketModel);

    this.Ticket = TicketModel;
    this.User = conn.models.User;
  }

  async create(data) {
    try {
      return await this.Ticket.create(data);
    } catch (error) {
      throw new Error(`Failed to create ticket: ${error.message}`);
    }
  }

  async getAll(
  filter = {},
  sort = {},
  page = 1,
  limit = 10,
  populateFields = [],
  selectFields = {}
) {
  try {
    const skip = (page - 1) * limit;
    const defaultPopulate = [
      { path: 'customer', select: 'name email' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'replies.repliedBy', select: 'name email' }
    ];

    const combinedPopulate = [...defaultPopulate, ...populateFields];

    let query = this.Ticket.find(filter).sort(sort).skip(skip).limit(limit);

    for (const field of combinedPopulate) {
      query = query.populate(field);
    }

    if (Object.keys(selectFields).length) {
      query = query.select(selectFields);
    }

    const data = await query.exec();
    const total = await this.Ticket.countDocuments(filter);

    return {
      data,
      meta: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Failed to get tickets: ${error.message}`);
  }
}


  async findByCustomer(customerId) {
    try {
      return await this.Ticket.find({ customer: customerId, isDeleted: false });
    } catch (error) {
      throw new Error(`Failed to find tickets by customer: ${error.message}`);
    }
  }

  async getById(id) {
    try {
      return await this.Ticket.findOne({ _id: id, isDeleted: false })
        .populate('customer', 'name email')
        .populate('assignedTo', 'name email')
        .populate('replies.repliedBy', 'name email');
    } catch (error) {
      throw new Error(`Failed to get ticket by ID: ${error.message}`);
    }
  }

  async replyToTicket(ticketId, reply) {
    try {
      return await this.Ticket.findByIdAndUpdate(
        ticketId,
        { $push: { replies: reply } },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to reply to ticket: ${error.message}`);
    }
  }

 async update(id, data) {
  try {
    return await this.Ticket.findOneAndUpdate(
      { _id: id, isDeleted: false }, // filter
      data,
      { new: true } // return updated document
    );
  } catch (error) {
    throw new Error(`Failed to update ticket: ${error.message}`);
  }
}

async delete(id) {
  try {
    return await this.Ticket.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(), // set the deletion timestamp
      },
      { new: true }
    );
  } catch (error) {
    throw new Error(`Failed to delete ticket: ${error.message}`);
  }
}





}

export default TicketRepository;
