import { useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut } from '@/lib/firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { refreshSessionIfNeeded } from '@/lib/firebase-helpers';

export const useSessionManager = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const hasShownToast = useRef(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(async (user) => {
      console.log('Auth state changed:', !!user);

      if (!user) {
        // Clear any cached data
        localStorage.removeItem('userRole');
        hasShownToast.current = false;
        
        const currentPath = pathname;
        const isProtectedRoute = currentPath.includes('/admin') || currentPath.includes('/employee');
        
        if (isProtectedRoute && !isInitialMount.current) {
          router.push('/login');
        }
      }
      
      isInitialMount.current = false;
    });

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
      
      isInitialMount.current = false;
    };

    checkSession();

    // Set up periodic session refresh (every 50 minutes, Firebase tokens expire after 1 hour)
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
    }, 50 * 60 * 1000); // 50 minutes

    // Refresh on user activity
    const handleActivity = () => {
      refreshSessionIfNeeded();
    };

    window.addEventListener('click', handleActivity);
    window.addEventListener('keypress', handleActivity);

    // Cleanup
    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keypress', handleActivity);
    };
  }, [router, toast, pathname]);
};
