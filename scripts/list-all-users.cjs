/**
 * List All Firebase Auth Users
 * 
 * Run with: node scripts/list-all-users.cjs
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
const db = admin.firestore();

async function listAllUsers() {
  console.log('👥 Listing All Firebase Auth Users\n');
  console.log('═'.repeat(80));

  try {
    const listUsersResult = await auth.listUsers(1000);
    
    console.log(`\n📊 Total Users: ${listUsersResult.users.length}\n`);
    
    for (const user of listUsersResult.users) {
      console.log('─'.repeat(80));
      console.log(`📧 Email: ${user.email || 'N/A'}`);
      console.log(`👤 UID: ${user.uid}`);
      console.log(`📝 Display Name: ${user.displayName || 'N/A'}`);
      console.log(`✅ Email Verified: ${user.emailVerified}`);
      console.log(`🔑 Password Hash: ${user.passwordHash ? 'Set' : 'Not Set'}`);
      console.log(`📅 Created: ${new Date(user.metadata.creationTime).toLocaleString()}`);
      console.log(`📅 Last Sign In: ${user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'Never'}`);
      
      // Check role
      try {
        const roleDoc = await db.collection('user_roles').doc(user.uid).get();
        if (roleDoc.exists) {
          const roleData = roleDoc.data();
          console.log(`🎭 Role: ${roleData.role || 'N/A'}`);
        } else {
          console.log(`🎭 Role: No role assigned`);
        }
      } catch (error) {
        console.log(`🎭 Role: Error fetching role`);
      }
      
      console.log('');
    }
    
    console.log('═'.repeat(80));

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

listAllUsers();
