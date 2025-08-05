import CrudRepository from './CrudRepository.js';
import ticketSchema from '../models/Ticket.js';


class TicketRepository extends CrudRepository {
  constructor(conn) {
    const TicketModel = conn.models.Ticket || conn.model('Ticket', ticketSchema);
    super(TicketModel);
    this.Ticket = TicketModel;
  }

  async findByCustomer(customerId) {
    return await this.Ticket.find({ customer: customerId, isDeleted: false });
  }

  async replyToTicket(ticketId, reply) {
    return await this.Ticket.findByIdAndUpdate(
      ticketId,
      { $push: { replies: reply } },
      { new: true }
    );
  }
}

export default TicketRepository;