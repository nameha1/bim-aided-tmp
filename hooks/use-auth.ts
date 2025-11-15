"use client";

import { useEffect, useState, useRef } from 'react';
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
  const hasChecked = useRef(false);
  const isRedirecting = useRef(false);

  useEffect(() => {
    // Prevent multiple checks
    if (hasChecked.current || isRedirecting.current) {
      return;
    }

    hasChecked.current = true;

    async function checkAuth() {
      try {
        // Check session
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
          cache: 'no-store'
        });
        const data = await response.json();

        if (!data.session || !data.user) {
          // Not authenticated
          setIsAuthenticated(false);
          setIsLoading(false);
          if (options.redirectTo !== undefined && !isRedirecting.current) {
            isRedirecting.current = true;
            router.replace(options.redirectTo || '/login');
          }
          return;
        }

        // Get user role
        const roleResponse = await fetch(`/api/user-roles/${data.user.uid}`, {
          credentials: 'include',
          cache: 'no-store'
        });
        const roleData = await roleResponse.json();

        if (!roleResponse.ok || !roleData.role) {
          // No role assigned
          setIsAuthenticated(false);
          setIsLoading(false);
          if (options.redirectTo !== undefined && !isRedirecting.current) {
            isRedirecting.current = true;
            router.replace('/login');
          }
          return;
        }

        // Check if user has required role
        if (options.requiredRole && roleData.role !== options.requiredRole) {
          // Wrong role, redirect to appropriate dashboard
          setIsAuthenticated(false);
          setIsLoading(false);
          if (!isRedirecting.current) {
            isRedirecting.current = true;
            if (roleData.role === 'admin') {
              router.replace('/admin');
            } else {
              router.replace('/employee');
            }
          }
          return;
        }

        // User is authenticated and has correct role
        setIsAuthenticated(true);
        setUser(data.user);
        setRole(roleData.role);
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setIsLoading(false);
        if (options.redirectTo !== undefined && !isRedirecting.current) {
          isRedirecting.current = true;
          router.replace(options.redirectTo || '/login');
        }
      }
    }

    checkAuth();
  }, []); // Empty dependency array - only run once

  return { isLoading, isAuthenticated, user, role };
}
