import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

    if (!projectId) {
      throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set in environment variables');
    }

    // For production, use service account from environment variable
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : undefined;

    if (serviceAccount) {
      console.log('Initializing Firebase Admin with service account...');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: projectId,
        storageBucket: storageBucket,
      });
      console.log('Firebase Admin initialized successfully with service account');
    } else {
      // For development, use application default credentials
      console.log('Initializing Firebase Admin with default credentials...');
      console.warn('Warning: FIREBASE_SERVICE_ACCOUNT_KEY not found. Using default credentials.');
      admin.initializeApp({
        projectId: projectId,
        storageBucket: storageBucket,
      });
      console.log('Firebase Admin initialized successfully with default credentials');
    }
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    throw error;
  }
} else {
  console.log('Firebase Admin already initialized');
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();

export default admin;
