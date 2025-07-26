
import { createVariant, getAllVariants } from '@/app/lib/controllers/variantController';
import { getSubdomain, getDbConnection } from '@/app/lib/tenantDb';
import { saveFile } from '@/app/config/fileUpload';

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
    const formData = await req.formData();
    const body = {};
    // Helper to build arrays/objects from bracketed keys
    function setDeep(obj, path, value) {
      let curr = obj;
      for (let i = 0; i < path.length - 1; i++) {
        if (curr[path[i]] === undefined) {
          curr[path[i]] = isNaN(Number(path[i + 1])) ? {} : [];
        }
        curr = curr[path[i]];
      }
      curr[path[path.length - 1]] = value;
    }
    for (const [key, value] of formData.entries()) {
      const match = key.match(/([\w]+)(\[(\d+)\])?(\[(\w+)\])?/);
      if (match && (match[2] || match[4])) {
        // e.g. attributes[0][attributeId] or images[0]
        const arrKey = match[1];
        const arrIdx = match[3];
        const objKey = match[5];
        if (objKey) {
          // attributes[0][attributeId]
          if (!body[arrKey]) body[arrKey] = [];
          if (!body[arrKey][arrIdx]) body[arrKey][arrIdx] = {};
          body[arrKey][arrIdx][objKey] = value;
        } else if (arrIdx) {
          // images[0]
          if (!body[arrKey]) body[arrKey] = [];
          if (typeof value === 'object' && value.arrayBuffer && value.name) {
            // Use shared fileUpload.js logic
            body[arrKey][arrIdx] = await saveFile(value, 'uploads/Variant');
          } else {
            // String URL or plain value
            body[arrKey][arrIdx] = value;
          }
        }
      } else {
        body[key] = value;
      }
    }
    const result = await createVariant({ body }, conn);
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
    const result = await getAllVariants({}, conn);
    return toNextResponse(result.body, result.status);
  } catch (error) {
    return toNextResponse({ success: false, message: error.message }, 500);
  }
};