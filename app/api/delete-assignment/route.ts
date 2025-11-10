import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignmentId } = body;

    if (!assignmentId) {
      return NextResponse.json(
        { success: false, message: "Assignment ID is required" },
        { status: 400 }
      );
    }

    // Delete assignment members first
    const members = await adminDb
      .collection("assignment_members")
      .where("assignment_id", "==", assignmentId)
      .get();

    const batch = adminDb.batch();
    members.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete assignment document
    const assignmentRef = adminDb.collection("assignments").doc(assignmentId);
    batch.delete(assignmentRef);

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete assignment",
      },
      { status: 500 }
    );
  }
}
