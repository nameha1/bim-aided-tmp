import { cookies } from 'next/headers';
import { adminAuth } from './admin';

/**
 * Verify Firebase ID token from cookies
 */
export async function verifyIdToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return { data: decodedToken, error: null };
  } catch (error) {
    console.error('Error verifying token:', error);
    return { data: null, error };
  }
}

/**
 * Get user from server-side request
 */
export async function getServerUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-token')?.value;
    
    if (!token) {
      return { user: null, error: null };
    }

    const { data: decodedToken, error } = await verifyIdToken(token);
    
    if (error || !decodedToken) {
      return { user: null, error };
    }

    const user = await adminAuth.getUser(decodedToken.uid);
    return { user, error: null };
  } catch (error) {
    console.error('Error getting server user:', error);
    return { user: null, error };
  }
}

/**
 * Set custom user claims
 */
export async function setCustomClaims(uid: string, claims: Record<string, any>) {
  try {
    await adminAuth.setCustomUserClaims(uid, claims);
    return { error: null };
  } catch (error) {
    console.error('Error setting custom claims:', error);
    return { error };
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  try {
    const user = await adminAuth.getUserByEmail(email);
    return { data: user, error: null };
  } catch (error) {
    console.error('Error getting user by email:', error);
    return { data: null, error };
  }
}

/**
 * Create a new user
 */
export async function createUser(email: string, password: string, displayName?: string) {
  try {
    const user = await adminAuth.createUser({
      email,
      password,
      displayName,
    });
    return { data: user, error: null };
  } catch (error) {
    console.error('Error creating user:', error);
    return { data: null, error };
  }
}

/**
 * Update user
 */
export async function updateUser(uid: string, data: any) {
  try {
    const user = await adminAuth.updateUser(uid, data);
    return { data: user, error: null };
  } catch (error) {
    console.error('Error updating user:', error);
    return { data: null, error };
  }
}

/**
 * Delete user
 */
export async function deleteUser(uid: string) {
  try {
    await adminAuth.deleteUser(uid);
    return { error: null };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { error };
  }
}
