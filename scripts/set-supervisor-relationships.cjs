/**
 * Set Supervisor Relationships
 * Assigns Sakib Rahman as supervisor for emp-002 and emp-003
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

async function setSupervisorRelationships() {
  console.log('\n🔗 Setting Supervisor Relationships\n');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Get Sakib Rahman's ID
    const sakibSnapshot = await db.collection('employees')
      .where('email', '==', 'emp1@gmail.com')
      .get();

    if (sakibSnapshot.empty) {
      console.log('❌ Sakib Rahman not found');
      process.exit(1);
    }

    const sakibId = sakibSnapshot.docs[0].id;
    const sakib = sakibSnapshot.docs[0].data();
    
    console.log(`✓ Found Supervisor: ${sakib.firstName} ${sakib.lastName}`);
    console.log(`   ID: ${sakibId}`);
    console.log(`   Email: ${sakib.email}\n`);

    // Update emp-002 (Ayesha Khan)
    console.log('📝 Updating emp-002 (Ayesha Khan)...');
    await db.collection('employees').doc('emp-002').update({
      supervisor_id: sakibId,
      updated_at: new Date().toISOString()
    });
    console.log('   ✓ Set supervisor_id to Sakib Rahman\n');

    // Update emp-003 (Md. Karim Ahmed)
    console.log('📝 Updating emp-003 (Md. Karim Ahmed)...');
    await db.collection('employees').doc('emp-003').update({
      supervisor_id: sakibId,
      updated_at: new Date().toISOString()
    });
    console.log('   ✓ Set supervisor_id to Sakib Rahman\n');

    // Verify the changes
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Verification:\n');

    const teamSnapshot = await db.collection('employees')
      .where('supervisor_id', '==', sakibId)
      .get();

    console.log(`Sakib Rahman now supervises ${teamSnapshot.size} employees:`);
    teamSnapshot.forEach(doc => {
      const member = doc.data();
      console.log(`   ✓ ${member.firstName} ${member.lastName} (${member.designation})`);
    });

    console.log('\n✅ Supervisor relationships set successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Refresh the employee portal');
    console.log('   2. Login as Sakib Rahman (emp1@gmail.com)');
    console.log('   3. You should now see "My Team & Leave Approvals" tab\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

setSupervisorRelationships();
