/**
 * Comprehensive Test Data Script
 * Creates realistic test scenario for payroll testing:
 * - 3 employees with different start dates
 * - 2 assignments with supervisor and members
 * - October attendance with specific late arrival scenarios
 * - IP address registration
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

const db = admin.firestore();
const auth = admin.auth();

// Test employee data
const testEmployees = [
  {
    id: 'test-emp-001',
    eid: 'BIM2501',
    firstName: 'Ahmed',
    lastName: 'Hassan',
    email: 'ahmed.hassan@bimaided.com',
    phone: '+971501111001',
    department: 'BIM Services',
    designation: 'BIM Coordinator',
    hire_date: '2025-06-01', // Started June 1
    gross_salary: 60000,
    status: 'active',
    password: 'Test@123456',
    role: 'supervisor', // Will be supervisor for assignments
    ip_address: '192.168.1.101'
  },
  {
    id: 'test-emp-002',
    eid: 'BIM2502',
    firstName: 'Fatima',
    lastName: 'Ali',
    email: 'fatima.ali@bimaided.com',
    phone: '+971501111002',
    department: 'BIM Services',
    designation: 'BIM Modeler',
    hire_date: '2025-07-01', // Started July 1
    gross_salary: 45000,
    status: 'active',
    password: 'Test@123456',
    role: 'employee',
    ip_address: '192.168.1.102'
  },
  {
    id: 'test-emp-003',
    eid: 'BIM2503',
    firstName: 'Omar',
    lastName: 'Khan',
    email: 'omar.khan@bimaided.com',
    phone: '+971501111003',
    department: 'BIM Services',
    designation: 'BIM Modeler',
    hire_date: '2025-08-01', // Started August 1
    gross_salary: 42000,
    status: 'active',
    password: 'Test@123456',
    role: 'employee',
    ip_address: '192.168.1.103'
  }
];

// Assignment data
const testAssignments = [
  {
    id: 'test-assign-001',
    project_id: 'proj-001',
    assignment_name: 'Dubai Marina Tower - BIM Modeling',
    description: 'Complete BIM modeling for residential tower',
    start_date: '2025-09-01',
    end_date: '2025-12-31',
    status: 'in_progress',
    supervisor_id: 'test-emp-001',
    members: ['test-emp-002', 'test-emp-003']
  },
  {
    id: 'test-assign-002',
    project_id: 'proj-002',
    assignment_name: 'Abu Dhabi Cultural Center - MEP Coordination',
    description: 'MEP coordination and clash detection',
    start_date: '2025-09-15',
    end_date: '2025-11-30',
    status: 'in_progress',
    supervisor_id: 'test-emp-001',
    members: ['test-emp-002']
  }
];

// October 2025 holidays (Fridays)
const octoberHolidays = [3, 10, 17, 24, 31]; // Fridays in October 2025

async function createComprehensiveTestData() {
  console.log('\n🚀 Creating Comprehensive Test Data for Payroll Testing\n');
  console.log('═════════════════════════════════════════════════════════════\n');

  try {
    // Step 1: Create employees with auth accounts
    console.log('👥 STEP 1: Creating Test Employees\n');
    const createdEmployees = [];
    
    for (const emp of testEmployees) {
      console.log(`   Creating: ${emp.firstName} ${emp.lastName}`);
      
      // Create Firebase Auth user
      let authUser;
      try {
        authUser = await auth.getUserByEmail(emp.email);
        console.log(`   ⏭️  Auth user already exists: ${authUser.uid}`);
        
        // Update password if needed
        await auth.updateUser(authUser.uid, { password: emp.password });
      } catch (error) {
        authUser = await auth.createUser({
          email: emp.email,
          password: emp.password,
          displayName: `${emp.firstName} ${emp.lastName}`,
          emailVerified: true
        });
        console.log(`   ✓ Created auth user: ${authUser.uid}`);
      }

      // Create/update employee document
      const { id, password, ip_address, role, ...employeeData } = emp;
      const employeeRef = db.collection('employees').doc(id);
      
      await employeeRef.set({
        ...employeeData,
        auth_uid: authUser.uid,
        supervisor_id: role === 'supervisor' ? null : testEmployees[0].id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { merge: true });
      
      console.log(`   ✓ Created employee record: ${id}`);

      // Set user role
      const roleRef = db.collection('user_roles').doc(authUser.uid);
      await roleRef.set({
        role: role === 'supervisor' ? 'employee' : 'employee',
        email: emp.email,
        employee_id: id,
        created_at: new Date().toISOString()
      }, { merge: true });
      
      console.log(`   ✓ Set user role: ${role}`);

      // Whitelist IP address
      const ipRef = db.collection('ip_whitelist').doc();
      await ipRef.set({
        ip_address: ip_address,
        employee_id: id,
        employee_name: `${emp.firstName} ${emp.lastName}`,
        description: `Test IP for ${emp.firstName}`,
        status: 'active',
        created_at: new Date().toISOString()
      });
      
      console.log(`   ✓ Whitelisted IP: ${ip_address}`);
      
      createdEmployees.push({ ...emp, auth_uid: authUser.uid });
      console.log(`   ✅ ${emp.firstName} ${emp.lastName} - Complete\n`);
    }

    // Step 2: Create assignments
    console.log('\n📋 STEP 2: Creating Test Assignments\n');
    
    for (const assignment of testAssignments) {
      const { id, members, ...assignmentData } = assignment;
      
      // Create assignment document
      const assignmentRef = db.collection('assignments').doc(id);
      await assignmentRef.set({
        ...assignmentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { merge: true });
      
      console.log(`   ✓ Created assignment: ${assignment.assignment_name}`);

      // Create assignment member records
      for (const memberId of members) {
        const memberRef = db.collection('assignment_members').doc();
        await memberRef.set({
          assignment_id: id,
          employee_id: memberId,
          role: memberId === assignment.supervisor_id ? 'supervisor' : 'member',
          joined_at: new Date().toISOString(),
          status: 'active'
        });
      }
      
      // Add supervisor as member too
      const supervisorRef = db.collection('assignment_members').doc();
      await supervisorRef.set({
        assignment_id: id,
        employee_id: assignment.supervisor_id,
        role: 'supervisor',
        joined_at: new Date().toISOString(),
        status: 'active'
      });
      
      console.log(`   ✓ Added ${members.length + 1} members (including supervisor)\n`);
    }

    // Step 3: Create October attendance with specific scenarios
    console.log('\n📅 STEP 3: Creating October 2025 Attendance Records\n');
    console.log('   Scenario:');
    console.log('   - Employee 1 (Ahmed): All days present, on time');
    console.log('   - Employee 2 (Fatima): All days present, 3 late arrivals (1 day deduction)');
    console.log('   - Employee 3 (Omar): All days present, on time\n');

    // Get attendance policy
    const policySnapshot = await db.collection('attendance_policy').limit(1).get();
    let policy = {
      office_start_time: '09:00',
      grace_period_minutes: 15,
      late_arrivals_per_day: 3
    };
    
    if (!policySnapshot.empty) {
      policy = policySnapshot.docs[0].data();
      console.log(`   ✓ Using existing attendance policy`);
    } else {
      // Create default policy
      await db.collection('attendance_policy').add({
        ...policy,
        office_end_time: '18:00',
        created_at: new Date().toISOString()
      });
      console.log(`   ✓ Created default attendance policy`);
    }
    
    console.log(`   Policy: Start ${policy.office_start_time}, Grace ${policy.grace_period_minutes} min, Late tolerance ${policy.late_arrivals_per_day}\n`);

    // Delete existing October attendance
    const existingAttendance = await db.collection('attendance')
      .where('date', '>=', '2025-10-01')
      .where('date', '<=', '2025-10-31')
      .get();
    
    if (!existingAttendance.empty) {
      console.log(`   🗑️  Deleting ${existingAttendance.size} existing October records...`);
      const batch = db.batch();
      existingAttendance.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`   ✓ Deleted\n`);
    }

    // Generate October 2025 attendance (all working days)
    const attendanceStats = {};
    
    for (const emp of createdEmployees) {
      attendanceStats[emp.id] = {
        name: `${emp.firstName} ${emp.lastName}`,
        present: 0,
        late: 0,
        onTime: 0
      };
    }

    // Determine which days Fatima should be late (days 5, 10, 15 of working days)
    const fatimaLateDays = [5, 10, 15]; // These will be the 5th, 10th, and 15th working days
    let workingDayCounter = 0;

    for (let day = 1; day <= 31; day++) {
      const date = new Date(2025, 9, day); // October is month 9 (0-indexed)
      const dayOfWeek = date.getDay();
      
      // Skip Fridays (5) and Saturdays (6)
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        continue;
      }

      // Skip holidays
      if (octoberHolidays.includes(day)) {
        continue;
      }

      workingDayCounter++;
      const dateStr = `2025-10-${String(day).padStart(2, '0')}`;

      for (const emp of createdEmployees) {
        let checkInTime, checkOutTime, isLate = false;
        
        // Determine if this employee should be late today
        if (emp.id === 'test-emp-002' && fatimaLateDays.includes(workingDayCounter)) {
          // Fatima arrives late (9:20 AM - after grace period of 9:15)
          checkInTime = new Date(2025, 9, day, 9, 20, 0);
          isLate = true;
          attendanceStats[emp.id].late++;
        } else {
          // On time arrival (between 8:50 and 9:10)
          const randomMinute = Math.floor(Math.random() * 20) + 50; // 50-69 minutes
          const hour = randomMinute >= 60 ? 9 : 8;
          const minute = randomMinute >= 60 ? randomMinute - 60 : randomMinute;
          checkInTime = new Date(2025, 9, day, hour, minute, 0);
          attendanceStats[emp.id].onTime++;
        }

        // Check-out time (between 6:00 and 7:00 PM)
        const checkOutHour = 18;
        const checkOutMinute = Math.floor(Math.random() * 60);
        checkOutTime = new Date(2025, 9, day, checkOutHour, checkOutMinute, 0);

        // Calculate work hours
        const workHours = ((checkOutTime - checkInTime) / (1000 * 60 * 60)).toFixed(2);

        // Create attendance record
        await db.collection('attendance').add({
          employee_id: emp.id,
          date: dateStr,
          check_in_time: checkInTime.toISOString(),
          check_out_time: checkOutTime.toISOString(),
          check_in_ip: emp.ip_address,
          check_out_ip: emp.ip_address,
          status: 'present',
          is_late: isLate,
          late_by_minutes: isLate ? 5 : 0,
          work_hours: parseFloat(workHours),
          notes: isLate ? `Late arrival - checked in at ${checkInTime.toTimeString().slice(0, 5)}` : '',
          created_at: new Date().toISOString()
        });

        attendanceStats[emp.id].present++;
      }
    }

    console.log('   📊 Attendance Summary:\n');
    for (const [empId, stats] of Object.entries(attendanceStats)) {
      console.log(`   ${stats.name}:`);
      console.log(`      Present: ${stats.present} days`);
      console.log(`      On Time: ${stats.onTime} days`);
      console.log(`      Late: ${stats.late} days`);
      if (stats.late >= policy.late_arrivals_per_day) {
        const deductionDays = Math.floor(stats.late / policy.late_arrivals_per_day);
        console.log(`      ⚠️  Salary Deduction: ${deductionDays} day(s)`);
      }
      console.log('');
    }

    // Step 4: Initialize leave balances
    console.log('\n🏖️  STEP 4: Initializing Leave Balances\n');
    
    for (const emp of createdEmployees) {
      const leaveBalanceRef = db.collection('leave_balances').doc(emp.id);
      await leaveBalanceRef.set({
        employee_id: emp.id,
        casual_leave: 10,
        sick_leave: 10,
        annual_leave: 0,
        unpaid_leave: 0,
        year: 2025,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { merge: true });
      
      console.log(`   ✓ ${emp.firstName} ${emp.lastName}: 10 casual, 10 sick leave`);
    }

    // Summary
    console.log('\n\n═════════════════════════════════════════════════════════════');
    console.log('✅ TEST DATA CREATION COMPLETE!\n');
    console.log('📋 Created Resources:');
    console.log(`   • Employees: ${testEmployees.length}`);
    console.log(`   • Assignments: ${testAssignments.length}`);
    console.log(`   • Attendance Records: ${Object.values(attendanceStats).reduce((sum, s) => sum + s.present, 0)}`);
    console.log(`   • IP Addresses Whitelisted: ${testEmployees.length}`);
    console.log('\n👤 Test Employee Credentials:');
    testEmployees.forEach(emp => {
      console.log(`   ${emp.firstName} ${emp.lastName}:`);
      console.log(`      Email: ${emp.email}`);
      console.log(`      Password: ${emp.password}`);
      console.log(`      Role: ${emp.role}`);
      console.log(`      IP: ${emp.ip_address}`);
      console.log(`      Started: ${emp.hire_date}`);
      console.log('');
    });
    
    console.log('🎯 Next Steps:');
    console.log('   1. Login with any employee credentials above');
    console.log('   2. Navigate to Admin → Payroll');
    console.log('   3. Generate payroll for October 2025');
    console.log('   4. Verify calculations:');
    console.log('      - Ahmed: No deductions (all on time)');
    console.log('      - Fatima: 1 day salary deduction (3 late arrivals)');
    console.log('      - Omar: No deductions (all on time)');
    console.log('   5. Check assignment teams under supervisor view');
    console.log('   6. Test IP-based attendance check-in/out\n');
    console.log('═════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error creating test data:', error);
    console.error('Details:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }

  process.exit(0);
}

// Run the script
createComprehensiveTestData().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
