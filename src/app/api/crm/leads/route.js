import { NextResponse } from "next/server";
import { getSubdomain, getDbConnection } from "@/app/lib/tenantDb.js";
import {
  getLeadsService,
  createLeadService,
} from "@/app/lib/services/leadService.js";

export async function GET(request) {
  try {
    const subdomain = getSubdomain(request);
    const conn = await getDbConnection(subdomain);
    const { searchParams } = new URL(request.url);

    // Basic query params
    const query = {
      search: searchParams.get("search"),
      status: searchParams.get("status"),
      source: searchParams.get("source"),
      assignedTo: searchParams.get("assignedTo"),
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 10,
    };

    // Accept a JSON `filters` parameter (URL-encoded JSON string)
    // Example: filters={"isDeleted":false,"assignedTo":"...","lastCallStatus":"interested"}
    const filtersParam = searchParams.get("filters");
    if (filtersParam) {
      try {
        const parsed = JSON.parse(filtersParam);
        // Merge parsed filters into the query object so downstream service/repo can use them
        Object.assign(query, parsed);
      } catch (err) {
        console.warn("Invalid filters JSON:", filtersParam, err);
      }
    }

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
      body.fullName = `${body.firstName || ""} ${body.lastName || ""}`.trim();
    }

    // Sanitize ObjectId fields - convert empty strings to null
    const objectIdFields = ["assignedTo", "convertedTo"];
    objectIdFields.forEach((field) => {
      if (
        body[field] === "" ||
        body[field] === null ||
        body[field] === undefined
      ) {
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
