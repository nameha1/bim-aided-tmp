/**
 * Check Leave Requests and Appeals
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

async function checkLeaveRequestsAndAppeals() {
  console.log('\n📋 Checking Leave Requests and Appeals\n');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Get Sakib's ID
    const sakibSnapshot = await db.collection('employees')
      .where('email', '==', 'emp1@gmail.com')
      .get();
    
    const sakibId = sakibSnapshot.empty ? null : sakibSnapshot.docs[0].id;
    console.log(`Sakib Rahman ID: ${sakibId}\n`);

    // Get all leave requests
    const leaveRequestsSnapshot = await db.collection('leave_requests').get();
    
    console.log(`Total Leave Requests: ${leaveRequestsSnapshot.size}\n`);

    if (leaveRequestsSnapshot.empty) {
      console.log('❌ No leave requests found in database\n');
    } else {
      leaveRequestsSnapshot.forEach(doc => {
        const request = doc.data();
        console.log(`📄 Leave Request: ${doc.id}`);
        console.log(`   Employee ID: ${request.employee_id}`);
        console.log(`   Supervisor ID: ${request.supervisor_id || 'NOT SET'}`);
        console.log(`   Status: ${request.status}`);
        console.log(`   Leave Type: ${request.leave_type}`);
        console.log(`   Start Date: ${request.start_date}`);
        console.log(`   End Date: ${request.end_date}`);
        console.log(`   Supervisor Approved: ${request.supervisor_approved}`);
        console.log(`   Admin Approved: ${request.admin_approved}`);
        console.log(`   Appeal Message: ${request.appeal_message || 'None'}`);
        console.log(`   Appeal Reviewed: ${request.appeal_reviewed || false}`);
        console.log('');
      });
    }

    // Check specifically for Sakib's team
    if (sakibId) {
      console.log('═══════════════════════════════════════════════════');
      console.log(`\n🔍 Leave Requests for Sakib's Team:\n`);

      const sakibTeamRequests = await db.collection('leave_requests')
        .where('supervisor_id', '==', sakibId)
        .get();

      console.log(`Found ${sakibTeamRequests.size} leave requests\n`);

      if (sakibTeamRequests.empty) {
        console.log('❌ No leave requests assigned to Sakib Rahman');
        console.log('\n💡 This is the problem! Leave requests need to have supervisor_id set to Sakib\'s ID');
      } else {
        sakibTeamRequests.forEach(doc => {
          const request = doc.data();
          console.log(`✓ ${doc.id}`);
          console.log(`   Status: ${request.status}`);
          console.log(`   Has Appeal: ${request.appeal_message ? 'YES' : 'NO'}`);
        });
      }
    }

    // Check for appeals
    console.log('\n═══════════════════════════════════════════════════');
    console.log('\n🔔 Leave Requests with Appeals:\n');

    const appealsSnapshot = await db.collection('leave_requests')
      .where('status', '==', 'rejected')
      .get();

    let appealCount = 0;
    appealsSnapshot.forEach(doc => {
      const request = doc.data();
      if (request.appeal_message && !request.appeal_reviewed) {
        appealCount++;
        console.log(`📢 Appeal from employee: ${request.employee_id}`);
        console.log(`   Supervisor: ${request.supervisor_id || 'NOT SET'}`);
        console.log(`   Appeal Message: ${request.appeal_message}`);
        console.log('');
      }
    });

    if (appealCount === 0) {
      console.log('❌ No pending appeals found\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

checkLeaveRequestsAndAppeals();
