"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="employee">
      {children}
    </ProtectedRoute>
  );
}
