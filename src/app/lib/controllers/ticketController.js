import TicketService from '../services/ticketService.js';
import { ticketCreateValidator, ticketUpdateValidator, ticketReplyValidator } from '../../validators/ticketValidator.js';
import { saveFile, validateImageFile } from '../../config/fileUpload.js';

export async function createTicket(form, conn) {
  try {
    console.log("Creating ticket with form data:", form);

    let imageUrl = '';
    let thumbnailUrl = '';
    
  
    console.log('Create Ticket form:', form);

    
    const subject = form.get('subject');
    const description = form.get('description');
    const priority = form.get('priority');
    const customer = form.get('customer');
    const order_id = form.get('order_id');
    const attachments = form.getAll('attachments'); // expects multiple files

    // Build ticket data object
    const ticketData = {
      subject,
      description,
      priority,
      customer,
      orderId: order_id || null, // optional field
      attachments: []
    };

    // Handle attachments (image upload logic)
    if (attachments && attachments.length > 0) {
      for (const file of attachments) {
        if (file && file instanceof File) {
          try {
            validateImageFile(file);
            const fileUrl = await saveFile(file, 'ticket-attachments');
            // Only save the image name (not full path or other fields)
            // console.log('Attachment saved at:', fileUrl);
            // const imageName = file.name;
            ticketData.attachments.push(fileUrl);
          } catch (fileError) {
            return {
              status: 400,
              body: { success: false, message: 'Attachment upload error', data: fileError.message }
            };
          }
        } else if (typeof file === 'string') {
          // If already a string (assume it's the image name)
          ticketData.attachments.push(file);
        }
      }
    }

    const { error, value } = ticketCreateValidator.validate(ticketData);
    if (error) {
      return {
        status: 400,
        body: { success: false, message: 'Validation error', data: error.details },
      };
    }

    // console.log('Ticket data to create:', ticketData);

    const service = new TicketService(conn);
    const ticket = await service.createTicket(value);
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
