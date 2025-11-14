import { getSession, refreshSession } from './firebase/auth';

interface FirebaseResponse<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Wrapper for Firebase operations that handles auth errors gracefully
 */
export async function executeFirebaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<FirebaseResponse<T>> {
  try {
    // Check if session is valid
    const { session, error: sessionError } = await getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return {
        data: null,
        error: new Error('Session expired. Please log in again.'),
      };
    }

    if (!session) {
      return {
        data: null,
        error: new Error('No active session. Please log in.'),
      };
    }

    // Execute the query
    const result = await queryFn();
    
    // Handle specific Firebase errors
    if (result.error) {
      console.error('Firebase query error:', result.error);
      
      // Check for auth-related errors
      if (result.error.message?.includes('auth') || 
          result.error.message?.includes('expired') ||
          result.error.message?.includes('invalid')) {
        // Try to refresh the session
        const { error: refreshError } = await refreshSession();
        if (refreshError) {
          return {
            data: null,
            error: new Error('Session expired. Please log in again.'),
          };
        }
        
        // Retry the query once
        return await queryFn();
      }
    }
    
    return result;
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('An unexpected error occurred'),
    };
  }
}

/**
 * Refresh session if needed
 */
export async function refreshSessionIfNeeded(): Promise<boolean> {
  try {
    const { session } = await getSession();
    
    if (!session) {
      return false;
    }

    // Firebase tokens expire after 1 hour, refresh if needed
    const { error } = await refreshSession();
    if (error) {
      console.error('Failed to refresh session:', error);
      return false;
    }
    
    // Only log in development mode to avoid console spam
    if (process.env.NODE_ENV === 'development') {
      console.log('Session refreshed successfully');
    }
    return true;
  } catch (error) {
    console.error('Error checking/refreshing session:', error);
    return false;
  }
}
