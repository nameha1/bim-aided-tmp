import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/server';
import { adminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/verify - Verify token and return user role
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify the token
    const { data: decodedToken, error } = await verifyIdToken(token);

    if (error || !decodedToken) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user role from Firestore
    const roleDoc = await adminDb.collection('user_roles').doc(decodedToken.uid).get();
    
    if (!roleDoc.exists) {
      return NextResponse.json(
        { error: 'User role not found' },
        { status: 403 }
      );
    }

    const roleData = roleDoc.data();

    return NextResponse.json({
      valid: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: roleData?.role || 'employee',
    });
  } catch (error: any) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Token verification failed' },
      { status: 401 }
    );
  }
}
