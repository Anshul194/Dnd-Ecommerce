import TicketService from '../services/ticketService.js';
import { ticketCreateValidator, ticketUpdateValidator, ticketReplyValidator } from '../../validators/ticketValidator.js';

export async function createTicket(req, conn) {
  try {
    const { error } = ticketCreateValidator.validate(req.body);
    if (error) return { status: 400, body: { success: false, message: 'Validation error', data: error.details } };

    const service = new TicketService(conn);
    const ticket = await service.createTicket(req.body);
    return { status: 201, body: { success: true, message: 'Ticket created successfully', data: ticket } };
  } catch (err) {
    console.error('Create Ticket Error:', err.message);
    return { status: 500, body: { success: false, message: 'Server error', data: null } };
  }
}

export async function getAllTickets(req, conn) {
  try {
    const service = new TicketService(conn);
    const tickets = await service.getAllTickets(req.query || {});
    return { status: 200, body: { success: true, message: 'Tickets fetched successfully', data: tickets } };
  } catch (err) {
    console.error('Get All Tickets Error:', err.message);
    return { status: 500, body: { success: false, message: 'Server error', data: null } };
  }
}

export async function getTicketById(id, conn) {
  try {
    const service = new TicketService(conn);
    const ticket = await service.getTicketById(id);
    if (!ticket) return { status: 404, body: { success: false, message: 'Ticket not found', data: null } };
    return { status: 200, body: { success: true, message: 'Ticket found', data: ticket } };
  } catch (err) {
    console.error('Get Ticket Error:', err.message);
    return { status: 500, body: { success: false, message: 'Server error', data: null } };
  }
}

export async function updateTicket(id, data, conn) {
  try {
    const { error } = ticketUpdateValidator.validate(data);
    if (error) return { status: 400, body: { success: false, message: 'Validation error', data: error.details } };

    const service = new TicketService(conn);
    const updated = await service.updateTicket(id, data);
    return { status: 200, body: { success: true, message: 'Ticket updated successfully', data: updated } };
  } catch (err) {
    console.error('Update Ticket Error:', err.message);
    return { status: 500, body: { success: false, message: 'Server error', data: null } };
  }
}

export async function replyToTicket(id, data, conn) {
  try {
    const { error } = ticketReplyValidator.validate(data);
    if (error) return { status: 400, body: { success: false, message: 'Validation error', data: error.details } };

    const service = new TicketService(conn);
    const reply = await service.replyToTicket(id, data);
    return { status: 201, body: { success: true, message: 'Reply added', data: reply } };
  } catch (err) {
    console.error('Reply to Ticket Error:', err.message);
    return { status: 500, body: { success: false, message: 'Server error', data: null } };
  }
}

export async function deleteTicket(id, conn) {
  try {
    const service = new TicketService(conn);
    const deleted = await service.deleteTicket(id);
    if (!deleted) return { status: 404, body: { success: false, message: 'Ticket not found', data: null } };
    return { status: 200, body: { success: true, message: 'Ticket deleted successfully', data: deleted } };
  } catch (err) {
    console.error('Delete Ticket Error:', err.message);
    return { status: 500, body: { success: false, message: 'Server error', data: null } };
  }
}

export async function getTicketsByCustomer(customerId, conn) {
  try {
    const service = new TicketService(conn);
    const tickets = await service.getTicketsByCustomer(customerId);
    return { status: 200, body: { success: true, message: 'Tickets fetched', data: tickets } };
  } catch (err) {
    console.error('Get Tickets by Customer Error:', err.message);
    return { status: 500, body: { success: false, message: 'Server error', data: null } };
  }
}
