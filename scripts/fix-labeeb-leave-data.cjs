require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function fixLabeebLeaveData() {
  try {
    const labeebId = 'JB1RRxzmMdPslcuqVf9V';
    const leaveRequestId = 'zWLqUQ3eMqeIh3snywGc';
    const currentYear = new Date().getFullYear();
    
    console.log('🔧 Fixing Labeeb\'s Leave and Attendance Data\n');
    console.log('═══════════════════════════════════════════════════\n');
    
    // Step 1: Create or update leave balance for 2025
    console.log('Step 1: Setting up leave balance for 2025...');
    
    const leaveBalanceSnapshot = await db.collection('leave_balances')
      .where('employee_id', '==', labeebId)
      .where('year', '==', currentYear)
      .get();
    
    let leaveBalanceRef;
    
    if (leaveBalanceSnapshot.empty) {
      console.log('   Creating new leave balance record...');
      leaveBalanceRef = await db.collection('leave_balances').add({
        employee_id: labeebId,
        year: currentYear,
        casual_leave_total: 10,
        casual_leave_used: 0,
        casual_leave_remaining: 10,
        sick_leave_total: 10,
        sick_leave_used: 6, // 6 days already approved
        sick_leave_remaining: 4, // 10 - 6 = 4
        unpaid_leave_days: 0,
        created_at: new Date(),
        updated_at: new Date()
      });
      console.log('   ✅ Leave balance created with 6 sick days deducted!');
    } else {
      console.log('   Updating existing leave balance...');
      leaveBalanceRef = leaveBalanceSnapshot.docs[0].ref;
      await leaveBalanceRef.update({
        sick_leave_used: 6,
        sick_leave_remaining: admin.firestore.FieldValue.increment(-6),
        updated_at: new Date()
      });
      console.log('   ✅ Leave balance updated!');
    }
    
    // Step 2: Add days_requested to the leave request
    console.log('\nStep 2: Adding days_requested to leave request...');
    await db.collection('leave_requests').doc(leaveRequestId).update({
      days_requested: 6,
      updated_at: new Date()
    });
    console.log('   ✅ Leave request updated with days_requested = 6');
    
    // Step 3: Create attendance records for the leave period (Nov 17-22, 2025)
    console.log('\nStep 3: Creating attendance records for Nov 17-22...');
    
    const leaveDates = [
      '2025-11-17',
      '2025-11-18',
      '2025-11-19',
      '2025-11-20',
      '2025-11-21',
      '2025-11-22'
    ];
    
    for (const date of leaveDates) {
      // Check if attendance record already exists
      const existingAttendance = await db.collection('attendance')
        .where('employee_id', '==', labeebId)
        .where('date', '==', date)
        .get();
      
      if (existingAttendance.empty) {
        await db.collection('attendance').add({
          employee_id: labeebId,
          date: date,
          status: 'Leave',
          leave_type: 'Sick Leave',
          check_in_time: null,
          check_out_time: null,
          total_hours: null,
          manually_added: true,
          supervisor_approved: true,
          admin_approved: true,
          created_at: new Date(),
          updated_at: new Date()
        });
        console.log(`   ✅ Created attendance record for ${date}`);
      } else {
        console.log(`   ⏭️  Attendance record for ${date} already exists`);
      }
    }
    
    console.log('\n🎉 All fixes applied successfully!\n');
    console.log('Summary of changes:');
    console.log('  ✓ Leave balance created/updated (6 sick days deducted)');
    console.log('  ✓ Leave request updated with days_requested field');
    console.log('  ✓ 6 attendance records created for the leave period');
    console.log('\n📊 Now when you check:');
    console.log('  • Attendance History will show 6 leave days');
    console.log('  • Sick leave balance will show: Used: 6, Remaining: 4');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

fixLabeebLeaveData();
