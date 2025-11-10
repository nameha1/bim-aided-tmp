import { NextResponse } from 'next/server';
import { signOut } from '@/lib/firebase/auth';

export async function POST() {
  try {
    // Sign out from Firebase
    await signOut();

    // Create response and clear cookies
    const response = NextResponse.json({ success: true });
    
    response.cookies.delete('firebase-token');

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
