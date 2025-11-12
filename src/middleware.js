import { NextResponse } from "next/server";

// Whitelisted origins for CORS
const ALLOWED_ORIGINS = [
  "https://bharat.nexprism.in",
  "https://bharatadmin.nexprism.in",
];

export function middleware(request) {
  console.log("Middleware running for:", request.url);

  const origin = request.headers.get("origin");
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin);
  // If origin is allowed echo it back, otherwise fall back to '*'
  const allowOrigin = isAllowedOrigin ? origin : "*";

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Methods":
          "GET, POST, PATCH, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, x-access-token, x-refresh-token, x-tenant",
        // "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  // Normal request
  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", allowOrigin);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-access-token, x-refresh-token, x-tenant"
  );
  // response.headers.set("Access-Control-Allow-Credentials", "true");
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
