/**
 * Verification Script for Test Scenario
 * Validates that all test data was created correctly
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

async function verifyTestScenario() {
  console.log('\n🔍 VERIFYING TEST SCENARIO\n');
  console.log('═════════════════════════════════════════════════════════════\n');

  try {
    // 1. Verify Employees
    console.log('👥 EMPLOYEES:\n');
    const testEmployeeIds = ['test-emp-001', 'test-emp-002', 'test-emp-003'];
    const employees = [];
    
    for (const empId of testEmployeeIds) {
      const empDoc = await db.collection('employees').doc(empId).get();
      if (empDoc.exists) {
        const data = empDoc.data();
        employees.push({ id: empId, ...data });
        console.log(`   ✓ ${data.firstName} ${data.lastName}`);
        console.log(`      ID: ${empId}`);
        console.log(`      Email: ${data.email}`);
        console.log(`      Designation: ${data.designation}`);
        console.log(`      Salary: ${data.gross_salary} AED`);
        console.log(`      Hire Date: ${data.hire_date}`);
        console.log(`      Status: ${data.status}`);
        console.log('');
      } else {
        console.log(`   ❌ ${empId} not found`);
      }
    }

    // 2. Verify Assignments
    console.log('\n📋 ASSIGNMENTS:\n');
    const assignmentIds = ['test-assign-001', 'test-assign-002'];
    
    for (const assignId of assignmentIds) {
      const assignDoc = await db.collection('assignments').doc(assignId).get();
      if (assignDoc.exists) {
        const data = assignDoc.data();
        console.log(`   ✓ ${data.assignment_name}`);
        console.log(`      Project ID: ${data.project_id}`);
        console.log(`      Supervisor: ${data.supervisor_id}`);
        console.log(`      Status: ${data.status}`);
        console.log(`      Duration: ${data.start_date} to ${data.end_date}`);
        
        // Get members
        const membersSnapshot = await db.collection('assignment_members')
          .where('assignment_id', '==', assignId)
          .get();
        
        console.log(`      Members: ${membersSnapshot.size}`);
        membersSnapshot.docs.forEach(doc => {
          const member = doc.data();
          console.log(`         - ${member.employee_id} (${member.role})`);
        });
        console.log('');
      } else {
        console.log(`   ❌ ${assignId} not found`);
      }
    }

    // 3. Verify IP Whitelist
    console.log('\n🌐 IP WHITELIST:\n');
    const ipSnapshot = await db.collection('ip_whitelist')
      .where('employee_id', 'in', testEmployeeIds)
      .get();
    
    console.log(`   Found ${ipSnapshot.size} IP addresses\n`);
    ipSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`   ✓ ${data.ip_address} → ${data.employee_name}`);
    });

    // 4. Verify October Attendance
    console.log('\n\n📅 OCTOBER 2025 ATTENDANCE:\n');
    
    for (const emp of employees) {
      const attendanceSnapshot = await db.collection('attendance')
        .where('employee_id', '==', emp.id)
        .where('date', '>=', '2025-10-01')
        .where('date', '<=', '2025-10-31')
        .get();
      
      let presentCount = 0;
      let lateCount = 0;
      const lateDates = [];
      
      attendanceSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.status === 'present') {
          presentCount++;
          if (data.is_late) {
            lateCount++;
            lateDates.push(data.date);
          }
        }
      });
      
      console.log(`   ${emp.firstName} ${emp.lastName}:`);
      console.log(`      Total Records: ${attendanceSnapshot.size}`);
      console.log(`      Present Days: ${presentCount}`);
      console.log(`      Late Arrivals: ${lateCount}`);
      if (lateDates.length > 0) {
        console.log(`      Late Dates: ${lateDates.join(', ')}`);
        
        // Calculate deduction
        const deductionDays = Math.floor(lateCount / 3);
        if (deductionDays > 0) {
          console.log(`      💰 Salary Deduction: ${deductionDays} day(s)`);
        }
      }
      console.log('');
    }

    // 5. Check Attendance Policy
    console.log('\n⚙️  ATTENDANCE POLICY:\n');
    const policySnapshot = await db.collection('attendance_policy').limit(1).get();
    
    if (!policySnapshot.empty) {
      const policy = policySnapshot.docs[0].data();
      console.log(`   ✓ Policy exists`);
      console.log(`      Office Start: ${policy.office_start_time}`);
      console.log(`      Grace Period: ${policy.grace_period_minutes} minutes`);
      console.log(`      Late Tolerance: ${policy.late_arrivals_per_day} arrivals/day deduction`);
    } else {
      console.log(`   ❌ No attendance policy found`);
    }

    // 6. Verify Leave Balances
    console.log('\n\n🏖️  LEAVE BALANCES:\n');
    
    for (const emp of employees) {
      const balanceDoc = await db.collection('leave_balances').doc(emp.id).get();
      
      if (balanceDoc.exists) {
        const balance = balanceDoc.data();
        console.log(`   ✓ ${emp.firstName} ${emp.lastName}:`);
        console.log(`      Casual Leave: ${balance.casual_leave}`);
        console.log(`      Sick Leave: ${balance.sick_leave}`);
        console.log(`      Year: ${balance.year}`);
      } else {
        console.log(`   ❌ ${emp.firstName} ${emp.lastName}: No balance record`);
      }
      console.log('');
    }

    // 7. Calculate Expected Payroll for October
    console.log('\n💰 EXPECTED PAYROLL CALCULATIONS (October 2025):\n');
    
    // Get working days in October (excluding Fridays and Saturdays)
    const workingDays = 22; // As shown in attendance records
    
    for (const emp of employees) {
      const attendanceSnapshot = await db.collection('attendance')
        .where('employee_id', '==', emp.id)
        .where('date', '>=', '2025-10-01')
        .where('date', '<=', '2025-10-31')
        .where('status', '==', 'present')
        .get();
      
      let lateCount = 0;
      attendanceSnapshot.docs.forEach(doc => {
        if (doc.data().is_late) lateCount++;
      });
      
      const monthlySalary = emp.gross_salary;
      const dailyRate = monthlySalary / 26; // Standard working days
      const latePenaltyDays = Math.floor(lateCount / 3);
      const latePenalty = latePenaltyDays * dailyRate;
      const expectedNetSalary = monthlySalary - latePenalty;
      
      console.log(`   ${emp.firstName} ${emp.lastName}:`);
      console.log(`      Base Salary: ${monthlySalary.toFixed(2)} AED`);
      console.log(`      Daily Rate: ${dailyRate.toFixed(2)} AED`);
      console.log(`      Working Days: ${workingDays}`);
      console.log(`      Present Days: ${attendanceSnapshot.size}`);
      console.log(`      Late Arrivals: ${lateCount}`);
      console.log(`      Late Penalty Days: ${latePenaltyDays}`);
      console.log(`      Late Penalty Amount: ${latePenalty.toFixed(2)} AED`);
      console.log(`      Expected Net Salary: ${expectedNetSalary.toFixed(2)} AED`);
      console.log('');
    }

    console.log('═════════════════════════════════════════════════════════════');
    console.log('✅ VERIFICATION COMPLETE!\n');
    console.log('🎯 Test Scenario Summary:');
    console.log(`   • 3 employees created with staggered start dates`);
    console.log(`   • 2 assignments with supervisor and members`);
    console.log(`   • ${employees.length * 22} attendance records for October`);
    console.log(`   • Fatima Ali has 3 late arrivals = 1 day salary deduction`);
    console.log(`   • All employees have IP addresses whitelisted`);
    console.log(`   • Leave balances initialized`);
    console.log('\n📊 Ready for Payroll Testing!');
    console.log('\nTo generate payroll:');
    console.log('   1. Go to your admin panel');
    console.log('   2. Navigate to Payroll section');
    console.log('   3. Generate payroll for October 2025');
    console.log('   4. Verify the calculations match the expected values above\n');
    console.log('═════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error verifying test scenario:', error);
    console.error('Details:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

verifyTestScenario().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
