import { NextResponse } from 'next/server';

export function middleware(request) {
  console.log('Middleware running for:', request.url);

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST,PATCH, PUT, DELETE, OPTIONS',
'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-access-token, x-refresh-token,x-tenant'
      },
    });
  }

  // Normal request
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST,PATCH, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-access-token, x-refresh-token,x-tenant');
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
