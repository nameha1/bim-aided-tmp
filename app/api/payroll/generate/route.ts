import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const { month, year } = await req.json();

    if (!month || !year) {
      return NextResponse.json({ 
        error: 'Month and year are required',
        message: 'Please provide month and year'
      }, { status: 400 });
    }

    // Check if payroll already exists for this month/year
    const existingPayroll = await adminDb
      .collection('payroll')
      .where('month', '==', month)
      .where('year', '==', year)
      .get();

    if (!existingPayroll.empty) {
      return NextResponse.json({ 
        error: 'Payroll already exists',
        message: `Payroll for ${month}/${year} has already been generated`
      }, { status: 400 });
    }

    // Get all active employees
    const employeesSnapshot = await adminDb
      .collection('employees')
      .where('status', '==', 'active')
      .get();

    if (employeesSnapshot.empty) {
      return NextResponse.json({ 
        error: 'No active employees',
        message: 'No active employees found to generate payroll'
      }, { status: 400 });
    }

    // Get payroll settings
    const settingsSnapshot = await adminDb.collection('payroll_settings').get();
    const settings: Record<string, string> = {};
    settingsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      settings[data.config_key] = data.config_value;
    });

    const workingDays = parseInt(settings.working_days_per_month || '30');
    const lateTolerance = parseInt(settings.late_tolerance_count || '3');

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const batch = adminDb.batch();
    let generatedCount = 0;

    for (const empDoc of employeesSnapshot.docs) {
      const employee = empDoc.data();
      const employeeId = empDoc.id;
      const basicSalary = employee.salary || 0;

      // Get attendance records for this month
      const attendanceSnapshot = await adminDb
        .collection('attendance')
        .where('employee_id', '==', employeeId)
        .where('date', '>=', startDate.toISOString().split('T')[0])
        .where('date', '<=', endDate.toISOString().split('T')[0])
        .get();

      let presentDays = 0;
      let lateDays = 0;
      let halfDays = 0;

      attendanceSnapshot.docs.forEach(doc => {
        const record = doc.data();
        if (record.status === 'present') {
          presentDays++;
          if (record.is_late) lateDays++;
        } else if (record.status === 'half_day') {
          halfDays++;
        }
      });

      // Get leave records for this month
      const leaveSnapshot = await adminDb
        .collection('leave_requests')
        .where('employee_id', '==', employeeId)
        .where('status', '==', 'approved')
        .get();

      let casualLeaveTaken = 0;
      let sickLeaveTaken = 0;
      let unpaidLeaveDays = 0;

      leaveSnapshot.docs.forEach(doc => {
        const leave = doc.data();
        const leaveStart = new Date(leave.start_date);
        const leaveEnd = new Date(leave.end_date);
        
        // Check if leave overlaps with current month
        if (leaveStart <= endDate && leaveEnd >= startDate) {
          const overlapStart = leaveStart > startDate ? leaveStart : startDate;
          const overlapEnd = leaveEnd < endDate ? leaveEnd : endDate;
          const daysInMonth = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          
          if (leave.leave_type === 'casual') {
            casualLeaveTaken += daysInMonth;
          } else if (leave.leave_type === 'sick') {
            sickLeaveTaken += daysInMonth;
          } else if (leave.leave_type === 'unpaid') {
            unpaidLeaveDays += daysInMonth;
          }
        }
      });

      // Calculate deductions
      const dailyRate = basicSalary / workingDays;
      const latePenaltyDays = Math.floor(lateDays / lateTolerance);
      const latePenalty = latePenaltyDays * dailyRate;
      const unpaidLeaveDeduction = unpaidLeaveDays * dailyRate;
      const halfDayDeduction = halfDays * (dailyRate / 2);
      const totalAbsentDays = workingDays - presentDays - halfDays - casualLeaveTaken - sickLeaveTaken - unpaidLeaveDays;
      const absentDeduction = totalAbsentDays > 0 ? totalAbsentDays * dailyRate : 0;

      const totalDeduction = latePenalty + unpaidLeaveDeduction + halfDayDeduction + absentDeduction;
      const netPayable = Math.max(0, basicSalary - totalDeduction);

      // Create payroll record
      const payrollRef = adminDb.collection('payroll').doc();
      batch.set(payrollRef, {
        employee_id: employeeId,
        month,
        year,
        basic_salary: basicSalary,
        total_present_days: presentDays,
        total_absent_days: totalAbsentDays,
        total_late_days: lateDays,
        casual_leave_taken: casualLeaveTaken,
        sick_leave_taken: sickLeaveTaken,
        unpaid_leave_days: unpaidLeaveDays,
        late_penalty_days: latePenaltyDays,
        late_penalty: latePenalty,
        unpaid_leave_deduction: unpaidLeaveDeduction,
        half_day_deduction: halfDayDeduction,
        absent_deduction: absentDeduction,
        total_deduction: totalDeduction,
        net_payable_salary: netPayable,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      generatedCount++;
    }

    await batch.commit();

    return NextResponse.json({ 
      success: true,
      message: `Payroll generated successfully for ${generatedCount} employees`,
      data: { count: generatedCount }
    });
  } catch (error: any) {
    console.error('Payroll generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate payroll',
      message: error.message 
    }, { status: 500 });
  }
}
