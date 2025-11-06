import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "employee";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
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
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log("Session check result:", { hasSession: !!session, error: sessionError });
        
        if (!isMounted) return;

        if (sessionError) {
          console.error("Session error:", sessionError);
          setUser(null);
          setUserRole(null);
          setLoading(false);
          setAuthChecked(true);
          clearTimeout(timeout);
          return;
        }

        if (session?.user) {
          console.log("User found, fetching role...");
          setUser(session.user);

          // Get user role
          const { data: roleData, error: roleError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .single();

          console.log("Role fetch result:", { role: roleData?.role, error: roleError });

          if (!isMounted) return;

          if (roleError) {
            console.error("Error fetching role:", roleError);
            setUserRole(null);
          } else {
            setUserRole(roleData?.role || null);
          }
        } else {
          console.log("No session found");
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, "Has session:", !!session);
      
      if (!isMounted) return;

      if (session?.user) {
        setUser(session.user);
        setAuthChecked(true);
        // Fetch role when auth state changes
        try {
          const { data, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .single();
          
          if (!isMounted) return;

          if (error) {
            console.error("Error fetching role:", error);
            setUserRole(null);
          } else {
            setUserRole(data?.role || null);
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
      subscription.unsubscribe();
    };
  }, []);

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    console.log(`Role mismatch. Required: ${requiredRole}, Got: ${userRole}`);
    return <Navigate to="/login" replace />;
  }

  console.log("Auth check passed, rendering protected content");
  return <>{children}</>;
};

export default ProtectedRoute;
