require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function showDatabaseDetails() {
  console.log('\n📊 Firestore Database Contents\n');
  console.log('═══════════════════════════════════════════════════\n');
  
  // Employees
  const employees = await db.collection('employees').get();
  console.log('👥 EMPLOYEES (' + employees.size + ')');
  employees.docs.forEach(doc => {
    const data = doc.data();
    console.log(`   • ${data.name || 'N/A'} (${data.email}) - ${data.designation || 'N/A'}`);
  });
  
  // Departments
  const departments = await db.collection('departments').get();
  console.log('\n🏢 DEPARTMENTS (' + departments.size + ')');
  departments.docs.forEach(doc => {
    const data = doc.data();
    console.log(`   • ${data.name}`);
  });
  
  // Designations
  const designations = await db.collection('designations').get();
  console.log('\n💼 DESIGNATIONS (' + designations.size + ')');
  designations.docs.forEach(doc => {
    const data = doc.data();
    console.log(`   • ${data.title}`);
  });
  
  // Projects
  const projects = await db.collection('projects').get();
  console.log('\n📋 PROJECTS (' + projects.size + ')');
  projects.docs.forEach(doc => {
    const data = doc.data();
    console.log(`   • ${data.title} - ${data.status}`);
  });
  
  // Users & Roles
  const users = await db.collection('users').get();
  const roles = await db.collection('user_roles').get();
  console.log('\n🔐 USER ACCOUNTS (' + users.size + ')');
  for (const userDoc of users.docs) {
    const userData = userDoc.data();
    const roleDoc = await db.collection('user_roles').doc(userDoc.id).get();
    const role = roleDoc.exists ? roleDoc.data().role : 'unknown';
    console.log(`   • ${userDoc.id} - Role: ${role}`);
  }
  
  // Job Postings
  const jobs = await db.collection('job_postings').get();
  console.log('\n💼 JOB POSTINGS (' + jobs.size + ')');
  jobs.docs.forEach(doc => {
    const data = doc.data();
    console.log(`   • ${data.title} - ${data.status}`);
  });
  
  // Holidays
  const holidays = await db.collection('holidays').get();
  console.log('\n🎉 HOLIDAYS (' + holidays.size + ')');
  holidays.docs.forEach(doc => {
    const data = doc.data();
    console.log(`   • ${data.name} - ${data.date}`);
  });
  
  // Empty collections (ready for use)
  const emptyCollections = ['attendance', 'leave_requests', 'assignments', 'assignment_members', 'payroll', 'payroll_settings', 'transactions', 'invoices', 'ip_whitelist'];
  console.log('\n📂 READY FOR DATA (Empty Collections):');
  for (const collName of emptyCollections) {
    const coll = await db.collection(collName).get();
    if (coll.size === 0) {
      console.log(`   • ${collName} - Ready to use`);
    } else {
      console.log(`   • ${collName} - ${coll.size} documents`);
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('\n✅ Database is ready!');
  console.log('\n📱 Login Credentials:');
  console.log('   Email: admin@bimaided.com');
  console.log('   Password: Admin@123456');
  console.log('\n🌐 Firebase Console:');
  console.log('   https://console.firebase.google.com/project/bimaided-b4447/firestore');
  console.log('\n💻 Local App:');
  console.log('   http://localhost:3005/admin\n');
  
  process.exit(0);
}

showDatabaseDetails().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
