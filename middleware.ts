import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that do not require authentication
const publicRoutes = [
  '/',
  '/login',
  '/search',
  '/services',
  '/projects',
  '/about',
  '/career',
  '/contact'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('firebase-token')?.value;

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });

  // Allow access to public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For all other routes, check for an authentication token
  if (!token) {
    // If no token, redirect to the login page
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname); // Pass the original path for redirection after login
    return NextResponse.redirect(loginUrl);
  }

  // If a token exists, allow the request to proceed
  // Note: The token's validity is checked on the client-side and on API routes.
  return NextResponse.next();
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - API routes (starting with /api)
     * - Next.js internal files (_next/static, _next/image)
     * - Favicon and other static assets (e.g., images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
