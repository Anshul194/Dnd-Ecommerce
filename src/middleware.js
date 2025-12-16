import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();

  const { pathname } = request.nextUrl;

  // Add cache headers for static assets
  if (
    pathname.startsWith('/uploads') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/category-images') ||
    pathname.startsWith('/category-thumbnails') ||
    pathname.startsWith('/subcategory-images') ||
    pathname.startsWith('/subcategory-thumbnails')
  ) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('X-Content-Type-Options', 'nosniff');
  }

  // Add cache headers for API responses that are stable
  if (pathname.startsWith('/api/categories') || pathname.startsWith('/api/page')) {
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  }

  // Security headers
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    '/uploads/:path*',
    '/images/:path*',
    '/category-images/:path*',
    '/category-thumbnails/:path*',
    '/subcategory-images/:path*',
    '/subcategory-thumbnails/:path*',
    '/api/:path*',
  ],
};
