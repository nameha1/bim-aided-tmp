import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdminAuth } from '@/lib/firebase/auth-helpers';
import {
  calculateMonthlyWorkingDays,
  calculateLeaveOverlapDays,
  calculateMonthlySalaryDeductions,
  determineUnpaidLeaveDays,
} from '@/lib/working-days-utils';

export async function POST(req: NextRequest) {
  // Verify admin authentication
  const { data: authData, error: authError, response: authResponse } = await verifyAdminAuth(req);
  if (authError || !authData) {
    return authResponse!;
  }

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

    const lateTolerance = parseInt(settings.late_tolerance_count || '3');
    const casualLeaveLimit = parseInt(settings.annual_casual_leave || '10');
    const sickLeaveLimit = parseInt(settings.annual_sick_leave || '10');

    // Get all holidays for this year
    const holidaysSnapshot = await adminDb
      .collection('holidays')
      .where('date', '>=', `${year}-01-01`)
      .where('date', '<=', `${year}-12-31`)
      .get();

    const holidays = holidaysSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    // Calculate actual working days for this month (excluding weekends and holidays)
    const workingDays = calculateMonthlyWorkingDays(month, year, holidays);

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

      // Get employee's leave balances (from previous year or start of year)
      const leaveBalanceSnapshot = await adminDb
        .collection('leave_balances')
        .where('employee_id', '==', employeeId)
        .where('year', '==', year)
        .get();

      let casualLeaveBalance = casualLeaveLimit;
      let sickLeaveBalance = sickLeaveLimit;

      if (!leaveBalanceSnapshot.empty) {
        const balanceData = leaveBalanceSnapshot.docs[0].data();
        casualLeaveBalance = balanceData.casual_leave_remaining || casualLeaveLimit;
        sickLeaveBalance = balanceData.sick_leave_remaining || sickLeaveLimit;
      }

      // Get leave records for this year (to calculate balance used so far)
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
          // Calculate working days in the overlap period (excluding weekends/holidays)
          const overlapDays = calculateLeaveOverlapDays(
            leaveStart,
            leaveEnd,
            month,
            year,
            holidays
          );

          // Determine if leave should be unpaid based on balances
          const leaveBreakdown = determineUnpaidLeaveDays(
            leave.leave_type,
            overlapDays,
            casualLeaveBalance,
            sickLeaveBalance,
            casualLeaveLimit,
            sickLeaveLimit
          );

          casualLeaveTaken += leaveBreakdown.casualDays;
          sickLeaveTaken += leaveBreakdown.sickDays;
          unpaidLeaveDays += leaveBreakdown.unpaidDays;

          // Update balances for next iteration
          casualLeaveBalance -= leaveBreakdown.casualDays;
          sickLeaveBalance -= leaveBreakdown.sickDays;
        }
      });

      // Calculate deductions using working days utils
      const salaryCalculation = calculateMonthlySalaryDeductions(
        basicSalary,
        month,
        year,
        holidays,
        unpaidLeaveDays,
        lateDays,
        lateTolerance,
        true // Use actual working days
      );

      const dailyRate = salaryCalculation.dailyRate;
      const latePenaltyDays = Math.floor(lateDays / lateTolerance);
      const latePenalty = salaryCalculation.lateArrivalDeduction;
      const unpaidLeaveDeduction = salaryCalculation.unpaidLeaveDeduction;
      const halfDayDeduction = halfDays * (dailyRate / 2);
      const totalAbsentDays = workingDays - presentDays - halfDays - casualLeaveTaken - sickLeaveTaken - unpaidLeaveDays;
      const absentDeduction = totalAbsentDays > 0 ? totalAbsentDays * dailyRate : 0;

      // Base deductions (automated)
      const totalDeduction = latePenalty + unpaidLeaveDeduction + halfDayDeduction + absentDeduction;
      const netPayable = Math.max(0, basicSalary - totalDeduction);

      // Create payroll record
      const payrollRef = adminDb.collection('payroll').doc();
      batch.set(payrollRef, {
        employee_id: employeeId,
        month,
        year,
        basic_salary: basicSalary,
        festival_bonus: 0, // Can be manually added later
        loan_deduction: 0, // Can be manually added later
        lunch_subsidy: 0, // Can be manually added later
        ait: 0, // Can be manually added later
        total_present_days: presentDays,
        total_absent_days: totalAbsentDays,
        total_late_days: lateDays,
        total_half_days: halfDays,
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
