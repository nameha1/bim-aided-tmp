import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/firebase/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Sign in with Firebase
    const result = await signIn(email, password);

    if (!result.user) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    // Get ID token from the user
    const idToken = await result.user.getIdToken();

    // Create response with session data
    const response = NextResponse.json({
      session: {
        user: {
          id: result.user.uid,
          email: result.user.email,
          email_verified: result.user.emailVerified,
        },
      },
      user: {
        id: result.user.uid,
        email: result.user.email,
        email_verified: result.user.emailVerified,
      },
    });

    // Set Firebase ID token as cookie for subsequent requests
    response.cookies.set('firebase-token', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour (Firebase tokens expire after 1 hour)
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    // Handle Firebase auth errors
    let errorMessage = 'Authentication failed';
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      errorMessage = 'Invalid email or password';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed login attempts. Please try again later';
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 401 }
    );
  }
}
