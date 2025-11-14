import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
  try {
    // Check if Firebase Admin is initialized
    const checks = {
      adminAuthInitialized: !!adminAuth,
      adminDbInitialized: !!adminDb,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not set',
      hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      timestamp: new Date().toISOString(),
    };

    // Try to list users to verify auth works
    let authWorks = false;
    let authError = null;
    try {
      await adminAuth.listUsers(1);
      authWorks = true;
    } catch (error: any) {
      authError = error.message;
    }

    // Try to list collections to verify Firestore works
    let firestoreWorks = false;
    let firestoreError = null;
    try {
      const collections = await adminDb.listCollections();
      firestoreWorks = true;
    } catch (error: any) {
      firestoreError = error.message;
    }

    return NextResponse.json({
      status: 'ok',
      checks,
      auth: {
        works: authWorks,
        error: authError,
      },
      firestore: {
        works: firestoreWorks,
        error: firestoreError,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
