import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth } from './admin';

export interface AuthenticatedRequest {
  userId: string;
  email: string;
  role?: string;
}

/**
 * Verify the authentication token from cookies and return user info
 */
export async function verifyAuth(request: NextRequest): Promise<{ data: AuthenticatedRequest | null; error: string | null }> {
  try {
    // Get token from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-token')?.value;

    if (!token) {
      return { data: null, error: 'No authentication token found' };
    }

    // Verify token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(token);

    if (!decodedToken) {
      return { data: null, error: 'Invalid authentication token' };
    }

    return {
      data: {
        userId: decodedToken.uid,
        email: decodedToken.email || '',
        role: decodedToken.role,
      },
      error: null,
    };
  } catch (error: any) {
    console.error('Auth verification error:', error);
    return { data: null, error: error.message || 'Authentication failed' };
  }
}

/**
 * Verify that the authenticated user has admin role
 */
export async function verifyAdminAuth(request: NextRequest): Promise<{ data: AuthenticatedRequest | null; error: string | null; response?: NextResponse }> {
  const { data: authData, error } = await verifyAuth(request);

  if (error || !authData) {
    return {
      data: null,
      error: error || 'Authentication required',
      response: NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      ),
    };
  }

  // Check if user is admin
  try {
    const { adminDb } = await import('./admin');
    const roleDoc = await adminDb.collection('user_roles').doc(authData.userId).get();
    
    if (!roleDoc.exists || roleDoc.data()?.role !== 'admin') {
      return {
        data: null,
        error: 'Admin access required',
        response: NextResponse.json(
          { error: 'Forbidden - Admin access required' },
          { status: 403 }
        ),
      };
    }

    return { data: { ...authData, role: 'admin' }, error: null };
  } catch (err: any) {
    console.error('Admin verification error:', err);
    return {
      data: null,
      error: 'Failed to verify admin role',
      response: NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Verify that the authenticated user has employee role (or admin)
 */
export async function verifyEmployeeAuth(request: NextRequest): Promise<{ data: AuthenticatedRequest | null; error: string | null; response?: NextResponse }> {
  const { data: authData, error } = await verifyAuth(request);

  if (error || !authData) {
    return {
      data: null,
      error: error || 'Authentication required',
      response: NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      ),
    };
  }

  // Check if user is employee or admin
  try {
    const { adminDb } = await import('./admin');
    const roleDoc = await adminDb.collection('user_roles').doc(authData.userId).get();
    
    if (!roleDoc.exists) {
      return {
        data: null,
        error: 'User role not found',
        response: NextResponse.json(
          { error: 'Forbidden - User role not found' },
          { status: 403 }
        ),
      };
    }

    const userRole = roleDoc.data()?.role;
    if (userRole !== 'employee' && userRole !== 'admin') {
      return {
        data: null,
        error: 'Employee access required',
        response: NextResponse.json(
          { error: 'Forbidden - Employee access required' },
          { status: 403 }
        ),
      };
    }

    return { data: { ...authData, role: userRole }, error: null };
  } catch (err: any) {
    console.error('Employee verification error:', err);
    return {
      data: null,
      error: 'Failed to verify employee role',
      response: NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      ),
    };
  }
}
