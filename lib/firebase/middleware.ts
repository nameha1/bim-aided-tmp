import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from './server';

/**
 * Middleware helper to verify Firebase authentication
 */
export async function withAuth(
  request: NextRequest,
  handler?: (request: NextRequest, decodedToken: any) => Promise<NextResponse>
) {
  try {
    // Get token from cookie or Authorization header
    const token = 
      request.cookies.get('firebase-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const { data: decodedToken, error } = await verifyIdToken(token);

    if (error || !decodedToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // If handler is provided, call it with the decoded token
    if (handler) {
      return handler(request, decodedToken);
    }

    // Otherwise, just return success (token is valid)
    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Check if user has specific role
 */
export function hasRole(decodedToken: any, role: string): boolean {
  return decodedToken.role === role || decodedToken[role] === true;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(decodedToken: any, roles: string[]): boolean {
  return roles.some(role => hasRole(decodedToken, role));
}
