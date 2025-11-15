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

async function checkApprovedLeaves() {
  try {
    console.log('Checking approved leave requests for Ayesha Khan...\n');
    
    const requestsSnapshot = await db.collection('leave_requests')
      .where('employee_id', '==', 'emp-002')
      .get();
    
    console.log(`Found ${requestsSnapshot.size} leave requests\n`);
    
    requestsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Request ID: ${doc.id}`);
      console.log(`  Leave Type: ${data.leave_type}`);
      console.log(`  Start: ${data.start_date}`);
      console.log(`  End: ${data.end_date}`);
      console.log(`  Days: ${data.days_requested}`);
      console.log(`  Status: ${data.status}`);
      console.log(`  Admin Approved: ${data.admin_approved}`);
      console.log(`  Created: ${data.created_at ? new Date(data.created_at.toDate()).toLocaleString() : 'N/A'}\n`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkApprovedLeaves();
