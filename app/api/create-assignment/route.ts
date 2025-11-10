import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, project_note, start_date, deadline, supervisor_id, created_by, members } = body;

    if (!title || !start_date || !deadline || !members || members.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create assignment document
    const assignmentData = {
      title,
      project_note: project_note || null,
      start_date,
      deadline,
      status: "in_progress",
      supervisor_id: supervisor_id || null,
      created_by: created_by || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const assignmentRef = await adminDb.collection("assignments").add(assignmentData);
    const assignmentId = assignmentRef.id;

    // Create assignment members
    const batch = adminDb.batch();
    members.forEach((member: any) => {
      const memberRef = adminDb.collection("assignment_members").doc();
      batch.set(memberRef, {
        assignment_id: assignmentId,
        employee_id: member.employee_id,
        role: member.role,
        personal_note: member.personal_note || null,
        created_at: new Date().toISOString(),
      });
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: "Assignment created successfully",
      data: { id: assignmentId, ...assignmentData },
    });
  } catch (error: any) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create assignment",
      },
      { status: 500 }
    );
  }
}
