import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignmentId, status, approved_by } = body;

    if (!assignmentId || !status) {
      return NextResponse.json(
        { success: false, message: "Assignment ID and status are required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "approved" && approved_by) {
      updateData.approved_by = approved_by;
      updateData.approved_at = new Date().toISOString();
    }

    await adminDb.collection("assignments").doc(assignmentId).update(updateData);

    return NextResponse.json({
      success: true,
      message: `Assignment ${status} successfully`,
    });
  } catch (error: any) {
    console.error("Error updating assignment status:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update assignment status",
      },
      { status: 500 }
    );
  }
}
