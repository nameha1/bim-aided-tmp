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

async function fixLeaveSupervisorIds() {
  try {
    console.log('🔧 Fixing supervisor_id in leave requests...\n');
    
    // Get all employees to build supervisor mapping
    const empSnapshot = await db.collection('employees').get();
    const employeeMap = {};
    
    empSnapshot.forEach(doc => {
      const data = doc.data();
      employeeMap[doc.id] = {
        name: data.name,
        supervisor_id: data.supervisor_id
      };
    });
    
    // Get all leave requests
    const leaveSnapshot = await db.collection('leave_requests').get();
    
    console.log(`Found ${leaveSnapshot.size} leave requests to check\n`);
    
    let updated = 0;
    
    for (const doc of leaveSnapshot.docs) {
      const data = doc.data();
      const employeeId = data.employee_id;
      const employee = employeeMap[employeeId];
      
      if (!employee) {
        console.log(`⚠️  Leave ${doc.id}: Employee ${employeeId} not found`);
        continue;
      }
      
      if (!data.supervisor_id && employee.supervisor_id) {
        console.log(`📝 Updating leave ${doc.id}:`);
        console.log(`   Employee: ${employee.name}`);
        console.log(`   Adding supervisor_id: ${employee.supervisor_id}`);
        console.log(`   Changing status: ${data.status} → pending_supervisor`);
        
        await doc.ref.update({
          supervisor_id: employee.supervisor_id,
          status: 'pending_supervisor'
        });
        
        updated++;
        console.log('   ✅ Updated\n');
      } else if (data.supervisor_id) {
        console.log(`✓ Leave ${doc.id} already has supervisor_id: ${data.supervisor_id}`);
      } else {
        console.log(`ℹ️  Leave ${doc.id}: Employee ${employee.name} has no supervisor`);
      }
    }
    
    console.log(`\n✅ Updated ${updated} leave request(s)`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

fixLeaveSupervisorIds();
