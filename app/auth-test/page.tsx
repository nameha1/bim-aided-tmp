"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuthTestPage() {
  const [authInfo, setAuthInfo] = useState<any>({
    localStorage: {},
    sessionStorage: {},
    cookies: "",
    firebaseUser: null,
    loading: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
      // Check localStorage
      const localStorageData: any = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('firebase')) {
          try {
            localStorageData[key] = JSON.parse(localStorage.getItem(key) || '');
          } catch {
            localStorageData[key] = localStorage.getItem(key);
          }
        }
      }

      // Check sessionStorage
      const sessionStorageData: any = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.includes('firebase')) {
          try {
            sessionStorageData[key] = JSON.parse(sessionStorage.getItem(key) || '');
          } catch {
            sessionStorageData[key] = sessionStorage.getItem(key);
          }
        }
      }

      // Check cookies
      const cookies = document.cookie;

      // Check Firebase auth
      const { getCurrentUser } = await import('@/lib/firebase/auth');
      const user = getCurrentUser();

      setAuthInfo({
        localStorage: localStorageData,
        sessionStorage: sessionStorageData,
        cookies,
        firebaseUser: user ? {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
        } : null,
        loading: false,
      });
    };

    checkAuth();
  }, []);

  const clearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  if (authInfo.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Storage Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Firebase User:</h3>
              {authInfo.firebaseUser ? (
                <pre className="bg-green-50 border border-green-200 p-4 rounded-md text-xs overflow-auto">
                  {JSON.stringify(authInfo.firebaseUser, null, 2)}
                </pre>
              ) : (
                <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-700">
                  No Firebase user detected
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Local Storage (Firebase keys):</h3>
              {Object.keys(authInfo.localStorage).length > 0 ? (
                <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-96">
                  {JSON.stringify(authInfo.localStorage, null, 2)}
                </pre>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-yellow-700">
                  No Firebase data in localStorage
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Session Storage (Firebase keys):</h3>
              {Object.keys(authInfo.sessionStorage).length > 0 ? (
                <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-96">
                  {JSON.stringify(authInfo.sessionStorage, null, 2)}
                </pre>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-yellow-700">
                  No Firebase data in sessionStorage
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Cookies:</h3>
              {authInfo.cookies ? (
                <pre className="bg-muted p-4 rounded-md text-xs overflow-auto">
                  {authInfo.cookies}
                </pre>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-yellow-700">
                  No cookies found
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button onClick={() => window.location.href = "/login"}>
                Go to Login
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh
              </Button>
              <Button variant="destructive" onClick={clearStorage}>
                Clear All Storage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
