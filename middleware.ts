import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = ['/admin', '/employee'];
const publicRoutes = ['/login', '/'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));
  
  if (isProtectedRoute) {
    // Get the authentication token from cookies
    const token = request.cookies.get('firebase-token')?.value;
    
    // If no token exists, redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify the token by calling our session API
    try {
      const verifyUrl = new URL('/api/auth/verify', request.url);
      const verifyResponse = await fetch(verifyUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `firebase-token=${token}`,
        },
      });

      if (!verifyResponse.ok) {
        // Token is invalid, clear it and redirect to login
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        loginUrl.searchParams.set('error', 'session_expired');
        
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('firebase-token');
        return response;
      }

      const { role } = await verifyResponse.json();

      // Check role-based access
      if (pathname.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL('/employee', request.url));
      }

      if (pathname.startsWith('/employee') && role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    } catch (error) {
      console.error('Token verification error:', error);
      // On error, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('firebase-token');
      return response;
    }
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
