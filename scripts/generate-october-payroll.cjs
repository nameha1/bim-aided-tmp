/**
 * Generate October 2025 Payroll
 * Creates payroll records with attendance-based calculations
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

    // Delete existing October 2025 payroll for test employees
    const existingPayroll = await db.collection('payroll')
      .where('month', '==', 10)
      .where('year', '==', 2025)
      .get();
    
    const deletePromises = [];
    existingPayroll.docs.forEach(doc => {
      const data = doc.data();
      if (testEmployeeIds.includes(data.employee_id)) {
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

      // Get October attendance
      const attendanceSnapshot = await db.collection('attendance')
        .where('employee_id', '==', empId)
        .where('date', '>=', '2025-10-01')
        .where('date', '<=', '2025-10-31')
        .get();

      let presentDays = 0;
      let lateDays = 0;
      let absentDays = 0;

      attendanceSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.status === 'present') {
          presentDays++;
          if (data.is_late) {
            lateDays++;
          }
        } else if (data.status === 'absent') {
          absentDays++;
        }
      });

      console.log(`      Present Days: ${presentDays}`);
      console.log(`      Late Arrivals: ${lateDays}`);
      console.log(`      Absent Days: ${absentDays}`);

      // Calculate deductions
      const latePenaltyDays = Math.floor(lateDays / policy.late_arrivals_per_day);
      const latePenalty = latePenaltyDays * dailyRate;
      const absentDeduction = absentDays * dailyRate;
      const totalDeduction = latePenalty + absentDeduction;
      const netPayable = baseSalary - totalDeduction;

      console.log(`      Late Penalty: ${latePenaltyDays} day(s) × ${dailyRate.toFixed(2)} = ${latePenalty.toFixed(2)} BDT`);
      console.log(`      Absent Deduction: ${absentDays} day(s) × ${dailyRate.toFixed(2)} = ${absentDeduction.toFixed(2)} BDT`);
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
        casual_leave_taken: 0,
        sick_leave_taken: 0,
        unpaid_leave_days: 0,
        late_penalty_days: latePenaltyDays,
        late_penalty: Math.round(latePenalty),
        unpaid_leave_deduction: 0,
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
    console.log('🎯 Next Steps:');
    console.log('   1. Refresh your admin panel');
    console.log('   2. Change month to October 2025');
    console.log('   3. Review the payroll records');
    console.log('   4. Verify Fatima Ali has 1 day salary deduction');
    console.log('   5. Approve or edit as needed\n');
    console.log('═════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error generating payroll:', error);
    console.error('Details:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

generateOctoberPayroll().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
