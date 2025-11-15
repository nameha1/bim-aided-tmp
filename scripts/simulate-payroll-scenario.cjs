require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

const db = admin.firestore();

async function simulatePayrollScenario() {
  try {
    console.log('\n📊 PAYROLL SIMULATION: Md. Karim Ahmed');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Scenario: Complex leave exhaustion and attendance tracking\n');

    const employeeId = 'emp-003';
    const employeeName = 'Md. Karim Ahmed';

    // Get employee data
    const empDoc = await db.collection('employees').doc(employeeId).get();
    if (!empDoc.exists) {
      console.log('Employee not found!');
      process.exit(1);
    }

    const empData = empDoc.data();
    const basicSalary = empData.salary || 45000;
    const dailyRate = basicSalary / 22; // Assuming 22 working days

    console.log('👤 Employee Information:');
    console.log(`   Name: ${employeeName}`);
    console.log(`   ID: ${employeeId}`);
    console.log(`   Basic Salary: BDT ${basicSalary.toLocaleString()}`);
    console.log(`   Daily Rate: BDT ${dailyRate.toFixed(2)}\n`);

    // STEP 1: Reset leave balances to 10/10
    console.log('STEP 1: Initialize Leave Balances (January 2025)');
    console.log('─────────────────────────────────────────────────');
    await db.collection('employees').doc(employeeId).update({
      casual_leave_remaining: 10,
      sick_leave_remaining: 10,
      unpaid_leave_days: 0
    });
    console.log('✓ Casual Leave: 10 days');
    console.log('✓ Sick Leave: 10 days');
    console.log('✓ Unpaid Leave: 0 days\n');

    // STEP 2: July - Use all 10 sick leave days
    console.log('STEP 2: July 2025 - Sick Leave (10 days)');
    console.log('─────────────────────────────────────────────────');
    
    const julyLeaveRef = await db.collection('leave_requests').add({
      employee_id: employeeId,
      leave_type: 'Sick Leave',
      start_date: '2025-07-06', // Sunday
      end_date: '2025-07-17', // Thursday (2 weeks excluding Fridays)
      days_requested: 10,
      effective_days: 10,
      reason: 'Medical treatment and recovery',
      status: 'approved',
      admin_approved: true,
      supervisor_approved: true,
      supervisor_id: 'BhXRb5PdZLELYk3DYAA2',
      approved_at: new Date('2025-07-05'),
      created_at: new Date('2025-07-03'),
      updated_at: new Date('2025-07-05'),
    });

    // Deduct sick leave
    await db.collection('employees').doc(employeeId).update({
      sick_leave_remaining: 0
    });

    console.log(`✓ Leave Request Created: ${julyLeaveRef.id}`);
    console.log('  Dates: July 6-17, 2025');
    console.log('  Working Days: 10 (excluding Fridays)');
    console.log('  Deduction: From sick leave balance');
    console.log('\n  Balance After:');
    console.log('  • Casual Leave: 10 days');
    console.log('  • Sick Leave: 0 days (exhausted)');
    console.log('  • Unpaid Leave: 0 days\n');

    // STEP 3: August - Use all 10 casual leave days + 6 late days
    console.log('STEP 3: August 2025 - Casual Leave (10 days) + Late Days (6)');
    console.log('─────────────────────────────────────────────────');
    
    const augustLeaveRef = await db.collection('leave_requests').add({
      employee_id: employeeId,
      leave_type: 'Casual Leave',
      start_date: '2025-08-03', // Sunday
      end_date: '2025-08-14', // Thursday (2 weeks)
      days_requested: 10,
      effective_days: 10,
      reason: 'Family vacation',
      status: 'approved',
      admin_approved: true,
      supervisor_approved: true,
      supervisor_id: 'BhXRb5PdZLELYk3DYAA2',
      approved_at: new Date('2025-08-01'),
      created_at: new Date('2025-07-30'),
      updated_at: new Date('2025-08-01'),
    });

    // Deduct casual leave
    await db.collection('employees').doc(employeeId).update({
      casual_leave_remaining: 0
    });

    console.log(`✓ Leave Request Created: ${augustLeaveRef.id}`);
    console.log('  Dates: August 3-14, 2025');
    console.log('  Working Days: 10 (excluding Fridays)');
    console.log('  Deduction: From casual leave balance');
    console.log('\n  Balance After:');
    console.log('  • Casual Leave: 0 days (exhausted)');
    console.log('  • Sick Leave: 0 days');
    console.log('  • Unpaid Leave: 0 days\n');

    // Create attendance records for August (6 late days)
    console.log('  Creating Attendance Records for August:');
    const augustLateDates = [
      '2025-08-17', // Sunday
      '2025-08-18', // Monday
      '2025-08-20', // Wednesday
      '2025-08-24', // Sunday
      '2025-08-25', // Monday
      '2025-08-27', // Wednesday
    ];

    const augustRegularDates = [
      '2025-08-19', '2025-08-21', '2025-08-26', '2025-08-28', '2025-08-31'
    ];

    for (const date of augustLateDates) {
      await db.collection('attendance').add({
        employee_id: employeeId,
        date: date,
        status: 'present',
        is_late: true,
        check_in_time: '09:15:00',
        check_out_time: '18:00:00',
        created_at: new Date(date),
      });
    }

    for (const date of augustRegularDates) {
      await db.collection('attendance').add({
        employee_id: employeeId,
        date: date,
        status: 'present',
        is_late: false,
        check_in_time: '08:45:00',
        check_out_time: '18:00:00',
        created_at: new Date(date),
      });
    }

    console.log(`  ✓ ${augustLateDates.length} late arrivals recorded`);
    console.log(`  ✓ ${augustRegularDates.length} on-time arrivals recorded\n`);

    // STEP 4: September - 6 half-day leaves (should be unpaid) + 1 late day
    console.log('STEP 4: September 2025 - Half-Day Leaves (6) + 1 Late Day');
    console.log('─────────────────────────────────────────────────');
    console.log('  Note: Both leave balances exhausted, so half-days will be UNPAID\n');

    // Create 6 separate half-day leave requests
    const septemberHalfDays = [
      { date: '2025-09-03', reason: 'Personal appointment' },
      { date: '2025-09-07', reason: 'Bank work' },
      { date: '2025-09-10', reason: 'Home repair' },
      { date: '2025-09-14', reason: 'Vehicle maintenance' },
      { date: '2025-09-17', reason: 'Medical checkup' },
      { date: '2025-09-21', reason: 'Family matter' },
    ];

    let totalUnpaidDays = 0;

    for (const halfDay of septemberHalfDays) {
      const leaveRef = await db.collection('leave_requests').add({
        employee_id: employeeId,
        leave_type: 'Half Day Leave',
        start_date: halfDay.date,
        end_date: halfDay.date,
        days_requested: 1, // 1 half day
        effective_days: 0.5, // Converts to 0.5 days
        reason: halfDay.reason,
        status: 'approved',
        admin_approved: true,
        supervisor_approved: true,
        supervisor_id: 'BhXRb5PdZLELYk3DYAA2',
        approved_at: new Date(halfDay.date),
        created_at: new Date(halfDay.date),
        updated_at: new Date(halfDay.date),
      });

      totalUnpaidDays += 0.5;
      console.log(`  ✓ Half-Day Leave: ${halfDay.date}`);
      console.log(`    ID: ${leaveRef.id}`);
      console.log(`    Effective: 0.5 days (UNPAID - balance exhausted)`);
    }

    // Update employee unpaid leave days
    await db.collection('employees').doc(employeeId).update({
      unpaid_leave_days: totalUnpaidDays
    });

    console.log(`\n  Total Unpaid Leave Days: ${totalUnpaidDays} days\n`);

    // Create attendance for September (1 late day)
    const septemberLateDate = '2025-09-24'; // Wednesday
    const septemberRegularDates = [
      '2025-09-01', '2025-09-04', '2025-09-08', '2025-09-11', '2025-09-15',
      '2025-09-18', '2025-09-22', '2025-09-25', '2025-09-28', '2025-09-29'
    ];

    await db.collection('attendance').add({
      employee_id: employeeId,
      date: septemberLateDate,
      status: 'present',
      is_late: true,
      check_in_time: '09:10:00',
      check_out_time: '18:00:00',
      created_at: new Date(septemberLateDate),
    });

    for (const date of septemberRegularDates) {
      await db.collection('attendance').add({
        employee_id: employeeId,
        date: date,
        status: 'present',
        is_late: false,
        check_in_time: '08:50:00',
        check_out_time: '18:00:00',
        created_at: new Date(date),
      });
    }

    console.log('  Attendance Records:');
    console.log('  ✓ 1 late arrival');
    console.log('  ✓ 10 on-time arrivals\n');

    console.log('  Final Balance After September:');
    console.log('  • Casual Leave: 0 days');
    console.log('  • Sick Leave: 0 days');
    console.log('  • Unpaid Leave: 3 days (6 half-days)\n');

    // STEP 5: Calculate Expected Payroll Deductions
    console.log('\nSTEP 5: Expected Payroll Calculations');
    console.log('═════════════════════════════════════════════════════════════\n');

    // July Payroll
    console.log('JULY 2025 Payroll:');
    console.log('─────────────────────────────────────────────────');
    console.log('• Sick Leave Taken: 10 days (PAID - from balance)');
    console.log('• Late Days: 0');
    console.log('• Half Days: 0');
    console.log('• Unpaid Leave: 0 days');
    console.log(`• Salary Deduction: BDT 0`);
    console.log(`• Net Payable: BDT ${basicSalary.toLocaleString()}\n`);

    // August Payroll
    console.log('AUGUST 2025 Payroll:');
    console.log('─────────────────────────────────────────────────');
    console.log('• Casual Leave Taken: 10 days (PAID - from balance)');
    console.log('• Late Days: 6 days');
    console.log('  - Late Tolerance: 3 days (no penalty)');
    console.log('  - Penalty Days: 6 ÷ 3 = 2 days');
    const augustLatePenalty = 2 * dailyRate;
    console.log(`  - Penalty Amount: BDT ${augustLatePenalty.toFixed(2)}`);
    console.log('• Half Days: 0');
    console.log('• Unpaid Leave: 0 days');
    console.log(`• Total Deduction: BDT ${augustLatePenalty.toFixed(2)}`);
    console.log(`• Net Payable: BDT ${(basicSalary - augustLatePenalty).toFixed(2)}\n`);

    // September Payroll
    console.log('SEPTEMBER 2025 Payroll:');
    console.log('─────────────────────────────────────────────────');
    console.log('• Casual Leave Taken: 0 days');
    console.log('• Sick Leave Taken: 0 days');
    console.log('• Half-Day Leaves: 6 (3 unpaid days)');
    console.log('  - Casual Balance: 0 (exhausted)');
    console.log('  - Sick Balance: 0 (exhausted)');
    console.log('  - Effective Unpaid: 6 × 0.5 = 3 days');
    const septemberHalfDayDeduction = 3 * dailyRate;
    console.log(`  - Deduction: BDT ${septemberHalfDayDeduction.toFixed(2)}`);
    console.log('• Late Days: 1 day (within tolerance)');
    console.log('  - Penalty Days: 0 (below 3-day threshold)');
    console.log('  - Penalty Amount: BDT 0');
    console.log(`• Total Deduction: BDT ${septemberHalfDayDeduction.toFixed(2)}`);
    console.log(`• Net Payable: BDT ${(basicSalary - septemberHalfDayDeduction).toFixed(2)}\n`);

    // Summary
    console.log('\nSTEP 6: Summary');
    console.log('═════════════════════════════════════════════════════════════\n');
    console.log('Year-to-Date Leave Usage:');
    console.log('─────────────────────────────────────────────────');
    console.log('✓ Sick Leave: 10/10 days used (July)');
    console.log('✓ Casual Leave: 10/10 days used (August)');
    console.log('✗ Unpaid Leave: 3 days (September - 6 half-days)');
    console.log('\nAttendance Summary:');
    console.log('─────────────────────────────────────────────────');
    console.log('• July: No attendance issues');
    console.log('• August: 6 late days → 2 penalty days');
    console.log('• September: 1 late day (no penalty)\n');

    console.log('Salary Impact:');
    console.log('─────────────────────────────────────────────────');
    console.log(`• July Net: BDT ${basicSalary.toLocaleString()}`);
    console.log(`• August Net: BDT ${(basicSalary - augustLatePenalty).toFixed(2)} (-${augustLatePenalty.toFixed(2)} late penalty)`);
    console.log(`• September Net: BDT ${(basicSalary - septemberHalfDayDeduction).toFixed(2)} (-${septemberHalfDayDeduction.toFixed(2)} unpaid half-days)`);
    console.log(`• Total YTD Deductions: BDT ${(augustLatePenalty + septemberHalfDayDeduction).toFixed(2)}\n`);

    console.log('✅ Simulation Complete!\n');
    console.log('Next Steps:');
    console.log('──────────────────────────────────────────────────');
    console.log('1. Generate payroll for each month to verify calculations');
    console.log('2. Check employee portal to see balance updates');
    console.log('3. Verify deduction breakdown in PayrollManager\n');

    console.log('Generate Payroll Commands:');
    console.log('──────────────────────────────────────────────────');
    console.log('Admin Panel → Payroll Manager → Select Month → Generate\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

simulatePayrollScenario();
