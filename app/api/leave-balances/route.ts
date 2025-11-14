import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

/**
 * GET /api/leave-balances - Get leave balance for an employee
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    if (!employeeId) {
      return NextResponse.json(
        { success: false, message: "Employee ID is required" },
        { status: 400 }
      );
    }

    const snapshot = await adminDb
      .collection("leave_balances")
      .where("employee_id", "==", employeeId)
      .where("year", "==", parseInt(year))
      .get();

    if (snapshot.empty) {
      // Return default balances if none exist
      const defaultSettings = await getLeaveSettings();
      return NextResponse.json({
        success: true,
        data: {
          employee_id: employeeId,
          year: parseInt(year),
          casual_leave_total: defaultSettings.casual_leave || 10,
          casual_leave_used: 0,
          casual_leave_remaining: defaultSettings.casual_leave || 10,
          sick_leave_total: defaultSettings.sick_leave || 10,
          sick_leave_used: 0,
          sick_leave_remaining: defaultSettings.sick_leave || 10,
          unpaid_leave_days: 0,
        },
      });
    }

    const balanceData = snapshot.docs[0].data();
    return NextResponse.json({
      success: true,
      data: {
        id: snapshot.docs[0].id,
        ...balanceData,
      },
    });
  } catch (error: any) {
    console.error("Error fetching leave balance:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch leave balance" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leave-balances - Create or update leave balance
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employee_id, year, casual_leave_used, sick_leave_used, unpaid_leave_days } = body;

    if (!employee_id || !year) {
      return NextResponse.json(
        { success: false, message: "Employee ID and year are required" },
        { status: 400 }
      );
    }

    const defaultSettings = await getLeaveSettings();
    const casualLeaveTotal = defaultSettings.casual_leave || 10;
    const sickLeaveTotal = defaultSettings.sick_leave || 10;

    // Check if balance exists
    const existingSnapshot = await adminDb
      .collection("leave_balances")
      .where("employee_id", "==", employee_id)
      .where("year", "==", year)
      .get();

    const balanceData: any = {
      employee_id,
      year,
      casual_leave_total: casualLeaveTotal,
      casual_leave_used: casual_leave_used || 0,
      casual_leave_remaining: casualLeaveTotal - (casual_leave_used || 0),
      sick_leave_total: sickLeaveTotal,
      sick_leave_used: sick_leave_used || 0,
      sick_leave_remaining: sickLeaveTotal - (sick_leave_used || 0),
      unpaid_leave_days: unpaid_leave_days || 0,
      updated_at: new Date().toISOString(),
    };

    if (existingSnapshot.empty) {
      // Create new
      balanceData.created_at = new Date().toISOString();
      const docRef = await adminDb.collection("leave_balances").add(balanceData);
      return NextResponse.json({
        success: true,
        message: "Leave balance created successfully",
        data: { id: docRef.id, ...balanceData },
      });
    } else {
      // Update existing
      const docId = existingSnapshot.docs[0].id;
      await adminDb.collection("leave_balances").doc(docId).update(balanceData);
      return NextResponse.json({
        success: true,
        message: "Leave balance updated successfully",
        data: { id: docId, ...balanceData },
      });
    }
  } catch (error: any) {
    console.error("Error updating leave balance:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update leave balance" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get leave settings
 */
async function getLeaveSettings(): Promise<{ casual_leave: number; sick_leave: number }> {
  try {
    const settingsSnapshot = await adminDb.collection("payroll_settings").get();
    const settings: Record<string, string> = {};
    
    settingsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      settings[data.config_key] = data.config_value;
    });

    return {
      casual_leave: parseInt(settings.annual_casual_leave || '10'),
      sick_leave: parseInt(settings.annual_sick_leave || '10'),
    };
  } catch (error) {
    console.error("Error fetching leave settings:", error);
    return { casual_leave: 10, sick_leave: 10 };
  }
}
