import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authUid, isAdmin } = body;

    if (!authUid) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Update the role in user_roles collection
    const roleRef = adminDb.collection("user_roles").doc(authUid);
    const roleDoc = await roleRef.get();

    if (!roleDoc.exists) {
      return NextResponse.json(
        { success: false, message: "User role not found" },
        { status: 404 }
      );
    }

    // Update the role based on isAdmin flag
    await roleRef.update({
      role: isAdmin ? "admin" : "employee",
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `User role updated to ${isAdmin ? "admin" : "employee"}`,
      data: { role: isAdmin ? "admin" : "employee" },
    });
  } catch (error: any) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update user role",
      },
      { status: 500 }
    );
  }
}
