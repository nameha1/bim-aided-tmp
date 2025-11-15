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

async function syncLeaveBalance() {
  try {
    console.log('Syncing leave balance for Ayesha Khan...\n');
    
    // Get employee balance
    const empDoc = await db.collection('employees').doc('emp-002').get();
    const empData = empDoc.data();
    
    console.log('Employee Balance (employees collection):');
    console.log(`  Casual Leave: ${empData.casual_leave_remaining}`);
    console.log(`  Sick Leave: ${empData.sick_leave_remaining}`);
    console.log(`  Unpaid Days: ${empData.unpaid_leave_days || 0}\n`);
    
    // Get leave_balances record
    const balanceSnapshot = await db.collection('leave_balances')
      .where('employee_id', '==', 'emp-002')
      .where('year', '==', 2025)
      .get();
    
    if (balanceSnapshot.empty) {
      console.log('No leave_balances record found. Creating one...');
      await db.collection('leave_balances').add({
        employee_id: 'emp-002',
        year: 2025,
        casual_leave_total: 10,
        casual_leave_used: 10 - empData.casual_leave_remaining,
        casual_leave_remaining: empData.casual_leave_remaining,
        sick_leave_total: 10,
        sick_leave_used: 10 - empData.sick_leave_remaining,
        sick_leave_remaining: empData.sick_leave_remaining,
        unpaid_leave_days: empData.unpaid_leave_days || 0,
        created_at: new Date(),
        updated_at: new Date()
      });
      console.log('✓ Created leave_balances record');
    } else {
      const balanceDoc = balanceSnapshot.docs[0];
      const balanceData = balanceDoc.data();
      
      console.log('Leave Balance (leave_balances collection):');
      console.log(`  Casual Leave: ${balanceData.casual_leave_remaining}`);
      console.log(`  Sick Leave: ${balanceData.sick_leave_remaining}`);
      console.log(`  Unpaid Days: ${balanceData.unpaid_leave_days || 0}\n`);
      
      // Update if different
      if (balanceData.sick_leave_remaining !== empData.sick_leave_remaining ||
          balanceData.casual_leave_remaining !== empData.casual_leave_remaining) {
        console.log('Syncing to match employees collection...');
        await balanceDoc.ref.update({
          casual_leave_remaining: empData.casual_leave_remaining,
          casual_leave_used: 10 - empData.casual_leave_remaining,
          sick_leave_remaining: empData.sick_leave_remaining,
          sick_leave_used: 10 - empData.sick_leave_remaining,
          unpaid_leave_days: empData.unpaid_leave_days || 0,
          updated_at: new Date()
        });
        console.log('✓ Updated leave_balances record');
      } else {
        console.log('✓ Already in sync');
      }
    }
    
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

syncLeaveBalance();
