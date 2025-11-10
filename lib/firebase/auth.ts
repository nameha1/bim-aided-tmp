import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  User,
  UserCredential,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  getIdToken,
} from 'firebase/auth';
import { auth } from './client';

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Create a new user with email and password
 */
export async function signUp(email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  return firebaseSignOut(auth);
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  return firebaseSendPasswordResetEmail(auth, email);
}

/**
 * Update user password
 */
export async function updatePassword(user: User, newPassword: string): Promise<void> {
  return firebaseUpdatePassword(user, newPassword);
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChanged(callback: (user: User | null) => void) {
  return firebaseOnAuthStateChanged(auth, callback);
}

/**
 * Get user ID token
 */
export async function getUserIdToken(forceRefresh = false): Promise<string | null> {
  const user = getCurrentUser();
  if (!user) return null;
  return getIdToken(user, forceRefresh);
}

/**
 * Get current session
 */
export async function getSession() {
  const user = getCurrentUser();
  if (!user) {
    return { user: null, session: null, error: null };
  }

  try {
    const token = await getIdToken(user);
    return {
      user,
      session: { access_token: token, user },
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error,
    };
  }
}

/**
 * Refresh session
 */
export async function refreshSession() {
  const user = getCurrentUser();
  if (!user) {
    return { error: new Error('No user logged in') };
  }

  try {
    await getIdToken(user, true);
    return { error: null };
  } catch (error) {
    return { error };
  }
}
