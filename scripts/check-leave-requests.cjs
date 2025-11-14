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

async function checkLeaveRequests() {
  try {
    console.log('🔍 Checking leave requests in database...\n');
    
    const snapshot = await db.collection('leave_requests').get();
    
    if (snapshot.empty) {
      console.log('❌ No leave requests found in database.\n');
      return;
    }
    
    console.log(`✅ Found ${snapshot.size} leave request(s)\n`);
    
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`Leave Request ${index + 1}: ${doc.id}`);
      console.log('  Employee ID:', data.employee_id);
      console.log('  Supervisor ID:', data.supervisor_id || 'NONE');
      console.log('  Status:', data.status);
      console.log('  Leave Type:', data.leave_type);
      console.log('  Start Date:', data.start_date);
      console.log('  End Date:', data.end_date);
      console.log('  Supervisor Approved:', data.supervisor_approved);
      console.log('  Admin Approved:', data.admin_approved);
      console.log('  Created At:', data.created_at?.toDate?.() || data.created_at);
      console.log('');
    });

    // Check employees to see who has subordinates
    console.log('='.repeat(60));
    console.log('\n👥 Checking employees with supervisor_id...\n');
    
    const empSnapshot = await db.collection('employees').get();
    const employeesWithSupervisor = [];
    
    empSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.supervisor_id) {
        employeesWithSupervisor.push({
          id: doc.id,
          name: data.name,
          supervisor_id: data.supervisor_id
        });
      }
    });
    
    console.log(`Found ${employeesWithSupervisor.length} employees with a supervisor:\n`);
    employeesWithSupervisor.forEach(emp => {
      console.log(`  - ${emp.name} (${emp.id}) → Supervisor: ${emp.supervisor_id}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkLeaveRequests();
