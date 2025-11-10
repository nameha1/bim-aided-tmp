import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignmentId, title, project_note, start_date, deadline, supervisor_id, members } = body;

    if (!assignmentId) {
      return NextResponse.json(
        { success: false, message: "Assignment ID is required" },
        { status: 400 }
      );
    }

    // Update assignment document
    const updateData = {
      title,
      project_note: project_note || null,
      start_date,
      deadline,
      supervisor_id: supervisor_id || null,
      updated_at: new Date().toISOString(),
    };

    await adminDb.collection("assignments").doc(assignmentId).update(updateData);

    // Delete existing members
    const existingMembers = await adminDb
      .collection("assignment_members")
      .where("assignment_id", "==", assignmentId)
      .get();

    const deleteBatch = adminDb.batch();
    existingMembers.docs.forEach((doc) => {
      deleteBatch.delete(doc.ref);
    });
    await deleteBatch.commit();

    // Add new members
    if (members && members.length > 0) {
      const addBatch = adminDb.batch();
      members.forEach((member: any) => {
        const memberRef = adminDb.collection("assignment_members").doc();
        addBatch.set(memberRef, {
          assignment_id: assignmentId,
          employee_id: member.employee_id,
          role: member.role,
          personal_note: member.personal_note || null,
          created_at: new Date().toISOString(),
        });
      });
      await addBatch.commit();
    }

    return NextResponse.json({
      success: true,
      message: "Assignment updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update assignment",
      },
      { status: 500 }
    );
  }
}
