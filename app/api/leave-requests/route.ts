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
        const year = new Date().getFullYear();
        const leaveBalanceQuery = await adminDb.collection("leave_balances")
          .where("employee_id", "==", employeeId)
          .where("year", "==", year)
          .get();

        if (!leaveBalanceQuery.empty) {
          const leaveBalanceDoc = leaveBalanceQuery.docs[0];
          const currentBalance = leaveBalanceDoc.data();
          
          const balanceUpdate: any = {
            updated_at: new Date()
          };
          
          // Calculate actual days to deduct based on leave type
          let effectiveDays = daysRequested;
          
          // Deduct from appropriate balance
          if (leaveType === "Casual Leave" || leaveType.includes("Casual")) {
            const currentCasual = currentBalance.casual_leave_remaining || 0;
            const casualUsed = currentBalance.casual_leave_used || 0;
            
            if (effectiveDays <= currentCasual) {
              // Have enough balance
              balanceUpdate.casual_leave_used = casualUsed + effectiveDays;
              balanceUpdate.casual_leave_remaining = currentCasual - effectiveDays;
            } else {
              // Exceeds balance - mark excess as unpaid
              balanceUpdate.casual_leave_used = casualUsed + currentCasual;
              balanceUpdate.casual_leave_remaining = 0;
              balanceUpdate.unpaid_leave_days = (currentBalance.unpaid_leave_days || 0) + (effectiveDays - currentCasual);
            }
          } else if (leaveType === "Sick Leave" || leaveType.includes("Sick")) {
            const currentSick = currentBalance.sick_leave_remaining || 0;
            const sickUsed = currentBalance.sick_leave_used || 0;
            
            if (effectiveDays <= currentSick) {
              // Have enough balance
              balanceUpdate.sick_leave_used = sickUsed + effectiveDays;
              balanceUpdate.sick_leave_remaining = currentSick - effectiveDays;
            } else {
              // Exceeds balance - mark excess as unpaid
              balanceUpdate.sick_leave_used = sickUsed + currentSick;
              balanceUpdate.sick_leave_remaining = 0;
              balanceUpdate.unpaid_leave_days = (currentBalance.unpaid_leave_days || 0) + (effectiveDays - currentSick);
            }
          } else {
            // Other leave types (Unpaid, Emergency, etc.) are unpaid by default
            balanceUpdate.unpaid_leave_days = (currentBalance.unpaid_leave_days || 0) + effectiveDays;
          }

          // Update leave balance
          await leaveBalanceDoc.ref.update(balanceUpdate);
        }
        
        // Create attendance records for the leave period
        const startDate = new Date(leaveRequest.start_date);
        const endDate = new Date(leaveRequest.end_date);
        const attendanceRecords = [];
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0]; // Format: YYYY-MM-DD
          
          // Check if attendance record already exists for this date
          const existingAttendance = await adminDb.collection("attendance")
            .where("employee_id", "==", employeeId)
            .where("date", "==", dateStr)
            .get();
          
          if (existingAttendance.empty) {
            // Create new attendance record for this leave day
            await adminDb.collection("attendance").add({
              employee_id: employeeId,
              date: dateStr,
              status: 'Leave',
              leave_type: leaveType,
              check_in_time: null,
              check_out_time: null,
              total_hours: null,
              manually_added: true,
              supervisor_approved: leaveRequest.supervisor_approved || false,
              admin_approved: true,
              created_at: new Date(),
              updated_at: new Date()
            });
            attendanceRecords.push(dateStr);
          }
        }
        
        console.log(`Created ${attendanceRecords.length} attendance records for approved leave`);
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
