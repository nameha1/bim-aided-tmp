"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UseAuthOptions {
  requiredRole?: 'admin' | 'employee';
  redirectTo?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        // Check session
        const response = await fetch('/api/auth/session');
        const data = await response.json();

        if (!data.session || !data.user) {
          // Not authenticated
          setIsAuthenticated(false);
          if (options.redirectTo !== undefined) {
            router.push(options.redirectTo || '/login');
          }
          return;
        }

        // Get user role
        const roleResponse = await fetch(`/api/user-roles/${data.user.uid}`);
        const roleData = await roleResponse.json();

        if (!roleResponse.ok || !roleData.role) {
          // No role assigned
          setIsAuthenticated(false);
          if (options.redirectTo !== undefined) {
            router.push('/login');
          }
          return;
        }

        // Check if user has required role
        if (options.requiredRole && roleData.role !== options.requiredRole) {
          // Wrong role, redirect to appropriate dashboard
          if (roleData.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/employee');
          }
          return;
        }

        // User is authenticated and has correct role
        setIsAuthenticated(true);
        setUser(data.user);
        setRole(roleData.role);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        if (options.redirectTo !== undefined) {
          router.push(options.redirectTo || '/login');
        }
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [router, options.requiredRole, options.redirectTo]);

  return { isLoading, isAuthenticated, user, role };
}
