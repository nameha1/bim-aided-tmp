/**
 * Reset Admin Password
 * 
 * Run with: node scripts/reset-admin-password.cjs
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

const auth = admin.auth();

const ADMIN_EMAIL = 'admin@bimaided.com';
const NEW_PASSWORD = 'admin123';

async function resetAdminPassword() {
  console.log('🔧 Resetting Admin Password\n');
  console.log('═'.repeat(60));

  try {
    // Get user by email
    console.log('\n1️⃣  Finding admin user...');
    const user = await auth.getUserByEmail(ADMIN_EMAIL);
    console.log(`   ✓ Found user: ${user.email}`);
    console.log(`   ✓ UID: ${user.uid}`);

    // Update password
    console.log('\n2️⃣  Updating password...');
    await auth.updateUser(user.uid, {
      password: NEW_PASSWORD,
      emailVerified: true
    });
    console.log('   ✓ Password updated successfully');

    console.log('\n' + '═'.repeat(60));
    console.log('✅ ADMIN PASSWORD RESET SUCCESSFULLY!\n');
    console.log('📧 Email: ' + ADMIN_EMAIL);
    console.log('🔑 New Password: ' + NEW_PASSWORD);
    console.log('👤 UID: ' + user.uid);
    console.log('\n💡 You can now login at: http://localhost:3000/login\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

resetAdminPassword();
