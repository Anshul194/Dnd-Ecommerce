// File: app/api/crm/tickets/customer/[customerId]/route.js
import { getSubdomain, getDbConnection } from '../../../../../lib/tenantDb';
import { getTicketsByCustomer } from '../../../../../lib/controllers/ticketController';

const toNextResponse = (data, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

// GET /api/crm/tickets/customer/[customerId] - Get all tickets for a specific customer
export async function GET(req, { params }) {
  try {
    const subdomain = getSubdomain(req);
    const conn = await getDbConnection(subdomain);
    if (!conn) return toNextResponse({ success: false, message: 'DB not found' }, 404);

    const { customerId } = params;
    if (!customerId) {
      return toNextResponse({ success: false, message: 'Customer ID is required' }, 400);
    }

    const result = await getTicketsByCustomer(customerId, conn);
    return toNextResponse(result.body, result.status);
  } catch (error) {
    console.error('GET Tickets by Customer Error:', error.message);
    return toNextResponse({ success: false, message: error.message }, 500);
  }
}
