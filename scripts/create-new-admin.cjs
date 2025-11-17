/**
 * Create New Admin User
 * Email: info@bimaided.com
 * 
 * Run with: node scripts/create-new-admin.cjs
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
const auth = admin.auth();

const ADMIN_EMAIL = 'info@bimaided.com';
const ADMIN_PASSWORD = 'C?18dr!4';
const ADMIN_NAME = 'Admin';

async function createNewAdmin() {
  console.log('🔧 Creating New Admin User\n');
  console.log('═'.repeat(60));

  try {
    // Step 1: Check if user already exists
    console.log('\n1️⃣  Checking if user already exists...');
    let user;
    try {
      user = await auth.getUserByEmail(ADMIN_EMAIL);
      console.log(`   ⚠️  User already exists: ${user.email}`);
      console.log(`   Using existing UID: ${user.uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('   ✓ User does not exist, creating new user...');
        
        // Create Firebase Auth user
        user = await auth.createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          displayName: ADMIN_NAME,
          emailVerified: true
        });
        
        console.log(`   ✓ Created auth user: ${user.email}`);
        console.log(`   ✓ UID: ${user.uid}`);
      } else {
        throw error;
      }
    }

    // Step 2: Create employee document
    console.log('\n2️⃣  Creating employee document...');
    const employeeRef = db.collection('employees').doc('emp-001');
    const employeeSnap = await employeeRef.get();

    if (!employeeSnap.exists) {
      await employeeRef.set({
        eid: 'BIM001',
        first_name: 'Admin',
        last_name: 'User',
        email: ADMIN_EMAIL,
        phone: '+8801700000000',
        department_id: 'dept-001',
        designation: 'Administrator',
        joining_date: new Date().toISOString(),
        status: 'active',
        gross_salary: 0,
        auth_uid: user.uid,
        casual_leave_remaining: 10,
        sick_leave_remaining: 10,
        unpaid_leave_days: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      console.log('   ✓ Employee document created (emp-001)');
    } else {
      await employeeRef.update({
        auth_uid: user.uid,
        updated_at: new Date().toISOString()
      });
      console.log('   ✓ Employee document updated with auth_uid');
    }

    // Step 3: Create user document
    console.log('\n3️⃣  Creating user document...');
    const userRef = db.collection('users').doc(user.uid);
    await userRef.set({
      email: ADMIN_EMAIL,
      displayName: ADMIN_NAME,
      role: 'admin',
      employee_id: 'emp-001',
      auth_uid: user.uid,
      created_at: new Date().toISOString()
    });
    console.log('   ✓ User document created');

    // Step 4: Set admin role
    console.log('\n4️⃣  Setting admin role...');
    const roleRef = db.collection('user_roles').doc(user.uid);
    await roleRef.set({
      role: 'admin',
      email: ADMIN_EMAIL,
      employee_id: 'emp-001',
      created_at: new Date().toISOString()
    });
    console.log('   ✓ Admin role set');

    console.log('\n' + '═'.repeat(60));
    console.log('✅ ADMIN USER CREATED SUCCESSFULLY!\n');
    console.log('📧 Email: ' + ADMIN_EMAIL);
    console.log('🔑 Password: ' + ADMIN_PASSWORD);
    console.log('👤 UID: ' + user.uid);
    console.log('🆔 Employee ID: emp-001\n');
    console.log('💡 You can now login at: http://localhost:3000/login\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

createNewAdmin();
