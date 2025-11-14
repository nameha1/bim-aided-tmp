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

async function checkSupervisorFields() {
  try {
    console.log('Checking supervisor field names in employees collection...\n');
    
    const snapshot = await db.collection('employees').get();
    
    console.log(`Total employees: ${snapshot.size}\n`);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const hasSupervisorId = 'supervisorId' in data;
      const hasSupervisor_id = 'supervisor_id' in data;
      
      console.log(`Employee: ${data.name} (${doc.id})`);
      console.log(`  - supervisorId (camelCase): ${hasSupervisorId ? data.supervisorId || 'null' : 'FIELD NOT FOUND'}`);
      console.log(`  - supervisor_id (snake_case): ${hasSupervisor_id ? data.supervisor_id || 'null' : 'FIELD NOT FOUND'}`);
      console.log('');
    });
    
    // Check Tasneem's record specifically
    console.log('\n=== Checking Tasneem Zaman Labeeb ===');
    const tasneemSnap = await db.collection('employees')
      .where('name', '==', 'Tasneem Zaman Labeeb')
      .get();
    
    if (!tasneemSnap.empty) {
      const tasneemDoc = tasneemSnap.docs[0];
      const tasneemData = tasneemDoc.data();
      console.log('Tasneem ID:', tasneemDoc.id);
      console.log('All fields:', Object.keys(tasneemData));
      
      // Find employees with Tasneem as supervisor (both field names)
      console.log('\n=== Looking for subordinates ===');
      
      const subordinates1 = await db.collection('employees')
        .where('supervisorId', '==', tasneemDoc.id)
        .get();
      console.log(`Found ${subordinates1.size} employees with supervisorId = ${tasneemDoc.id}`);
      
      const subordinates2 = await db.collection('employees')
        .where('supervisor_id', '==', tasneemDoc.id)
        .get();
      console.log(`Found ${subordinates2.size} employees with supervisor_id = ${tasneemDoc.id}`);
    } else {
      console.log('Tasneem not found!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkSupervisorFields();
