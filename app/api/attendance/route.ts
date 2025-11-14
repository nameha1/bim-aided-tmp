import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

/**
 * GET /api/attendance - Get attendance records
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');
    const date = searchParams.get('date');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const status = searchParams.get('status');

    console.log('Fetching attendance with params:', { employeeId, date, startDate, endDate, status });

    let query = adminDb.collection("attendance");

    // Apply filters
    if (employeeId) {
      query = query.where("employee_id", "==", employeeId) as any;
    }

    if (date) {
      query = query.where("date", "==", date) as any;
    }

    if (status) {
      query = query.where("status", "==", status) as any;
    }

    // Order by date
    const snapshot = await query.orderBy("date", "desc").get();

    console.log(`Found ${snapshot.docs.length} attendance records`);

    let records = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        console.log(`Processing attendance record ${doc.id}, employee_id:`, data.employee_id);
        
        // Get employee details only if employee_id exists
        let employee = null;
        let employeeId = null;
        
        if (data.employee_id && typeof data.employee_id === 'string' && data.employee_id.trim() !== '') {
          try {
            const employeeDoc = await adminDb.collection("employees").doc(data.employee_id).get();
            if (employeeDoc.exists) {
              employee = employeeDoc.data();
              employeeId = employeeDoc.id;
              console.log(`Found employee: ${employee?.firstName || employee?.first_name} ${employee?.lastName || employee?.last_name}`);
            } else {
              console.warn(`Employee document not found for ID: ${data.employee_id}`);
            }
          } catch (err) {
            console.error(`Error fetching employee ${data.employee_id}:`, err);
          }
        } else {
          console.warn(`Invalid or missing employee_id for attendance record ${doc.id}`);
        }

        // Calculate total hours if both check-in and check-out exist
        let total_hours = data.total_hours;
        if (!total_hours && data.check_in_time && data.check_out_time) {
          const checkIn = data.check_in_time?.toDate?.() || new Date(data.check_in_time);
          const checkOut = data.check_out_time?.toDate?.() || new Date(data.check_out_time);
          const diffMs = checkOut.getTime() - checkIn.getTime();
          total_hours = diffMs / (1000 * 60 * 60); // Convert to hours
        }

        return {
          id: doc.id,
          ...data,
          // Convert Firestore timestamps to ISO strings
          check_in_time: data.check_in_time?.toDate?.() || data.check_in_time,
          check_out_time: data.check_out_time?.toDate?.() || data.check_out_time,
          created_at: data.created_at?.toDate?.() || data.created_at,
          total_hours: total_hours,
          employees: employee ? {
            id: employeeId,
            first_name: employee.firstName || employee.first_name,
            last_name: employee.lastName || employee.last_name,
            email: employee.email,
          } : null,
        };
      })
    );

    // Filter by date range if provided
    if (startDate && endDate) {
      records = records.filter((record: any) => {
        return record.date >= startDate && record.date <= endDate;
      });
    }

    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    console.error("Error fetching attendance records:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch attendance records" },
      { status: 500 }
    );
  }
}
