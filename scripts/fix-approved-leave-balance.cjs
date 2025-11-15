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

function calculateWorkingDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 5 && dayOfWeek !== 6) { // Not Friday or Saturday
      count++;
    }
  }
  
  return count;
}

async function fixApprovedLeaveBalance() {
  try {
    console.log('Fixing approved leave balance for Ayesha Khan...\n');
    
    // Get the approved sick leave
    const approvedLeave = await db.collection('leave_requests').doc('mXYTQj9y8vvMPrsyfGvF').get();
    
    if (!approvedLeave.exists) {
      console.log('Leave request not found');
      return;
    }
    
    const leaveData = approvedLeave.data();
    console.log('Found approved leave:');
    console.log(`  Type: ${leaveData.leave_type}`);
    console.log(`  Dates: ${leaveData.start_date} to ${leaveData.end_date}`);
    console.log(`  Current Days Field: ${leaveData.days_requested}`);
    
    // Calculate working days
    const workingDays = calculateWorkingDays(leaveData.start_date, leaveData.end_date);
    console.log(`  Calculated Working Days: ${workingDays}\n`);
    
    // Update the leave request with days
    await approvedLeave.ref.update({
      days_requested: workingDays
    });
    console.log('✓ Updated leave request with days_requested\n');
    
    // Get employee and deduct balance
    const employeeRef = db.collection('employees').doc('emp-002');
    const employeeDoc = await employeeRef.get();
    const employeeData = employeeDoc.data();
    
    console.log('Current balances:');
    console.log(`  Sick Leave: ${employeeData.sick_leave_remaining}`);
    
    const newSickBalance = Math.max(0, employeeData.sick_leave_remaining - workingDays);
    
    await employeeRef.update({
      sick_leave_remaining: newSickBalance
    });
    
    console.log(`\n✓ Updated sick leave balance: ${employeeData.sick_leave_remaining} → ${newSickBalance}`);
    console.log('\n✅ Balance deduction complete!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixApprovedLeaveBalance();
