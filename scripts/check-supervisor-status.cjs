/**
 * Check Supervisor Status
 * Verifies if an employee has team members reporting to them
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

const db = admin.firestore();

async function checkSupervisorStatus() {
  console.log('\n🔍 Checking Supervisor Status\n');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Get all employees
    const employeesSnapshot = await db.collection('employees').get();
    
    console.log(`📋 Total Employees: ${employeesSnapshot.size}\n`);
    
    // Check each employee
    for (const doc of employeesSnapshot.docs) {
      const employee = doc.data();
      const employeeId = doc.id;
      
      // Count subordinates
      const subordinatesSnapshot = await db.collection('employees')
        .where('supervisor_id', '==', employeeId)
        .get();
      
      if (subordinatesSnapshot.size > 0 || employee.designation?.toLowerCase().includes('manager')) {
        console.log(`👤 ${employee.firstName || employee.first_name} ${employee.lastName || employee.last_name}`);
        console.log(`   ID: ${employeeId}`);
        console.log(`   Email: ${employee.email}`);
        console.log(`   Department: ${employee.department || 'N/A'}`);
        console.log(`   Designation: ${employee.designation || 'N/A'}`);
        console.log(`   Subordinates: ${subordinatesSnapshot.size}`);
        
        if (subordinatesSnapshot.size > 0) {
          console.log(`   Team Members:`);
          subordinatesSnapshot.forEach(subDoc => {
            const sub = subDoc.data();
            console.log(`      - ${sub.firstName || sub.first_name} ${sub.lastName || sub.last_name}`);
          });
        }
        console.log('');
      }
    }

    // Specific check for Sakib Rahman
    console.log('\n═══════════════════════════════════════════════════');
    console.log('🔎 Checking Sakib Rahman specifically...\n');
    
    const sakibSnapshot = await db.collection('employees')
      .where('firstName', '==', 'Sakib')
      .where('lastName', '==', 'Rahman')
      .get();
    
    if (!sakibSnapshot.empty) {
      const sakibDoc = sakibSnapshot.docs[0];
      const sakib = sakibDoc.data();
      const sakibId = sakibDoc.id;
      
      console.log('✓ Found Sakib Rahman');
      console.log(`   Document ID: ${sakibId}`);
      console.log(`   EID: ${sakib.eid || 'N/A'}`);
      console.log(`   Email: ${sakib.email}`);
      console.log(`   Auth UID: ${sakib.auth_uid || 'N/A'}`);
      console.log(`   Department: ${sakib.department}`);
      console.log(`   Designation: ${sakib.designation}`);
      
      // Check team members
      const teamSnapshot = await db.collection('employees')
        .where('supervisor_id', '==', sakibId)
        .get();
      
      console.log(`\n   Team Members (${teamSnapshot.size}):`);
      if (teamSnapshot.empty) {
        console.log('   ❌ No team members found!');
      } else {
        teamSnapshot.forEach(teamDoc => {
          const member = teamDoc.data();
          console.log(`   ✓ ${member.firstName || member.first_name} ${member.lastName || member.last_name} (${member.email})`);
        });
      }
    } else {
      console.log('❌ Sakib Rahman not found in database');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

checkSupervisorStatus();
