require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function checkEmployeeAuth() {
  try {
    console.log('Checking employee authentication data...\n');

    // Get all employees
    const employeesSnapshot = await db.collection('employees').get();
    
    if (employeesSnapshot.empty) {
      console.log('No employees found in the database.');
      return;
    }

    console.log(`Found ${employeesSnapshot.size} employees:\n`);

    for (const doc of employeesSnapshot.docs) {
      const employee = doc.data();
      console.log('─'.repeat(60));
      console.log(`Employee ID: ${doc.id}`);
      console.log(`Name: ${employee.firstName || employee.first_name} ${employee.lastName || employee.last_name}`);
      console.log(`Email: ${employee.email}`);
      console.log(`EID: ${employee.eid}`);
      console.log(`Auth UID: ${employee.auth_uid || 'NOT SET'}`);
      
      // Check if this employee has a corresponding auth user
      if (employee.auth_uid) {
        try {
          const user = await admin.auth().getUser(employee.auth_uid);
          console.log(`✓ Auth user exists: ${user.email}`);
          
          // Check user role
          const roleDoc = await db.collection('user_roles').doc(employee.auth_uid).get();
          if (roleDoc.exists) {
            console.log(`✓ User role: ${roleDoc.data().role}`);
          } else {
            console.log(`✗ No user role set`);
          }
        } catch (error) {
          console.log(`✗ Auth user NOT found or error: ${error.message}`);
        }
      } else {
        console.log(`✗ No auth_uid set for this employee`);
      }
      console.log('');
    }

    console.log('─'.repeat(60));
    console.log('\nSummary:');
    
    const employeesWithAuth = employeesSnapshot.docs.filter(doc => doc.data().auth_uid);
    const employeesWithoutAuth = employeesSnapshot.docs.filter(doc => !doc.data().auth_uid);
    
    console.log(`Employees with auth_uid: ${employeesWithAuth.length}`);
    console.log(`Employees without auth_uid: ${employeesWithoutAuth.length}`);

    if (employeesWithoutAuth.length > 0) {
      console.log('\n⚠️  Employees without auth_uid:');
      for (const doc of employeesWithoutAuth) {
        const emp = doc.data();
        console.log(`  - ${emp.firstName || emp.first_name} ${emp.lastName || emp.last_name} (${emp.email})`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkEmployeeAuth();
