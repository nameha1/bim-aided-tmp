require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function fixLabeebLeaveRequest() {
  try {
    console.log('🔍 Checking Labeeb Zaman\'s data...\n');
    
    // Check Labeeb's employee record
    const labeebId = 'JB1RRxzmMdPslcuqVf9V';
    const labeebDoc = await db.collection('employees').doc(labeebId).get();
    
    if (!labeebDoc.exists) {
      console.log('❌ Labeeb not found!');
      return;
    }
    
    const labeebData = labeebDoc.data();
    console.log('✅ Found Labeeb Zaman:');
    console.log('  Name:', labeebData.firstName, labeebData.lastName);
    console.log('  Email:', labeebData.email);
    console.log('  Supervisor ID:', labeebData.supervisor_id || 'NONE');
    console.log();
    
    // Check Tasneem's employee record
    const tasneemId = 'FHuc0XEe7uXqguzioGQO';
    const tasneemDoc = await db.collection('employees').doc(tasneemId).get();
    
    if (tasneemDoc.exists) {
      const tasneemData = tasneemDoc.data();
      console.log('✅ Found Tasneem Zaman:');
      console.log('  Name:', tasneemData.firstName, tasneemData.lastName);
      console.log('  Email:', tasneemData.email);
      console.log();
    }
    
    // Check the leave request
    const leaveRequestId = 'zWLqUQ3eMqeIh3snywGc';
    const leaveDoc = await db.collection('leave_requests').doc(leaveRequestId).get();
    
    if (!leaveDoc.exists) {
      console.log('❌ Leave request not found!');
      return;
    }
    
    const leaveData = leaveDoc.data();
    console.log('📝 Current Leave Request:');
    console.log('  Employee ID:', leaveData.employee_id);
    console.log('  Supervisor ID:', leaveData.supervisor_id || 'NONE');
    console.log('  Status:', leaveData.status);
    console.log();
    
    // Fix the leave request
    if (!leaveData.supervisor_id && labeebData.supervisor_id) {
      console.log('🔧 Fixing leave request...');
      
      await db.collection('leave_requests').doc(leaveRequestId).update({
        supervisor_id: labeebData.supervisor_id,
        status: 'pending_supervisor',
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Leave request updated successfully!');
      console.log('  New Supervisor ID:', labeebData.supervisor_id);
      console.log('  New Status: pending_supervisor');
      console.log();
      console.log('🎉 Labeeb\'s leave request should now appear in Tasneem\'s Team Leave Approval tab!');
    } else if (leaveData.supervisor_id) {
      console.log('ℹ️  Leave request already has a supervisor_id:', leaveData.supervisor_id);
    } else {
      console.log('⚠️  Labeeb does not have a supervisor_id in their employee record!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixLabeebLeaveRequest().then(() => process.exit(0));
