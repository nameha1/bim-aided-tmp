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
    let authStateResolved = false;
    
    console.log("ProtectedRoute mounted, waiting for Firebase auth state...");
    
    // Listen to auth state changes - this is the PRIMARY source of truth
    // Firebase will restore the session from indexedDB and trigger this callback
    const unsubscribe = onAuthStateChanged(async (currentUser) => {
      console.log("Auth state changed:", "Has user:", !!currentUser);
      
      if (!isMounted) return;
      
      authStateResolved = true;

      if (currentUser) {
        console.log("User authenticated:", currentUser.uid);
        setUser(currentUser);
        
        // Fetch role when auth state changes
        try {
          const roleResponse = await fetch(`/api/user-roles/${currentUser.uid}`);
          const roleData = await roleResponse.json();
          
          if (!isMounted) return;

          if (roleData.error) {
            console.error("Error fetching role:", roleData.error);
            setUserRole(null);
          } else {
            console.log("User role:", roleData?.role);
            setUserRole(roleData?.role || null);
          }
        } catch (error) {
          console.error("Error fetching role:", error);
          if (isMounted) {
            setUserRole(null);
          }
        }
      } else {
        console.log("No authenticated user");
        setUser(null);
        setUserRole(null);
      }
      
      if (isMounted) {
        setLoading(false);
        setAuthChecked(true);
      }
    });
    
    // Safety timeout - only trigger if onAuthStateChanged never fires
    const timeout = setTimeout(() => {
      if (isMounted && !authStateResolved) {
        console.warn("Auth state never resolved, timing out after 30 seconds");
        setUser(null);
        setUserRole(null);
        setLoading(false);
        setAuthChecked(true);
      }
    }, 30000); // 30 second timeout

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userRole, loading, authChecked, requiredRole]);

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
