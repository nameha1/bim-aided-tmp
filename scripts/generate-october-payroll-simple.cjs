/**
 * Generate October 2025 Payroll (No Index Required)
 * Fetches all attendance and filters in memory
 */

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

const testEmployeeIds = ['test-emp-001', 'test-emp-002', 'test-emp-003'];

async function generateOctoberPayroll() {
  console.log('\n💰 GENERATING OCTOBER 2025 PAYROLL\n');
  console.log('═════════════════════════════════════════════════════════════\n');

  try {
    // Get attendance policy
    const policySnapshot = await db.collection('attendance_policy').limit(1).get();
    let policy = {
      office_start_time: '09:00',
      grace_period_minutes: 15,
      late_arrivals_per_day: 3,
      working_days_per_month: 26
    };
    
    if (!policySnapshot.empty) {
      policy = { ...policy, ...policySnapshot.docs[0].data() };
    }

    console.log('📋 Policy Configuration:');
    console.log(`   Working Days per Month: ${policy.working_days_per_month}`);
    console.log(`   Late Tolerance: ${policy.late_arrivals_per_day} arrivals = 1 day deduction\n`);

    // Fetch ALL attendance records (no index needed)
    console.log('📅 Fetching attendance records...');
    const allAttendanceSnapshot = await db.collection('attendance').get();
    console.log(`   Found ${allAttendanceSnapshot.size} total attendance records\n`);

    // Filter for October 2025 for our test employees
    const octoberAttendance = {};
    
    allAttendanceSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.date && data.date.startsWith('2025-10') && testEmployeeIds.includes(data.employee_id)) {
        if (!octoberAttendance[data.employee_id]) {
          octoberAttendance[data.employee_id] = [];
        }
        octoberAttendance[data.employee_id].push(data);
      }
    });

    // Delete existing October 2025 payroll for test employees
    const existingPayroll = await db.collection('payroll').get();
    const deletePromises = [];
    
    existingPayroll.docs.forEach(doc => {
      const data = doc.data();
      if (testEmployeeIds.includes(data.employee_id) && data.month === 10 && data.year === 2025) {
        deletePromises.push(doc.ref.delete());
      }
    });

    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
      console.log(`🗑️  Deleted ${deletePromises.length} existing payroll records\n`);
    }

    // Process each employee
    console.log('👥 Processing Employees:\n');

    for (const empId of testEmployeeIds) {
      // Get employee
      const empDoc = await db.collection('employees').doc(empId).get();
      if (!empDoc.exists) {
        console.log(`   ❌ Employee ${empId} not found`);
        continue;
      }

      const employee = empDoc.data();
      const baseSalary = employee.gross_salary || employee.salary || 0;
      const dailyRate = baseSalary / policy.working_days_per_month;

      console.log(`   ${employee.firstName} ${employee.lastName}:`);
      console.log(`      Base Salary: ${baseSalary.toLocaleString()} BDT`);
      console.log(`      Daily Rate: ${dailyRate.toFixed(2)} BDT`);

      // Get October attendance for this employee
      const attendanceRecords = octoberAttendance[empId] || [];
      console.log(`      Attendance Records: ${attendanceRecords.length}`);

      let presentDays = 0;
      let lateDays = 0;
      let absentDays = 0;
      let casualLeaveDays = 0;
      let sickLeaveDays = 0;
      let unpaidLeaveDays = 0;

      attendanceRecords.forEach(record => {
        if (record.status === 'present') {
          presentDays++;
          if (record.is_late) {
            lateDays++;
          }
        } else if (record.status === 'absent') {
          absentDays++;
        } else if (record.status === 'casual_leave') {
          casualLeaveDays++;
        } else if (record.status === 'sick_leave') {
          sickLeaveDays++;
        } else if (record.status === 'unpaid_leave') {
          unpaidLeaveDays++;
        }
      });

      console.log(`      Present Days: ${presentDays}`);
      console.log(`      Late Arrivals: ${lateDays}`);
      console.log(`      Absent Days: ${absentDays}`);
      console.log(`      Casual Leave: ${casualLeaveDays}`);
      console.log(`      Sick Leave: ${sickLeaveDays}`);
      console.log(`      Unpaid Leave: ${unpaidLeaveDays}`);

      // Calculate deductions
      const latePenaltyDays = Math.floor(lateDays / policy.late_arrivals_per_day);
      const latePenalty = latePenaltyDays * dailyRate;
      const absentDeduction = absentDays * dailyRate;
      const unpaidLeaveDeduction = unpaidLeaveDays * dailyRate;
      const totalDeduction = latePenalty + absentDeduction + unpaidLeaveDeduction;
      const netPayable = baseSalary - totalDeduction;

      console.log(`      Late Penalty: ${latePenaltyDays} day(s) × ${dailyRate.toFixed(2)} = ${latePenalty.toFixed(2)} BDT`);
      console.log(`      Absent Deduction: ${absentDays} day(s) × ${dailyRate.toFixed(2)} = ${absentDeduction.toFixed(2)} BDT`);
      console.log(`      Unpaid Leave Deduction: ${unpaidLeaveDays} day(s) × ${dailyRate.toFixed(2)} = ${unpaidLeaveDeduction.toFixed(2)} BDT`);
      console.log(`      Total Deduction: ${totalDeduction.toFixed(2)} BDT`);
      console.log(`      Net Payable: ${netPayable.toFixed(2)} BDT`);

      // Create payroll record
      const payrollData = {
        employee_id: empId,
        month: 10,
        year: 2025,
        basic_salary: Math.round(baseSalary),
        festival_bonus: 0,
        loan_deduction: 0,
        lunch_subsidy: 0,
        ait: 0,
        total_present_days: presentDays,
        total_absent_days: absentDays,
        total_late_days: lateDays,
        casual_leave_taken: casualLeaveDays,
        sick_leave_taken: sickLeaveDays,
        unpaid_leave_days: unpaidLeaveDays,
        late_penalty_days: latePenaltyDays,
        late_penalty: Math.round(latePenalty),
        unpaid_leave_deduction: Math.round(unpaidLeaveDeduction),
        half_day_deduction: 0,
        absent_deduction: Math.round(absentDeduction),
        total_deduction: Math.round(totalDeduction),
        net_payable_salary: Math.round(netPayable),
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await db.collection('payroll').add(payrollData);
      console.log(`      ✅ Payroll record created\n`);
    }

    console.log('═════════════════════════════════════════════════════════════');
    console.log('✅ PAYROLL GENERATION COMPLETE!\n');
    console.log('🎯 Expected Results:');
    console.log('   • Ahmed Hassan: 60,000 BDT (no deductions)');
    console.log('   • Fatima Ali: ~43,269 BDT (1,731 BDT deduction for 3 late arrivals)');
    console.log('   • Omar Khan: 42,000 BDT (no deductions)\n');
    console.log('📊 Next Steps:');
    console.log('   1. Refresh your admin panel (F5)');
    console.log('   2. Ensure month is set to October 2025');
    console.log('   3. Review the payroll records');
    console.log('   4. Verify calculations match expectations');
    console.log('   5. Approve or edit as needed\n');
    console.log('═════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error generating payroll:', error);
    console.error('Details:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }

  process.exit(0);
}

generateOctoberPayroll().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
