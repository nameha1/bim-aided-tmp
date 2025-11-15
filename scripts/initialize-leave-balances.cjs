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

async function initializeLeaveBalances() {
  try {
    console.log('Initializing leave balances for all employees...\n');
    
    const employeesSnapshot = await db.collection('employees').get();
    
    for (const doc of employeesSnapshot.docs) {
      const empData = doc.data();
      const empId = doc.id;
      
      // Check if balance fields exist
      const needsUpdate = 
        empData.casual_leave_remaining === undefined ||
        empData.sick_leave_remaining === undefined ||
        empData.unpaid_leave_days === undefined;
      
      if (needsUpdate) {
        console.log(`Updating ${empData.name || empData.email}...`);
        
        await doc.ref.update({
          casual_leave_remaining: empData.casual_leave_remaining || 10,
          sick_leave_remaining: empData.sick_leave_remaining || 10,
          unpaid_leave_days: empData.unpaid_leave_days || 0
        });
        
        console.log(`  ✓ Set casual: 10, sick: 10, unpaid: 0`);
      } else {
        console.log(`${empData.name || empData.email} - Already has balance fields`);
      }
    }
    
    console.log('\n✅ Leave balance initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

initializeLeaveBalances();
