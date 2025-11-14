// Temporary diagnostic page to help debug the employee login issue
// This will show detailed information about the authentication state

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DiagnosticPage() {
  const [diagnostics, setDiagnostics] = useState<any>({
    authState: "Checking...",
    currentUser: null,
    employeeData: null,
    errors: [],
    steps: [],
  });
  const router = useRouter();

  useEffect(() => {
    const runDiagnostics = async () => {
      const steps: string[] = [];
      const errors: string[] = [];
      let currentUser = null;
      let employeeData = null;

      try {
        // Step 1: Check Firebase initialization
        steps.push("✓ Starting diagnostics");
        
        // Step 2: Import Firebase auth
        steps.push("Importing Firebase auth...");
        const { getCurrentUser, onAuthStateChanged } = await import('@/lib/firebase/auth');
        steps.push("✓ Firebase auth imported");

        // Step 3: Wait for auth to initialize
        steps.push("Waiting for auth state to initialize...");
        currentUser = await new Promise<any>((resolve) => {
          const user = getCurrentUser();
          if (user) {
            resolve(user);
            return;
          }
          
          let timeout: NodeJS.Timeout;
          const unsubscribe = onAuthStateChanged((user) => {
            clearTimeout(timeout);
            unsubscribe();
            resolve(user);
          });
          
          timeout = setTimeout(() => {
            unsubscribe();
            resolve(null);
          }, 3000);
        });
        
        if (currentUser) {
          steps.push(`✓ Current user found: ${currentUser.email} (UID: ${currentUser.uid})`);
          
          // Step 4: Fetch employee data
          steps.push("Fetching employee data from Firestore...");
          const { getDocuments } = await import('@/lib/firebase/firestore');
          const { where } = await import('firebase/firestore');
          
          const { data: employees, error } = await getDocuments('employees', [
            where('auth_uid', '==', currentUser.uid)
          ]);
          
          if (error) {
            errors.push(`Error fetching employees: ${error.message || JSON.stringify(error)}`);
            steps.push("✗ Error fetching employee data");
          } else if (!employees || employees.length === 0) {
            errors.push("No employee found with matching auth_uid");
            steps.push("✗ No employee record found");
          } else {
            employeeData = employees[0];
            steps.push(`✓ Employee data found: ${employeeData.firstName} ${employeeData.lastName} (ID: ${employeeData.id})`);
          }
          
          // Step 5: Check user role
          steps.push("Checking user role...");
          try {
            const roleResponse = await fetch(`/api/user-roles/${currentUser.uid}`);
            const roleData = await roleResponse.json();
            
            if (roleData.error) {
              errors.push(`Role fetch error: ${roleData.error}`);
              steps.push("✗ Error fetching role");
            } else {
              steps.push(`✓ User role: ${roleData.role}`);
            }
          } catch (roleError: any) {
            errors.push(`Role fetch exception: ${roleError.message}`);
            steps.push("✗ Exception fetching role");
          }
          
        } else {
          errors.push("No authenticated user found");
          steps.push("✗ No current user");
        }

        setDiagnostics({
          authState: currentUser ? "Authenticated" : "Not authenticated",
          currentUser: currentUser ? {
            uid: currentUser.uid,
            email: currentUser.email,
            emailVerified: currentUser.emailVerified,
          } : null,
          employeeData,
          errors,
          steps,
        });

      } catch (error: any) {
        errors.push(`Fatal error: ${error.message}`);
        steps.push(`✗ Fatal error: ${error.message}`);
        
        setDiagnostics({
          authState: "Error",
          currentUser,
          employeeData,
          errors,
          steps,
        });
      }
    };

    runDiagnostics();
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Employee Login Diagnostics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Authentication State:</h3>
              <p className={diagnostics.authState === "Authenticated" ? "text-green-600" : "text-red-600"}>
                {diagnostics.authState}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Diagnostic Steps:</h3>
              <div className="bg-muted p-4 rounded-md font-mono text-sm space-y-1">
                {diagnostics.steps.map((step: string, i: number) => (
                  <div key={i}>{step}</div>
                ))}
              </div>
            </div>

            {diagnostics.errors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-red-600">Errors:</h3>
                <div className="bg-red-50 border border-red-200 p-4 rounded-md text-sm space-y-1">
                  {diagnostics.errors.map((error: string, i: number) => (
                    <div key={i} className="text-red-700">• {error}</div>
                  ))}
                </div>
              </div>
            )}

            {diagnostics.currentUser && (
              <div>
                <h3 className="font-semibold mb-2">Current User:</h3>
                <pre className="bg-muted p-4 rounded-md text-xs overflow-auto">
                  {JSON.stringify(diagnostics.currentUser, null, 2)}
                </pre>
              </div>
            )}

            {diagnostics.employeeData && (
              <div>
                <h3 className="font-semibold mb-2">Employee Data:</h3>
                <pre className="bg-muted p-4 rounded-md text-xs overflow-auto">
                  {JSON.stringify(diagnostics.employeeData, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button onClick={() => router.push("/employee")}>
                Go to Employee Dashboard
              </Button>
              <Button variant="outline" onClick={() => router.push("/login")}>
                Back to Login
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh Diagnostics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
