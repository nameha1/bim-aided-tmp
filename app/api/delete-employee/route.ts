import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { verifyAdminAuth } from "@/lib/firebase/auth-helpers";

export async function POST(request: NextRequest) {
  // Verify admin authentication
  const { data: authData, error: authError, response: authResponse } = await verifyAdminAuth(request);
  if (authError || !authData) {
    return authResponse!;
  }

  try {
    const body = await request.json();
    const { employeeId, authUid } = body;

    if (!employeeId) {
      return NextResponse.json(
        { success: false, message: "Employee ID is required" },
        { status: 400 }
      );
    }

    // Delete employee document
    await adminDb.collection("employees").doc(employeeId).delete();

    // If authUid is provided, also delete user and role documents
    if (authUid) {
      // Delete user document
      const usersSnapshot = await adminDb
        .collection("users")
        .where("auth_uid", "==", authUid)
        .get();
      
      for (const doc of usersSnapshot.docs) {
        await doc.ref.delete();
      }

      // Delete user role document
      await adminDb.collection("user_roles").doc(authUid).delete();

      // Delete from Firebase Auth
      try {
        await adminAuth.deleteUser(authUid);
      } catch (authError) {
        console.error("Error deleting auth user:", authError);
        // Continue even if auth deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete employee",
      },
      { status: 500 }
    );
  }
}
