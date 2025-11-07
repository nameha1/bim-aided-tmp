"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
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
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Check user role
          const { data: roleData, error: roleError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .single();

          if (!roleError && roleData) {
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
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('email')
          .eq('eid', emailOrEid)
          .single();

        if (employeeError || !employeeData) {
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) throw error;

      if (data.session) {
        // Check user role
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.session.user.id)
          .single();

        if (roleError) {
          console.error("Role fetch error:", roleError);
          toast({
            title: "Role not found",
            description: "Your account doesn't have a role assigned. Please contact your administrator.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          return;
        }

        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });

        // Navigate based on role
        if (roleData?.role === "admin") {
          router.push("/admin");
        } else if (roleData?.role === "employee") {
          router.push("/employee");
        } else {
          toast({
            title: "Invalid role",
            description: "Your account has an invalid role. Please contact your administrator.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
        }
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
