import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = ['/admin', '/employee'];
const publicRoutes = ['/login', '/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes without authentication
  const isPublicRoute = publicRoutes.some(route => pathname === route);
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    // Get the authentication token from cookies
    const token = request.cookies.get('firebase-token')?.value;
    
    console.log('[Middleware] Checking protected route:', pathname);
    console.log('[Middleware] Token exists:', !!token);
    
    // If no token exists, redirect to login
    if (!token) {
      console.log('[Middleware] No token found, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Token exists - proceed with request
    // Note: Detailed token verification happens on the client-side via useAuth hook
    // and on API routes via server-side verification
    console.log('[Middleware] Token found, allowing access');
  }
  
  return NextResponse.next();
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
