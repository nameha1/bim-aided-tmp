const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkEmployeeFields() {
  try {
    console.log('🔍 Checking employee field names in database...\n');
    
    const snapshot = await db.collection('employees').limit(3).get();
    
    if (snapshot.empty) {
      console.log('No employees found in database.\n');
      return;
    }
    
    console.log(`Found ${snapshot.size} employees. Showing field names:\n`);
    
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`Employee ${index + 1}: ${data.name || 'Unknown'} (ID: ${doc.id})`);
      console.log('Fields present:');
      console.log('  - gender:', data.gender || 'NOT FOUND');
      console.log('  - department:', data.department || 'NOT FOUND');
      console.log('  - sub_department:', data.sub_department || 'NOT FOUND');
      console.log('  - date_of_birth:', data.date_of_birth || 'NOT FOUND');
      console.log('  - All fields:', Object.keys(data).sort().join(', '));
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkEmployeeFields();
