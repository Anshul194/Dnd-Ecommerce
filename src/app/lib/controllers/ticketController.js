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
    return {
      status: 200,
      body: {
        success: true,
        message: 'Tickets fetched successfully',
        data: tickets,
      },
    };
  } catch (err) {
    console.error('Get All Tickets Error:', err.message);
    return {
      status: 500,
      body: {
        success: false,
        message: 'Server error',
        data: null,
      },
    };
  }
}


export async function getTicketById(id, conn) {
  try {
    const service = new TicketService(conn);
    console.log(`Fetching ticket with ID: ${id}`);
    
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
    // Validate input
    const { error } = ticketUpdateValidator.validate(data);
    if (error) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Validation error',
          data: error.details,
        },
      };
    }

    const service = new TicketService(conn);

    // Update the ticket
    const updated = await service.updateTicket(id, data);

    // If no document is returned, it means the ticket doesn't exist or isDeleted = true
    if (!updated) {
      return {
        status: 404,
        body: {
          success: false,
          message: 'Ticket not found or already deleted',
          data: null,
        },
      };
    }

    // Return success with updated data
    return {
      status: 200,
      body: {
        success: true,
        message: 'Ticket updated successfully',
        data: updated,
      },
    };
  } catch (err) {
    // Catch and log any unexpected server error
    console.error('Update Ticket Error:', err.message);
    return {
      status: 500,
      body: {
        success: false,
        message: 'Server error',
        data: null,
      },
    };
  }
}


export async function replyToTicket(id, data, conn) {
  try {
    const { error } = ticketReplyValidator.validate(data);
    if (error) {
      return {
        status: 400,
        body: { success: false, message: 'Validation error', data: error.details },
      };
    }

    const service = new TicketService(conn);
    const reply = await service.replyToTicket(id, data);
    return {
      status: 201,
      body: { success: true, message: 'Reply added', data: reply },
    };
  } catch (err) {
    console.error('Reply to Ticket Error:', err.message);
    return {
      status: 500,
      body: { success: false, message: 'Server error', data: null },
    };
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

export async function getTicketsByCustomer(customerId, conn, query = {}) {
  try {
    const service = new TicketService(conn);
    const result = await service.getTicketsByCustomer(customerId, query);
    return {
      status: 200,
      body: {
        success: true,
        message: 'Tickets fetched successfully',
        data: result.tickets,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalDocuments: result.totalDocuments,
      },
    };
  } catch (err) {
    console.error('Get Tickets by Customer Error:', err.message);
    return {
      status: 500,
      body: { success: false, message: 'Server error', data: null },
    };
  }
}

