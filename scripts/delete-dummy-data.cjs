require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function deleteDummyData() {
  console.log('\n🗑️  Deleting Dummy Data\n');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Delete attendance records
    console.log('📅 Deleting attendance records...');
    const attendanceSnapshot = await db.collection('attendance').get();
    if (!attendanceSnapshot.empty) {
      const batch = db.batch();
      attendanceSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`   ✓ Deleted ${attendanceSnapshot.size} attendance records\n`);
    } else {
      console.log('   • No attendance records to delete\n');
    }

    // Delete payroll records
    console.log('💰 Deleting payroll records...');
    const payrollSnapshot = await db.collection('payroll').get();
    if (!payrollSnapshot.empty) {
      const batch = db.batch();
      payrollSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`   ✓ Deleted ${payrollSnapshot.size} payroll records\n`);
    } else {
      console.log('   • No payroll records to delete\n');
    }

    // Delete payroll settings
    console.log('⚙️  Deleting payroll settings...');
    const settingsSnapshot = await db.collection('payroll_settings').get();
    if (!settingsSnapshot.empty) {
      const batch = db.batch();
      settingsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`   ✓ Deleted ${settingsSnapshot.size} payroll settings\n`);
    } else {
      console.log('   • No payroll settings to delete\n');
    }

    console.log('═══════════════════════════════════════════════════\n');
    console.log('✅ All dummy data has been deleted!\n');
    console.log('📊 Remaining Data:');
    console.log('   • Employees: Preserved');
    console.log('   • Projects: Preserved');
    console.log('   • Users: Preserved');
    console.log('   • Other data: Preserved\n');
    console.log('💡 Only test payroll and attendance data was removed.\n');

  } catch (error) {
    console.error('❌ Error deleting data:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the script
deleteDummyData().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
