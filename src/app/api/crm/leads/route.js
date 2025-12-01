import { NextResponse } from 'next/server';
import { getSubdomain, getDbConnection } from '@/app/lib/tenantDb.js';
import { getLeadsService, createLeadService } from '@/app/lib/services/leadService.js';

export async function GET(request) {
  try {
    const subdomain = getSubdomain(request);
    const conn = await getDbConnection(subdomain);
    const { searchParams } = new URL(request.url);

    const query = {
      search: searchParams.get('search'),
      status: searchParams.get('status'),
      source: searchParams.get('source'),
      assignedTo: searchParams.get('assignedTo'),
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 10,
    };

    const result = await getLeadsService(query, conn);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const subdomain = getSubdomain(request);
    const conn = await getDbConnection(subdomain);
    const body = await request.json();

    // Ensure fullName is populated if firstName/lastName are provided
    if (body.firstName || body.lastName) {
      body.fullName = `${body.firstName || ''} ${body.lastName || ''}`.trim();
    }

    // Sanitize ObjectId fields - convert empty strings to null
    const objectIdFields = ['assignedTo', 'convertedTo'];
    objectIdFields.forEach(field => {
      if (body[field] === '' || body[field] === null || body[field] === undefined) {
        body[field] = null;
      }
    });

    const result = await createLeadService(body, conn);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
