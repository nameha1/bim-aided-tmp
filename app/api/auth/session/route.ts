import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { verifyIdToken } from '@/lib/firebase/server';
import { cookies } from 'next/headers';

/**
 * GET /api/auth/session - Get current user session
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-token')?.value;

    if (!token) {
      return NextResponse.json({ session: null, user: null });
    }

    // Verify token
    const { data: decodedToken, error } = await verifyIdToken(token);

    if (error || !decodedToken) {
      return NextResponse.json({ session: null, user: null, error: 'Invalid token' });
    }

    // Get user details from Firebase Auth
    const user = await adminAuth.getUser(decodedToken.uid);

    // Optionally get additional user data from Firestore
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    return NextResponse.json({
      session: { access_token: token },
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        ...userData,
      },
    });
  } catch (error: any) {
    console.error('Session error:', error);
    return NextResponse.json(
      { session: null, user: null, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/session - Create session (set cookie)
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'Missing ID token' },
        { status: 400 }
      );
    }

    // Verify the ID token
    const { data: decodedToken, error } = await verifyIdToken(idToken);

    if (error || !decodedToken) {
      return NextResponse.json(
        { error: 'Invalid ID token' },
        { status: 401 }
      );
    }

    // Create session cookie (expires in 14 days)
    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 days in milliseconds

    const response = NextResponse.json({ success: true });
    
    response.cookies.set('firebase-token', idToken, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/session - Delete session (clear cookie)
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  
  response.cookies.delete('firebase-token');

  return response;
}
