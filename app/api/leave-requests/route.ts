import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

/**
 * GET /api/leave-requests - Get all leave requests
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employee_id');
    const adminPending = searchParams.get('admin_pending');

    let query = adminDb.collection("leave_requests");

    // Apply filters
    if (adminPending === 'true') {
      // For admin, show only requests that are pending admin approval
      // This includes requests with no supervisor OR requests already approved by supervisor
      query = query.where("status", "==", "pending_admin") as any;
    } else if (status && status !== 'all') {
      query = query.where("status", "==", status) as any;
    }

    if (employeeId) {
      query = query.where("employee_id", "==", employeeId) as any;
    }

    // Get all documents (orderBy removed temporarily until Firestore index is created)
    // TODO: Re-enable orderBy after creating composite index in Firebase Console
    const snapshot = await query.get();

    const requests = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        
        // Get employee details
        const employeeDoc = await adminDb.collection("employees").doc(data.employee_id).get();
        const employee = employeeDoc.data();

        return {
          id: doc.id,
          ...data,
          employee: employee ? {
            id: employeeDoc.id,
            firstName: employee.firstName || employee.first_name,
            lastName: employee.lastName || employee.last_name,
            email: employee.email,
          } : null,
          created_at: data.created_at,
        };
      })
    );

    // Sort by created_at in JavaScript (temporary solution until Firestore index is created)
    requests.sort((a, b) => {
      const dateA = a.created_at?.toDate?.() || new Date(a.created_at || 0);
      const dateB = b.created_at?.toDate?.() || new Date(b.created_at || 0);
      return dateB.getTime() - dateA.getTime();
    });

    return NextResponse.json({ success: true, data: requests });
  } catch (error: any) {
    console.error("Error fetching leave requests:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch leave requests" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leave-requests - Update leave request status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, action, approved_by } = body;

    if (!requestId || !action) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the leave request details
    const leaveRequestDoc = await adminDb.collection("leave_requests").doc(requestId).get();
    if (!leaveRequestDoc.exists) {
      return NextResponse.json(
        { success: false, message: "Leave request not found" },
        { status: 404 }
      );
    }

    const leaveRequest = leaveRequestDoc.data();
    const employeeId = leaveRequest?.employee_id;
    const leaveType = leaveRequest?.leave_type;
    const daysRequested = leaveRequest?.days_requested || 0;

    const updateData: any = {
      updated_at: new Date(),
    };

    if (action === 'approve') {
      updateData.status = 'approved';
      updateData.admin_approved = true;
      updateData.admin_approved_at = new Date();
      updateData.approved_at = new Date();
      if (approved_by) {
        updateData.admin_approved_by = approved_by;
      }

      // Deduct leave balance when approved
      if (employeeId && leaveType && daysRequested > 0) {
        const employeeRef = adminDb.collection("employees").doc(employeeId);
        const employeeDoc = await employeeRef.get();
        
        if (employeeDoc.exists) {
          const employeeData = employeeDoc.data();
          const balanceUpdate: any = {};
          
          // Calculate actual days to deduct based on leave type
          let effectiveDays = daysRequested;
          
          // Handle fractional leaves
          if (leaveType === "Hourly Leave") {
            // Convert hours to fractional days (assuming 8 hours = 1 day)
            effectiveDays = daysRequested / 8;
            updateData.effective_days = effectiveDays; // Store for payroll
          } else if (leaveType === "Half Day Leave") {
            // Each half day = 0.5 days
            effectiveDays = daysRequested * 0.5;
            updateData.effective_days = effectiveDays;
          }

          // Deduct from appropriate balance
          if (leaveType === "Casual Leave" || leaveType === "Hourly Leave" || leaveType === "Half Day Leave") {
            // Fractional leaves deduct from casual leave balance
            const currentBalance = employeeData?.casual_leave_remaining || 0;
            const newBalance = Math.max(0, currentBalance - effectiveDays);
            balanceUpdate.casual_leave_remaining = newBalance;
            
            // If exceeds balance, track unpaid days
            if (effectiveDays > currentBalance) {
              const unpaidDays = effectiveDays - currentBalance;
              balanceUpdate.unpaid_leave_days = (employeeData?.unpaid_leave_days || 0) + unpaidDays;
            }
          } else if (leaveType === "Sick Leave") {
            const currentBalance = employeeData?.sick_leave_remaining || 0;
            const newBalance = Math.max(0, currentBalance - effectiveDays);
            balanceUpdate.sick_leave_remaining = newBalance;
            
            // If exceeds balance, track unpaid days
            if (effectiveDays > currentBalance) {
              const unpaidDays = effectiveDays - currentBalance;
              balanceUpdate.unpaid_leave_days = (employeeData?.unpaid_leave_days || 0) + unpaidDays;
            }
          } else if (leaveType === "Unpaid Leave" || leaveType === "Full Day Leave" || leaveType === "Other Leave") {
            // These types directly impact salary
            balanceUpdate.unpaid_leave_days = (employeeData?.unpaid_leave_days || 0) + effectiveDays;
          } else if (leaveType === "Earned Leave" || leaveType === "Paid Leave" || leaveType === "Maternity Leave") {
            // Paid leaves deduct from casual balance
            const currentBalance = employeeData?.casual_leave_remaining || 0;
            const newBalance = Math.max(0, currentBalance - effectiveDays);
            balanceUpdate.casual_leave_remaining = newBalance;
            
            if (effectiveDays > currentBalance) {
              const unpaidDays = effectiveDays - currentBalance;
              balanceUpdate.unpaid_leave_days = (employeeData?.unpaid_leave_days || 0) + unpaidDays;
            }
          }

          // Update employee balance
          if (Object.keys(balanceUpdate).length > 0) {
            await employeeRef.update(balanceUpdate);
          }

          // Also update leave_balances collection for the current year
          const year = new Date().getFullYear();
          const leaveBalanceQuery = await adminDb.collection("leave_balances")
            .where("employee_id", "==", employeeId)
            .where("year", "==", year)
            .get();

          if (!leaveBalanceQuery.empty) {
            const leaveBalanceDoc = leaveBalanceQuery.docs[0];
            await leaveBalanceDoc.ref.update(balanceUpdate);
          }
        }
      }
    } else if (action === 'reject') {
      updateData.status = 'rejected';
      updateData.admin_approved = false;
      updateData.admin_approved_at = new Date();
      updateData.rejected_by = 'admin';
      updateData.rejection_reason = body.reason || 'Rejected by admin';
      if (approved_by) {
        updateData.admin_approved_by = approved_by;
      }
    }

    await adminDb.collection("leave_requests").doc(requestId).update(updateData);

    return NextResponse.json({
      success: true,
      message: `Leave request ${action}d successfully`,
    });
  } catch (error: any) {
    console.error("Error updating leave request:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update leave request" },
      { status: 500 }
    );
  }
}
