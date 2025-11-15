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

async function restoreBalance() {
  try {
    await db.collection('employees').doc('emp-002').update({
      sick_leave_remaining: 10,
      casual_leave_remaining: 10
    });
    
    console.log('✓ Restored Ayesha Khan balance to 10 sick, 10 casual');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

restoreBalance();
