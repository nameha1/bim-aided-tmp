require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function verifyLeaveBalances() {
  try {
    const labeebId = 'JB1RRxzmMdPslcuqVf9V';
    const currentYear = new Date().getFullYear();
    
    console.log('🔍 Verifying Leave Balance Configuration\n');
    console.log('═══════════════════════════════════════════════════\n');
    
    // Check leave balance
    const leaveBalanceSnapshot = await db.collection('leave_balances')
      .where('employee_id', '==', labeebId)
      .where('year', '==', currentYear)
      .get();
    
    if (leaveBalanceSnapshot.empty) {
      console.log('❌ No leave balance found!\n');
      return;
    }
    
    const balance = leaveBalanceSnapshot.docs[0].data();
    
    console.log('✅ Leave Balance Configuration for 2025:\n');
    console.log('📋 CASUAL LEAVE:');
    console.log(`   Total Allocated: ${balance.casual_leave_total} days`);
    console.log(`   Used: ${balance.casual_leave_used} days`);
    console.log(`   Remaining: ${balance.casual_leave_remaining} days`);
    console.log('');
    console.log('🏥 SICK LEAVE:');
    console.log(`   Total Allocated: ${balance.sick_leave_total} days`);
    console.log(`   Used: ${balance.sick_leave_used} days`);
    console.log(`   Remaining: ${balance.sick_leave_remaining} days`);
    console.log('');
    console.log('💰 UNPAID LEAVE:');
    console.log(`   Days Taken: ${balance.unpaid_leave_days || 0} days`);
    console.log('');
    
    console.log('═══════════════════════════════════════════════════\n');
    console.log('✅ VERIFICATION RESULTS:\n');
    
    if (balance.casual_leave_total === 10 && balance.sick_leave_total === 10) {
      console.log('✓ Correct: Both Casual and Sick leave are allocated 10 days each (separate)');
    } else {
      console.log(`✗ Issue: Casual Leave Total: ${balance.casual_leave_total}, Sick Leave Total: ${balance.sick_leave_total}`);
    }
    
    console.log(`\n📊 Total Paid Leave Available: ${balance.casual_leave_remaining + balance.sick_leave_remaining} days`);
    console.log(`   (${balance.casual_leave_remaining} Casual + ${balance.sick_leave_remaining} Sick)`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

verifyLeaveBalances();
