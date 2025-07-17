import { createAttribute, getAllAttributes, searchAttributesByName } from '@/app/lib/controllers/attributeController';
import connectDB from '@/app/connection/dbConnect';

// Helper to convert Express-style response to Next.js Response
const toNextResponse = (data, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST = async (req) => {
  await connectDB();

  try {
    const body = await req.json();

    // Mock Express req/res
    const mockReq = { body };
    let responsePayload;
    const mockRes = {
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        responsePayload = payload;
        return toNextResponse(payload, this.statusCode || 200);
      },
    };

    return await createAttribute(mockReq, mockRes);
  } catch (error) {
    return toNextResponse({ success: false, message: error.message }, 500);
  }
};

export const GET = async (req) => {
  await connectDB();

  try {
    const url = new URL(req.url);
    const name = url.searchParams.get('name');

    // Mock Express req/res
    const mockReq = { query: { name } };
    let responsePayload;
    const mockRes = {
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        responsePayload = payload;
        return toNextResponse(payload, this.statusCode || 200);
      },
    };

    if (name) {
      return await searchAttributesByName(mockReq, mockRes);
    } else {
      return await getAllAttributes(mockReq, mockRes);
    }
  } catch (error) {
    return toNextResponse({ success: false, message: error.message }, 500);
  }
};