import { NextResponse } from 'next/server';

export function middleware() {
  // Simply pass through - access logging is done server-side via API routes
  // Edge runtime doesn't support Node.js modules like 'fs' and 'path'
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
