"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [emailOrEid, setEmailOrEid] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const sessionData = await response.json();
        
        if (sessionData.session) {
          // Check user role
          const roleResponse = await fetch(`/api/user-roles/${sessionData.session.user.id}`);
          const roleData = await roleResponse.json();

          if (roleData.role) {
            if (roleData.role === "admin") {
              router.push("/admin");
            } else if (roleData.role === "employee") {
              router.push("/employee");
            }
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let loginEmail = emailOrEid;

      // Check if the input is an EID (doesn't contain @)
      if (!emailOrEid.includes('@')) {
        // Look up the email from the employees table using EID
        const employeeResponse = await fetch(`/api/employees/by-eid/${emailOrEid}`);
        const employeeData = await employeeResponse.json();

        if (!employeeResponse.ok || !employeeData.email) {
          toast({
            title: "Login failed",
            description: "Invalid EID or email. Please check your credentials.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        loginEmail = employeeData.email;
      }

      // Import Firebase auth on the client side
      const { signIn: firebaseSignIn } = await import('@/lib/firebase/auth');
      
      // Sign in with Firebase on the client side (this persists auth state in browser)
      console.log("Signing in with Firebase...");
      const userCredential = await firebaseSignIn(loginEmail, password);
      
      if (!userCredential.user) {
        throw new Error('Authentication failed');
      }

      console.log("Firebase sign in successful:", userCredential.user.uid);

      // Get ID token and create session cookie
      const idToken = await userCredential.user.getIdToken();
      const sessionResponse = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!sessionResponse.ok) {
        console.error("Failed to create session cookie");
      } else {
        console.log("Session cookie created successfully");
      }

      // Check user role
      const roleResponse = await fetch(`/api/user-roles/${userCredential.user.uid}`);
      const roleData = await roleResponse.json();

      if (!roleResponse.ok || roleData.error) {
        console.error("Role fetch error:", roleData.error);
        toast({
          title: "Role not found",
          description: "Your account doesn't have a role assigned. Please contact your administrator.",
          variant: "destructive",
        });
        
        // Sign out on error
        const { signOut } = await import('@/lib/firebase/auth');
        await signOut();
        return;
      }

      console.log("User role:", roleData.role);

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      // Small delay to ensure Firebase auth state is fully persisted
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate based on role with router.push (no hard redirect needed now)
      if (roleData?.role === "admin") {
        console.log("Redirecting to admin dashboard...");
        router.push("/admin");
      } else if (roleData?.role === "employee") {
        console.log("Redirecting to employee dashboard...");
        router.push("/employee");
      } else {
        toast({
          title: "Invalid role",
          description: "Your account has an invalid role. Please contact your administrator.",
          variant: "destructive",
        });
        const { signOut } = await import('@/lib/firebase/auth');
        await signOut();
      }
    } catch (error: any) {

      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">BIMaided</CardTitle>
          <CardDescription>Employee Portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailOrEid">Email or EID</Label>
              <Input
                id="emailOrEid"
                type="text"
                placeholder="your.email@bimaided.com or EMP001"
                value={emailOrEid}
                onChange={(e) => setEmailOrEid(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
