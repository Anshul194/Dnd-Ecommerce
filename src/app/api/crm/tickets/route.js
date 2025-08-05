// File: app/api/crm/tickets/route.js
import { getSubdomain, getDbConnection } from '../../../lib/tenantDb';
import {
  createTicket,
  getAllTickets,
} from '../../../lib/controllers/ticketController';

const toNextResponse = (data, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

export async function GET(req) {
  try {
    const subdomain = getSubdomain(req);
    const conn = await getDbConnection(subdomain);
    if (!conn) return toNextResponse({ success: false, message: 'DB not found' }, 404);

    const url = new URL(req.url);
    const result = await getAllTickets({ query: Object.fromEntries(url.searchParams.entries()) }, conn);
    return toNextResponse(result.body, result.status);
  } catch (error) {
    return toNextResponse({ success: false, message: error.message }, 500);
  }
}

export async function POST(req) {
  try {
    const subdomain = getSubdomain(req);
    const conn = await getDbConnection(subdomain);
    if (!conn) return toNextResponse({ success: false, message: 'DB not found' }, 404);

    const form = await req.formData();
    const result = await createTicket(form, conn);
    return toNextResponse(result.body, result.status);
  } catch (error) {
    return toNextResponse({ success: false, message: error.message }, 500);
  }
}
