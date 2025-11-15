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

async function showLeaveBalances() {
  try {
    console.log('Current Leave Balances:\n');
    
    const employeesSnapshot = await db.collection('employees').get();
    
    for (const doc of employeesSnapshot.docs) {
      const empData = doc.data();
      console.log(`${empData.name || empData.email} (${doc.id})`);
      console.log(`  Casual Leave: ${empData.casual_leave_remaining}`);
      console.log(`  Sick Leave: ${empData.sick_leave_remaining}`);
      console.log(`  Unpaid Days: ${empData.unpaid_leave_days || 0}\n`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

showLeaveBalances();
