
import { getVariantById, updateVariant, deleteVariant } from '@/app/lib/controllers/variantController';
import { getSubdomain, getDbConnection } from '@/app/lib/tenantDb';
import { saveFile } from '@/app/config/fileUpload';


// GET /api/variant/[id] → Get a variant by ID
export async function GET(req, context) {
  try {
    const subdomain = getSubdomain(req);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return new Response(JSON.stringify({ success: false, message: 'DB not found' }), { status: 404 });
    }
    const params = await context.params;
    const { id } = params;
    const result = await getVariantById(id, conn);
    return new Response(JSON.stringify(result.body), { status: result.status });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
}


// PUT /api/variant/[id] → Update a variant by ID
export async function PUT(req, context) {
  try {
    const subdomain = getSubdomain(req);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return new Response(JSON.stringify({ success: false, message: 'DB not found' }), { status: 404 });
    }
    const params = await context.params;
    const { id } = params;
    const formData = await req.formData();
    const body = {};
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
    const result = await updateVariant(id, body, conn);
    return new Response(JSON.stringify(result.body), { status: result.status });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
}


// DELETE /api/variant/[id] → Soft delete a variant by ID
export async function DELETE(req, context) {
  try {
    const subdomain = getSubdomain(req);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return new Response(JSON.stringify({ success: false, message: 'DB not found' }), { status: 404 });
    }
    const params = await context.params;
    const { id } = params;
    const result = await deleteVariant(id, conn);
    return new Response(JSON.stringify(result.body), { status: result.status });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
}