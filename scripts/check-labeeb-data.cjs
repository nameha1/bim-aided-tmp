require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function checkLabeebData() {
  try {
    const labeebId = 'JB1RRxzmMdPslcuqVf9V';
    
    console.log('🔍 Checking Labeeb Zaman\'s Data\n');
    console.log('═══════════════════════════════════════════════════\n');
    
    // 1. Check attendance records
    console.log('📋 Attendance Records:');
    const attendanceSnapshot = await db.collection('attendance')
      .where('employee_id', '==', labeebId)
      .orderBy('date', 'desc')
      .limit(10)
      .get();
    
    console.log(`   Found ${attendanceSnapshot.size} attendance records\n`);
    
    attendanceSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`   ${index + 1}. ${data.date} - Status: ${data.status}`);
    });
    
    // 2. Check leave balance
    console.log('\n💰 Leave Balance:');
    const currentYear = new Date().getFullYear();
    const leaveBalanceSnapshot = await db.collection('leave_balances')
      .where('employee_id', '==', labeebId)
      .where('year', '==', currentYear)
      .get();
    
    if (leaveBalanceSnapshot.empty) {
      console.log('   ❌ No leave balance record found for 2025!');
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
      console.log(`   Unpaid Leave Days: ${balance.unpaid_leave_days || 0}`);
    }
    
    // 3. Check leave requests
    console.log('\n📝 Leave Requests:');
    const leaveRequestsSnapshot = await db.collection('leave_requests')
      .where('employee_id', '==', labeebId)
      .get();
    
    console.log(`   Found ${leaveRequestsSnapshot.size} leave requests\n`);
    
    leaveRequestsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`   ${index + 1}. ${data.leave_type} (${data.start_date} to ${data.end_date})`);
      console.log(`      Status: ${data.status}`);
      console.log(`      Supervisor Approved: ${data.supervisor_approved}`);
      console.log(`      Admin Approved: ${data.admin_approved}`);
      console.log(`      Days Requested: ${data.days_requested || 'NOT SET'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkLabeebData();
