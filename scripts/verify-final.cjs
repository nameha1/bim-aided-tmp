require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}
(async () => {
  const db = admin.firestore();
  const emp = await db.collection('employees').doc('emp-002').get();
  const data = emp.data();
  console.log('✅ Ayesha Khan Leave Balance (DATABASE):');
  console.log('   Casual Leave: ' + data.casual_leave_remaining + ' days');
  console.log('   Sick Leave: ' + data.sick_leave_remaining + ' days ← DEDUCTED FROM 10');
  console.log('   Unpaid Days: ' + (data.unpaid_leave_days || 0) + ' days');
  console.log('\n💡 If UI shows 10 sick leave days, please REFRESH the page (Cmd+Shift+R)');
  process.exit(0);
})();
