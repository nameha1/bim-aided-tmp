require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function fixAttendanceRecord() {
  try {
    const recordId = 'MKffUGtIYxeSdw2rpgtS'; // The broken record from today
    const employeeId = 'z5U24H2pBkl7j4aiKBZP'; // Tasneem's employee ID
    
    console.log(`🔧 Fixing attendance record ${recordId}...`);
    
    await db.collection('attendance').doc(recordId).update({
      employee_id: employeeId
    });
    
    console.log('✅ Successfully added employee_id to the attendance record!');
    console.log(`   Employee ID: ${employeeId}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

fixAttendanceRecord();
