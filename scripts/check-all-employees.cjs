/**
 * Check All Employee Supervisor Relationships
 */

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

async function checkAllEmployees() {
  console.log('\n📋 All Employees and Their Supervisors\n');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    const employeesSnapshot = await db.collection('employees').get();
    
    const employees = [];
    employeesSnapshot.forEach(doc => {
      const data = doc.data();
      employees.push({
        id: doc.id,
        name: `${data.firstName || data.first_name || ''} ${data.lastName || data.last_name || ''}`.trim(),
        email: data.email,
        designation: data.designation || 'N/A',
        supervisor_id: data.supervisor_id || null
      });
    });

    // Sort by name
    employees.sort((a, b) => a.name.localeCompare(b.name));

    employees.forEach(emp => {
      console.log(`👤 ${emp.name}`);
      console.log(`   ID: ${emp.id}`);
      console.log(`   Email: ${emp.email}`);
      console.log(`   Designation: ${emp.designation}`);
      console.log(`   Supervisor ID: ${emp.supervisor_id || '❌ NOT SET'}`);
      
      if (emp.supervisor_id) {
        const supervisor = employees.find(e => e.id === emp.supervisor_id);
        if (supervisor) {
          console.log(`   Reports to: ${supervisor.name}`);
        }
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

checkAllEmployees();
