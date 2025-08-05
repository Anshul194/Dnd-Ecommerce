// File: app/api/crm/tickets/[id]/replies/route.js
import { getSubdomain, getDbConnection } from '../../../../../lib/tenantDb';
import { replyToTicket } from '../../../../../lib/controllers/ticketController';

const toNextResponse = (data, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

// POST /api/crm/tickets/[id]/replies - Add a reply to a ticket
export async function POST(req, { params }) {
  try {
    const subdomain = getSubdomain(req);
    const conn = await getDbConnection(subdomain);
    if (!conn) return toNextResponse({ success: false, message: 'DB not found' }, 404);

    const { id } = params;
    if (!id) {
      return toNextResponse({ success: false, message: 'Ticket ID is required' }, 400);
    }

    const body = await req.json();
    const result = await replyToTicket(id, body, conn);
    return toNextResponse(result.body, result.status);
  } catch (error) {
    console.error('POST Reply to Ticket Error:', error.message);
    return toNextResponse({ success: false, message: error.message }, 500);
  }
}
