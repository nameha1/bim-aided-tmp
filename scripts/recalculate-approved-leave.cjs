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

// Working days calculation - Friday is off day
function isWeekend(date) {
  const day = date.getDay();
  return day === 5; // Only Friday
}

function calculateWorkingDays(startDateStr, endDateStr) {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  let workingDays = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (!isWeekend(currentDate)) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
}

async function recalculateApprovedLeave() {
  try {
    console.log('Checking approved sick leave for Ayesha Khan...\n');
    
    const approvedLeave = await db.collection('leave_requests').doc('mXYTQj9y8vvMPrsyfGvF').get();
    
    if (!approvedLeave.exists) {
      console.log('Leave request not found');
      return;
    }
    
    const leaveData = approvedLeave.data();
    const startDate = leaveData.start_date;
    const endDate = leaveData.end_date;
    
    console.log('Approved Leave Details:');
    console.log(`  Type: ${leaveData.leave_type}`);
    console.log(`  Start: ${startDate} (${new Date(startDate).toDateString()})`);
    console.log(`  End: ${endDate} (${new Date(endDate).toDateString()})`);
    console.log(`  Days in Request: ${leaveData.days_requested}`);
    
    const workingDays = calculateWorkingDays(startDate, endDate);
    console.log(`  Calculated Working Days (excl. Friday): ${workingDays}\n`);
    
    if (workingDays !== leaveData.days_requested) {
      console.log(`⚠️  Mismatch! Updating days_requested to ${workingDays}`);
      await approvedLeave.ref.update({
        days_requested: workingDays
      });
    }
    
    // Check current balance
    const employeeDoc = await db.collection('employees').doc('emp-002').get();
    const employeeData = employeeDoc.data();
    
    console.log('\nCurrent Employee Balance:');
    console.log(`  Sick Leave: ${employeeData.sick_leave_remaining}`);
    console.log(`  Expected after deduction: ${10 - workingDays}`);
    
    if (employeeData.sick_leave_remaining === 10) {
      console.log('\n⚠️  Balance not deducted! Applying deduction now...');
      const newBalance = 10 - workingDays;
      await db.collection('employees').doc('emp-002').update({
        sick_leave_remaining: newBalance
      });
      console.log(`✓ Updated sick leave: 10 → ${newBalance}`);
    } else if (employeeData.sick_leave_remaining === 10 - workingDays) {
      console.log('\n✓ Balance already correctly deducted');
    } else {
      console.log(`\n⚠️  Balance mismatch! Setting to correct value: ${10 - workingDays}`);
      await db.collection('employees').doc('emp-002').update({
        sick_leave_remaining: 10 - workingDays
      });
    }
    
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

recalculateApprovedLeave();
