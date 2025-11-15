/**
 * Fix Leave Requests and Create Test Appeal
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

async function fixLeaveRequestsAndCreateAppeal() {
  console.log('\n🔧 Fixing Leave Requests and Creating Test Appeal\n');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Get Sakib's ID
    const sakibSnapshot = await db.collection('employees')
      .where('email', '==', 'emp1@gmail.com')
      .get();
    
    const sakibId = sakibSnapshot.docs[0].id;
    console.log(`✓ Sakib Rahman ID: ${sakibId}\n`);

    // Step 1: Update existing leave requests to add supervisor_id
    console.log('📝 Step 1: Updating existing leave requests...\n');

    const leaveRequestsSnapshot = await db.collection('leave_requests').get();
    
    for (const doc of leaveRequestsSnapshot.docs) {
      const request = doc.data();
      
      // Check if employee reports to Sakib
      if (request.employee_id === 'emp-002' || request.employee_id === 'emp-003') {
        console.log(`   Updating ${doc.id} (Employee: ${request.employee_id})`);
        await db.collection('leave_requests').doc(doc.id).update({
          supervisor_id: sakibId,
          status: request.status === 'pending_admin' ? 'pending_supervisor' : request.status,
          updated_at: new Date()
        });
        console.log(`   ✓ Set supervisor_id and status\n`);
      }
    }

    // Step 2: Create a test rejected leave request with appeal
    console.log('═══════════════════════════════════════════════════');
    console.log('\n📝 Step 2: Creating test leave request with appeal...\n');

    // Create a rejected leave request from Ayesha Khan (emp-002)
    const rejectedRequestRef = await db.collection('leave_requests').add({
      employee_id: 'emp-002',
      supervisor_id: sakibId,
      start_date: '2025-11-20',
      end_date: '2025-11-22',
      leave_type: 'Casual Leave',
      reason: 'Family emergency - need to travel urgently',
      status: 'rejected',
      supervisor_approved: false,
      admin_approved: false,
      rejection_reason: 'Insufficient notice period. Please submit requests at least 3 days in advance.',
      rejected_by: 'supervisor',
      supporting_document_url: null,
      appeal_message: 'This was truly an emergency situation. My mother fell ill suddenly and I need to be with her. I understand the policy but this is an exceptional circumstance. I have attached the hospital admission letter.',
      appeal_submitted_at: new Date(),
      appeal_reviewed: false,
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log(`✓ Created rejected leave request with appeal`);
    console.log(`   Request ID: ${rejectedRequestRef.id}`);
    console.log(`   Employee: Ayesha Khan (emp-002)`);
    console.log(`   Supervisor: Sakib Rahman`);
    console.log(`   Status: rejected (with pending appeal)`);
    console.log(`   Appeal: "This was truly an emergency..."\n`);

    // Step 3: Create another test - pending approval
    console.log('═══════════════════════════════════════════════════');
    console.log('\n📝 Step 3: Creating pending leave request...\n');

    const pendingRequestRef = await db.collection('leave_requests').add({
      employee_id: 'emp-003',
      supervisor_id: sakibId,
      start_date: '2025-11-25',
      end_date: '2025-11-27',
      leave_type: 'Sick Leave',
      reason: 'Medical appointment and recovery',
      status: 'pending_supervisor',
      supervisor_approved: false,
      admin_approved: false,
      supporting_document_url: null,
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log(`✓ Created pending leave request`);
    console.log(`   Request ID: ${pendingRequestRef.id}`);
    console.log(`   Employee: Md. Karim Ahmed (emp-003)`);
    console.log(`   Supervisor: Sakib Rahman`);
    console.log(`   Status: pending_supervisor\n`);

    // Verification
    console.log('═══════════════════════════════════════════════════');
    console.log('\n✅ Verification:\n');

    const sakibRequests = await db.collection('leave_requests')
      .where('supervisor_id', '==', sakibId)
      .get();

    console.log(`Sakib Rahman now has ${sakibRequests.size} leave requests to review:`);
    
    let pendingCount = 0;
    let appealCount = 0;
    
    sakibRequests.forEach(doc => {
      const request = doc.data();
      if (request.status === 'pending_supervisor') pendingCount++;
      if (request.appeal_message && !request.appeal_reviewed) appealCount++;
    });

    console.log(`   • Pending Approval: ${pendingCount}`);
    console.log(`   • Pending Appeals: ${appealCount}`);

    console.log('\n✅ Setup Complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Refresh the browser');
    console.log('   2. Login as Sakib Rahman (emp1@gmail.com / Test@123456)');
    console.log('   3. Go to "My Team & Leave Approvals" tab');
    console.log('   4. Click "Leave Approvals"');
    console.log('   5. You should see:');
    console.log('      - 1 Leave Appeal from Ayesha Khan (red section at top)');
    console.log('      - 1 Pending Request from Md. Karim Ahmed\n');

    console.log('   To test employee view:');
    console.log('   1. Login as Ayesha Khan (emp2@gmail.com / Test@123456)');
    console.log('   2. Go to "Request Leave" tab');
    console.log('   3. Scroll to "Leave Request History"');
    console.log('   4. You should see the rejected request with Appeal button\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

fixLeaveRequestsAndCreateAppeal();
