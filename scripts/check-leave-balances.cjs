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

async function checkLeaveBalances() {
  try {
    console.log('Checking leave balances and requests for Ayesha Khan (emp-002)...\n');
    
    // Get employee data
    const empDoc = await db.collection('employees').doc('emp-002').get();
    if (!empDoc.exists) {
      console.log('Employee emp-002 not found');
      return;
    }
    
    const empData = empDoc.data();
    console.log('Employee:', empData.name);
    console.log('Casual Leave Remaining:', empData.casual_leave_remaining);
    console.log('Sick Leave Remaining:', empData.sick_leave_remaining);
    console.log('Unpaid Leave Days:', empData.unpaid_leave_days || 0);
    
    // Get leave balance from leave_balances collection
    const balanceSnapshot = await db.collection('leave_balances')
      .where('employee_id', '==', 'emp-002')
      .where('year', '==', 2025)
      .get();
    
    console.log('\nLeave Balance Record:');
    balanceSnapshot.forEach(doc => {
      const data = doc.data();
      console.log('  Casual Leave Remaining:', data.casual_leave_remaining);
      console.log('  Sick Leave Remaining:', data.sick_leave_remaining);
      console.log('  Unpaid Leave Days:', data.unpaid_leave_days || 0);
    });
    
    // Get all leave requests
    const requestsSnapshot = await db.collection('leave_requests')
      .where('employee_id', '==', 'emp-002')
      .orderBy('created_at', 'desc')
      .get();
    
    console.log('\nLeave Requests:');
    requestsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\n  ID: ${doc.id}`);
      console.log(`  Leave Type: ${data.leave_type}`);
      console.log(`  Start: ${data.start_date} - End: ${data.end_date}`);
      console.log(`  Days: ${data.days_requested}`);
      console.log(`  Status: ${data.status}`);
      console.log(`  Approved By: ${data.approved_by || 'N/A'}`);
      console.log(`  Approved At: ${data.approved_at ? new Date(data.approved_at.toDate()).toLocaleString() : 'N/A'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkLeaveBalances();
