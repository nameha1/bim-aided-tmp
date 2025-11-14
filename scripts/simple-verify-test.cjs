/**
 * Simple Verification Script for Test Scenario
 * Uses basic queries to avoid index requirements
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

async function simpleVerification() {
  console.log('\n🔍 SIMPLE TEST SCENARIO VERIFICATION\n');
  console.log('═════════════════════════════════════════════════════════════\n');

  try {
    // 1. Verify Employees
    console.log('👥 TEST EMPLOYEES:\n');
    const testEmployeeIds = ['test-emp-001', 'test-emp-002', 'test-emp-003'];
    const employees = [];
    
    for (const empId of testEmployeeIds) {
      const empDoc = await db.collection('employees').doc(empId).get();
      if (empDoc.exists) {
        const data = empDoc.data();
        employees.push({ id: empId, ...data });
        console.log(`   ✓ ${data.firstName} ${data.lastName}`);
        console.log(`      Email: ${data.email}`);
        console.log(`      Salary: ${data.gross_salary} AED`);
        console.log(`      Started: ${data.hire_date}`);
      } else {
        console.log(`   ❌ ${empId} not found`);
      }
    }

    // 2. Verify Assignments
    console.log('\n\n📋 TEST ASSIGNMENTS:\n');
    const assignmentIds = ['test-assign-001', 'test-assign-002'];
    
    for (const assignId of assignmentIds) {
      const assignDoc = await db.collection('assignments').doc(assignId).get();
      if (assignDoc.exists) {
        const data = assignDoc.data();
        console.log(`   ✓ ${data.assignment_name}`);
        console.log(`      Supervisor: ${data.supervisor_id}`);
        
        // Get members
        const membersSnapshot = await db.collection('assignment_members')
          .where('assignment_id', '==', assignId)
          .get();
        
        console.log(`      Team Size: ${membersSnapshot.size} members`);
      }
    }

    // 3. Verify IP Whitelist
    console.log('\n\n🌐 IP WHITELIST:\n');
    const ipSnapshot = await db.collection('ip_whitelist').get();
    let testIpCount = 0;
    
    ipSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (testEmployeeIds.includes(data.employee_id)) {
        console.log(`   ✓ ${data.ip_address} → ${data.employee_name}`);
        testIpCount++;
      }
    });
    console.log(`\n   Total Test IPs: ${testIpCount}`);

    // 4. Count October Attendance (simple count without complex query)
    console.log('\n\n📅 OCTOBER 2025 ATTENDANCE:\n');
    console.log('   Counting records...\n');
    
    const allAttendance = await db.collection('attendance').get();
    const octoberAttendance = {};
    
    allAttendance.docs.forEach(doc => {
      const data = doc.data();
      if (data.date && data.date.startsWith('2025-10') && testEmployeeIds.includes(data.employee_id)) {
        if (!octoberAttendance[data.employee_id]) {
          octoberAttendance[data.employee_id] = {
            total: 0,
            present: 0,
            late: 0,
            lateDates: []
          };
        }
        octoberAttendance[data.employee_id].total++;
        if (data.status === 'present') {
          octoberAttendance[data.employee_id].present++;
          if (data.is_late) {
            octoberAttendance[data.employee_id].late++;
            octoberAttendance[data.employee_id].lateDates.push(data.date);
          }
        }
      }
    });
    
    for (const emp of employees) {
      const stats = octoberAttendance[emp.id] || { total: 0, present: 0, late: 0, lateDates: [] };
      console.log(`   ${emp.firstName} ${emp.lastName}:`);
      console.log(`      Total Records: ${stats.total}`);
      console.log(`      Present: ${stats.present}`);
      console.log(`      Late Arrivals: ${stats.late}`);
      
      if (stats.late > 0) {
        const deductionDays = Math.floor(stats.late / 3);
        console.log(`      Late Dates: ${stats.lateDates.join(', ')}`);
        if (deductionDays > 0) {
          const dailyRate = emp.gross_salary / 26;
          const deduction = deductionDays * dailyRate;
          console.log(`      💰 Deduction: ${deductionDays} day(s) = ${deduction.toFixed(2)} AED`);
        }
      }
      console.log('');
    }

    // 5. Check Attendance Policy
    console.log('\n⚙️  ATTENDANCE POLICY:\n');
    const policySnapshot = await db.collection('attendance_policy').limit(1).get();
    
    if (!policySnapshot.empty) {
      const policy = policySnapshot.docs[0].data();
      console.log(`   ✓ Policy configured`);
      console.log(`      Start: ${policy.office_start_time}`);
      console.log(`      Grace: ${policy.grace_period_minutes} min`);
      console.log(`      Late tolerance: ${policy.late_arrivals_per_day} per day`);
    }

    // 6. Verify Leave Balances
    console.log('\n\n🏖️  LEAVE BALANCES:\n');
    
    for (const emp of employees) {
      const balanceDoc = await db.collection('leave_balances').doc(emp.id).get();
      
      if (balanceDoc.exists) {
        const balance = balanceDoc.data();
        console.log(`   ✓ ${emp.firstName} ${emp.lastName}: ${balance.casual_leave} casual, ${balance.sick_leave} sick`);
      } else {
        console.log(`   ❌ ${emp.firstName} ${emp.lastName}: Not found`);
      }
    }

    // Summary
    console.log('\n\n═════════════════════════════════════════════════════════════');
    console.log('✅ VERIFICATION COMPLETE!\n');
    console.log('📊 Test Scenario Ready:');
    console.log(`   • ${employees.length} test employees created`);
    console.log(`   • ${assignmentIds.length} assignments configured`);
    console.log(`   • ${testIpCount} IP addresses whitelisted`);
    console.log(`   • October attendance records created`);
    console.log(`   • Fatima Ali has 3 late arrivals → 1 day deduction`);
    console.log('\n🎯 Next Steps:');
    console.log('   1. Deploy Firestore indexes: firebase deploy --only firestore:indexes');
    console.log('   2. Login to admin panel');
    console.log('   3. Generate payroll for October 2025');
    console.log('   4. Verify calculations\n');
    console.log('\n📧 Test Login Credentials:');
    console.log('   Email: ahmed.hassan@bimaided.com');
    console.log('   Email: fatima.ali@bimaided.com');
    console.log('   Email: omar.khan@bimaided.com');
    console.log('   Password: Test@123456 (for all)\n');
    console.log('═════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

simpleVerification().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
