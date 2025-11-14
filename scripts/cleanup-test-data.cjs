/**
 * Cleanup Test Data Script
 * Removes all test data created for payroll testing
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
const readline = require('readline');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

const db = admin.firestore();
const auth = admin.auth();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

const testEmployeeIds = ['test-emp-001', 'test-emp-002', 'test-emp-003'];
const testAssignmentIds = ['test-assign-001', 'test-assign-002'];

async function cleanupTestData() {
  console.log('\n🗑️  CLEANUP TEST DATA\n');
  console.log('═════════════════════════════════════════════════════════════\n');
  console.log('⚠️  WARNING: This will permanently delete:\n');
  console.log('   • 3 test employees and their auth accounts');
  console.log('   • 2 test assignments and member records');
  console.log('   • All October 2025 attendance for test employees');
  console.log('   • IP whitelist entries for test employees');
  console.log('   • Leave balances for test employees');
  console.log('   • Any payroll records for test employees\n');

  const answer = await question('Are you sure you want to continue? (yes/no): ');
  
  if (answer.toLowerCase() !== 'yes') {
    console.log('\n❌ Cleanup cancelled.\n');
    rl.close();
    process.exit(0);
  }

  console.log('\n🚀 Starting cleanup...\n');

  try {
    let totalDeleted = 0;

    // 1. Delete attendance records
    console.log('📅 Deleting attendance records...');
    const attendanceSnapshot = await db.collection('attendance').get();
    const attendanceBatch = db.batch();
    let attendanceCount = 0;
    
    attendanceSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (testEmployeeIds.includes(data.employee_id) && data.date?.startsWith('2025-10')) {
        attendanceBatch.delete(doc.ref);
        attendanceCount++;
      }
    });
    
    if (attendanceCount > 0) {
      await attendanceBatch.commit();
      console.log(`   ✓ Deleted ${attendanceCount} attendance records\n`);
      totalDeleted += attendanceCount;
    } else {
      console.log(`   • No attendance records to delete\n`);
    }

    // 2. Delete assignment members
    console.log('👥 Deleting assignment members...');
    const memberSnapshot = await db.collection('assignment_members').get();
    const memberBatch = db.batch();
    let memberCount = 0;
    
    memberSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (testAssignmentIds.includes(data.assignment_id) || testEmployeeIds.includes(data.employee_id)) {
        memberBatch.delete(doc.ref);
        memberCount++;
      }
    });
    
    if (memberCount > 0) {
      await memberBatch.commit();
      console.log(`   ✓ Deleted ${memberCount} assignment member records\n`);
      totalDeleted += memberCount;
    } else {
      console.log(`   • No assignment members to delete\n`);
    }

    // 3. Delete assignments
    console.log('📋 Deleting assignments...');
    for (const assignId of testAssignmentIds) {
      const assignRef = db.collection('assignments').doc(assignId);
      const assignDoc = await assignRef.get();
      
      if (assignDoc.exists) {
        await assignRef.delete();
        console.log(`   ✓ Deleted assignment: ${assignId}`);
        totalDeleted++;
      }
    }
    console.log('');

    // 4. Delete IP whitelist entries
    console.log('🌐 Deleting IP whitelist entries...');
    const ipSnapshot = await db.collection('ip_whitelist').get();
    const ipBatch = db.batch();
    let ipCount = 0;
    
    ipSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (testEmployeeIds.includes(data.employee_id)) {
        ipBatch.delete(doc.ref);
        ipCount++;
      }
    });
    
    if (ipCount > 0) {
      await ipBatch.commit();
      console.log(`   ✓ Deleted ${ipCount} IP whitelist entries\n`);
      totalDeleted += ipCount;
    } else {
      console.log(`   • No IP entries to delete\n`);
    }

    // 5. Delete leave balances
    console.log('🏖️  Deleting leave balances...');
    for (const empId of testEmployeeIds) {
      const balanceRef = db.collection('leave_balances').doc(empId);
      const balanceDoc = await balanceRef.get();
      
      if (balanceDoc.exists) {
        await balanceRef.delete();
        console.log(`   ✓ Deleted leave balance: ${empId}`);
        totalDeleted++;
      }
    }
    console.log('');

    // 6. Delete payroll records
    console.log('💰 Deleting payroll records...');
    const payrollSnapshot = await db.collection('payroll').get();
    const payrollBatch = db.batch();
    let payrollCount = 0;
    
    payrollSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (testEmployeeIds.includes(data.employee_id)) {
        payrollBatch.delete(doc.ref);
        payrollCount++;
      }
    });
    
    if (payrollCount > 0) {
      await payrollBatch.commit();
      console.log(`   ✓ Deleted ${payrollCount} payroll records\n`);
      totalDeleted += payrollCount;
    } else {
      console.log(`   • No payroll records to delete\n`);
    }

    // 7. Delete user roles
    console.log('🔐 Deleting user roles...');
    const rolesSnapshot = await db.collection('user_roles').get();
    const rolesBatch = db.batch();
    let rolesCount = 0;
    
    rolesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (testEmployeeIds.includes(data.employee_id)) {
        rolesBatch.delete(doc.ref);
        rolesCount++;
      }
    });
    
    if (rolesCount > 0) {
      await rolesBatch.commit();
      console.log(`   ✓ Deleted ${rolesCount} user role records\n`);
      totalDeleted += rolesCount;
    } else {
      console.log(`   • No user roles to delete\n`);
    }

    // 8. Delete employee records and auth users
    console.log('👤 Deleting employees and auth users...');
    for (const empId of testEmployeeIds) {
      const empRef = db.collection('employees').doc(empId);
      const empDoc = await empRef.get();
      
      if (empDoc.exists) {
        const empData = empDoc.data();
        const authUid = empData.auth_uid;
        
        // Delete auth user
        if (authUid) {
          try {
            await auth.deleteUser(authUid);
            console.log(`   ✓ Deleted auth user: ${authUid}`);
          } catch (error) {
            console.log(`   ⚠️  Auth user not found: ${authUid}`);
          }
        }
        
        // Delete employee document
        await empRef.delete();
        console.log(`   ✓ Deleted employee: ${empId}`);
        totalDeleted++;
      }
    }
    console.log('');

    console.log('═════════════════════════════════════════════════════════════');
    console.log(`✅ CLEANUP COMPLETE!\n`);
    console.log(`📊 Summary:`);
    console.log(`   • Total items deleted: ${totalDeleted}`);
    console.log(`   • 3 employees and auth accounts removed`);
    console.log(`   • 2 assignments removed`);
    console.log(`   • All associated data cleaned up\n`);
    console.log(`💡 You can now run the test data creation script again if needed.\n`);
    console.log('═════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
    console.error('Details:', error.message);
    process.exit(1);
  }

  rl.close();
  process.exit(0);
}

cleanupTestData().catch(error => {
  console.error('Fatal error:', error);
  rl.close();
  process.exit(1);
});
