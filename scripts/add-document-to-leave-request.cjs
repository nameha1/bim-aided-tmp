require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
const readline = require('readline');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function addDocumentToLeaveRequest() {
  try {
    const leaveRequestId = 'zWLqUQ3eMqeIh3snywGc';
    
    console.log('📎 Add Document to Leave Request\n');
    console.log('Leave Request ID:', leaveRequestId);
    console.log('Employee: Labeeb Zaman\n');
    
    const documentUrl = await question('Enter the document URL (or press Enter to cancel): ');
    
    if (!documentUrl || documentUrl.trim() === '') {
      console.log('\n❌ No URL provided. Cancelled.');
      rl.close();
      return;
    }
    
    console.log('\n🔄 Updating leave request...');
    
    await db.collection('leave_requests').doc(leaveRequestId).update({
      supporting_document_url: documentUrl.trim(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Document URL added successfully!');
    console.log('   URL:', documentUrl.trim());
    console.log('\n📋 The document will now appear in the leave approval interface.');
    
    rl.close();
  } catch (error) {
    console.error('❌ Error:', error);
    rl.close();
  }
}

addDocumentToLeaveRequest();
