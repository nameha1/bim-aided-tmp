require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function checkLabeebDataSimple() {
  try {
    const labeebId = 'JB1RRxzmMdPslcuqVf9V';
    
    console.log('🔍 Checking Labeeb Zaman\'s Data\n');
    console.log('═══════════════════════════════════════════════════\n');
    
    // 1. Check attendance records (without orderBy to avoid index issues)
    console.log('📋 Attendance Records:');
    const attendanceSnapshot = await db.collection('attendance')
      .where('employee_id', '==', labeebId)
      .get();
    
    console.log(`   Found ${attendanceSnapshot.size} attendance records\n`);
    
    if (attendanceSnapshot.size === 0) {
      console.log('   ❌ NO ATTENDANCE RECORDS FOUND!');
      console.log('   This is why the Attendance History tab is empty!\n');
    } else {
      const sortedRecords = attendanceSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => b.date.localeCompare(a.date));
      
      sortedRecords.slice(0, 10).forEach((data, index) => {
        console.log(`   ${index + 1}. ${data.date} - Status: ${data.status}`);
      });
    }
    
    // 2. Check leave balance
    console.log('\n💰 Leave Balance for 2025:');
    const currentYear = new Date().getFullYear();
    const leaveBalanceSnapshot = await db.collection('leave_balances')
      .where('employee_id', '==', labeebId)
      .where('year', '==', currentYear)
      .get();
    
    if (leaveBalanceSnapshot.empty) {
      console.log('   ❌ No leave balance record found for 2025!');
      console.log('   This is why the leave quota is not deducting!\n');
    } else {
      const balance = leaveBalanceSnapshot.docs[0].data();
      console.log('   Casual Leave:');
      console.log(`      Total: ${balance.casual_leave_total || 0}`);
      console.log(`      Used: ${balance.casual_leave_used || 0}`);
      console.log(`      Remaining: ${balance.casual_leave_remaining || 0}`);
      console.log('   Sick Leave:');
      console.log(`      Total: ${balance.sick_leave_total || 0}`);
      console.log(`      Used: ${balance.sick_leave_used || 0}`);
      console.log(`      Remaining: ${balance.sick_leave_remaining || 0}`);
      console.log(`   Unpaid Leave Days: ${balance.unpaid_leave_days || 0}\n`);
      
      if (balance.sick_leave_used === 0) {
        console.log('   ⚠️  PROBLEM: sick_leave_used is 0 even though 6 days were approved!');
      }
    }
    
    // 3. Check leave requests
    console.log('\n📝 Leave Requests:');
    const leaveRequestsSnapshot = await db.collection('leave_requests')
      .where('employee_id', '==', labeebId)
      .get();
    
    console.log(`   Found ${leaveRequestsSnapshot.size} leave requests\n`);
    
    leaveRequestsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const days = calculateDays(data.start_date, data.end_date);
      console.log(`   ${index + 1}. ${data.leave_type} (${data.start_date} to ${data.end_date}) - ${days} days`);
      console.log(`      Status: ${data.status}`);
      console.log(`      Supervisor Approved: ${data.supervisor_approved}`);
      console.log(`      Admin Approved: ${data.admin_approved}`);
      console.log(`      Days Requested: ${data.days_requested || 'NOT SET (Missing field!)'}\n`);
    });
    
    console.log('\n🔧 FIXES NEEDED:');
    console.log('   1. Create attendance records for the approved leave period (Nov 17-22)');
    console.log('   2. Deduct 6 days from sick_leave_remaining in leave_balances');
    console.log('   3. Add days_requested field to the leave request');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

function calculateDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

checkLabeebDataSimple();
