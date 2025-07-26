import { createAttribute, getAllAttributes, searchAttributesByName } from '@/app/lib/controllers/attributeController';
import { getSubdomain } from '@/app/lib/tenantDb';
import { getDbConnection } from '@/app/lib/tenantDb';

const toNextResponse = (data, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST = async (req) => {
  try {
    const subdomain = getSubdomain(req);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return toNextResponse({ success: false, message: 'DB not found' }, 404);
    }
    const body = await req.json();
    const result = await createAttribute({ body }, conn);
    return toNextResponse(result.body, result.status);
  } catch (error) {
    return toNextResponse({ success: false, message: error.message }, 500);
  }
};

export const GET = async (req) => {
  try {
    const subdomain = getSubdomain(req);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return toNextResponse({ success: false, message: 'DB not found' }, 404);
    }
    const url = new URL(req.url);
    const name = url.searchParams.get('name');
    if (name) {
      const result = await searchAttributesByName({ query: { name } }, conn);
      return toNextResponse(result.body, result.status);
    } else {
      const result = await getAllAttributes({}, conn);
      return toNextResponse(result.body, result.status);
    }
  } catch (error) {
    return toNextResponse({ success: false, message: error.message }, 500);
  }
};