import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

interface SupabaseResponse<T> {
  data: T | null;
  error: PostgrestError | Error | null;
}

/**
 * Wrapper for Supabase operations that handles auth errors gracefully
 */
export async function executeSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<SupabaseResponse<T>> {
  try {
    // Check if session is valid
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
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
    
    // Handle specific Postgres errors
    if (result.error) {
      console.error('Supabase query error:', result.error);
      
      // Check for auth-related errors
      if (result.error.message?.includes('JWT') || 
          result.error.message?.includes('expired') ||
          result.error.message?.includes('invalid')) {
        // Try to refresh the session
        const { error: refreshError } = await supabase.auth.refreshSession();
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
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return false;
    }

    // Check if token is about to expire (within 5 minutes)
    const expiresAt = session.expires_at;
    if (expiresAt) {
      const expiresIn = expiresAt - Math.floor(Date.now() / 1000);
      if (expiresIn < 300) { // Less than 5 minutes
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Failed to refresh session:', error);
          return false;
        }
        console.log('Session refreshed successfully');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error checking/refreshing session:', error);
    return false;
  }
}
