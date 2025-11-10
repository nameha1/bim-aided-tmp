"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, getCurrentUser } from "@/lib/firebase/auth";
import { User } from "firebase/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "employee";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    // Timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn("Auth check timed out");
        setLoading(false);
        setAuthChecked(true);
      }
    }, 10000); // 10 second timeout

    const checkAuth = async () => {
      try {
        console.log("Checking authentication...");
        const currentUser = getCurrentUser();
        
        console.log("Session check result:", { hasUser: !!currentUser });
        
        if (!isMounted) return;

        if (currentUser) {
          console.log("User found, fetching role...");
          setUser(currentUser);

          // Get user role from API
          const roleResponse = await fetch(`/api/user-roles/${currentUser.uid}`);
          const roleData = await roleResponse.json();

          console.log("Role fetch result:", { role: roleData?.role, error: roleData?.error });

          if (!isMounted) return;

          if (roleData.error) {
            console.error("Error fetching role:", roleData.error);
            setUserRole(null);
          } else {
            setUserRole(roleData?.role || null);
          }
        } else {
          console.log("No user found");
          setUser(null);
          setUserRole(null);
        }
        
        if (isMounted) {
          setLoading(false);
          setAuthChecked(true);
          clearTimeout(timeout);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        if (isMounted) {
          setUser(null);
          setUserRole(null);
          setLoading(false);
          setAuthChecked(true);
          clearTimeout(timeout);
        }
      }
    };

    checkAuth();

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(async (currentUser) => {
      console.log("Auth state changed:", "Has user:", !!currentUser);
      
      if (!isMounted) return;

      if (currentUser) {
        setUser(currentUser);
        setAuthChecked(true);
        // Fetch role when auth state changes
        try {
          const roleResponse = await fetch(`/api/user-roles/${currentUser.uid}`);
          const roleData = await roleResponse.json();
          
          if (!isMounted) return;

          if (roleData.error) {
            console.error("Error fetching role:", roleData.error);
            setUserRole(null);
          } else {
            setUserRole(roleData?.role || null);
          }
        } catch (error) {
          console.error("Error fetching role:", error);
          if (isMounted) {
            setUserRole(null);
          }
        }
      } else {
        setUser(null);
        setUserRole(null);
        setAuthChecked(true);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!loading && authChecked) {
      if (!user) {
        console.log("No user found, redirecting to login");
        router.replace("/login");
      } else if (requiredRole && userRole !== requiredRole) {
        console.log(`Role mismatch. Required: ${requiredRole}, Got: ${userRole}`);
        router.replace("/login");
      }
    }
  }, [user, userRole, loading, authChecked, requiredRole, router]);

  if (loading || !authChecked || !user || (requiredRole && userRole !== requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log("Auth check passed, rendering protected content");
  return <>{children}</>;
};

export default ProtectedRoute;
