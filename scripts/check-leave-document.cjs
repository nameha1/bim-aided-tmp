require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function checkLeaveDocument() {
  try {
    const leaveRequestId = 'zWLqUQ3eMqeIh3snywGc';
    const doc = await db.collection('leave_requests').doc(leaveRequestId).get();
    
    if (!doc.exists) {
      console.log('❌ Leave request not found');
      return;
    }
    
    const data = doc.data();
    console.log('📋 Full Leave Request Data:\n');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\n📎 Supporting Document Info:');
    console.log('  URL:', data.supporting_document_url || 'NOT SET');
    console.log('  Field exists:', 'supporting_document_url' in data);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkLeaveDocument().then(() => process.exit(0));
