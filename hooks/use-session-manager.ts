import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { refreshSessionIfNeeded } from '@/lib/supabase-helpers';

export const useSessionManager = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const hasShownToast = useRef(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, 'Session:', !!session);

        if (event === 'SIGNED_OUT') {
          // Clear any cached data
          localStorage.removeItem('userRole');
          hasShownToast.current = false;
          router.push('/login');
        }

        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
          hasShownToast.current = false;
        }

        if (event === 'USER_UPDATED') {
          console.log('User updated');
        }
      }
    );

    // Check session on mount - only for protected routes
    const checkSession = async () => {
      const currentPath = pathname;
      const isProtectedRoute = currentPath.includes('/admin') || currentPath.includes('/employee');
      
      // Skip session check entirely for public routes
      if (!isProtectedRoute) {
        isInitialMount.current = false;
        return;
      }

      // Give ProtectedRoute component time to do its own check first
      await new Promise(resolve => setTimeout(resolve, 100));

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session manager - Session check error:', error);
        // Don't navigate here, let ProtectedRoute handle it
        isInitialMount.current = false;
        return;
      }

      if (!session && isProtectedRoute && !isInitialMount.current) {
        console.log('Session manager - No session on protected route');
        // Only navigate if this is not the initial mount
        // Let ProtectedRoute handle initial mount
      }
      
      isInitialMount.current = false;
    };

    checkSession();

    // Set up periodic session refresh (every 4 minutes)
    const refreshInterval = setInterval(async () => {
      const success = await refreshSessionIfNeeded();
      if (!success) {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/admin') || currentPath.includes('/employee')) {
          if (!hasShownToast.current) {
            toast({
              title: "Session Expired",
              description: "Your session has expired. Please log in again.",
              variant: "destructive",
            });
            hasShownToast.current = true;
          }
          router.push('/login');
        }
      }
    }, 4 * 60 * 1000); // 4 minutes

    // Refresh on user activity
    const handleActivity = () => {
      refreshSessionIfNeeded();
    };

    window.addEventListener('click', handleActivity);
    window.addEventListener('keypress', handleActivity);

    // Cleanup
    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keypress', handleActivity);
    };
  }, [router, toast, pathname]);
};
