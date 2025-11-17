/**
 * Delete All Employee Data from Firestore
 * 
 * This script removes all employee-related data including:
 * - employees collection
 * - users collection
 * - user_roles collection
 * - attendance records
 * - leave_requests
 * - leave_balances
 * - payroll records
 * - project_assignments
 * - Firebase Auth users (employee accounts only, preserving admin)
 * 
 * Run with: node scripts/delete-all-employee-data.cjs
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

// Admin email to preserve (change this to your admin email)
const ADMIN_EMAIL = 'admin@bimaided.com';

async function deleteCollection(collectionName, batchSize = 100) {
  const collectionRef = db.collection(collectionName);
  const query = collectionRef.limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve, reject);
  });
}

async function deleteQueryBatch(query, resolve, reject) {
  try {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
      resolve();
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`   Deleted ${snapshot.size} documents`);

    // Recurse on the next batch
    process.nextTick(() => {
      deleteQueryBatch(query, resolve, reject);
    });
  } catch (error) {
    reject(error);
  }
}

async function deleteEmployeeAuthAccounts() {
  console.log('\n🔥 Deleting Firebase Auth accounts (employees only)...');
  
  try {
    // Get all users
    const listUsersResult = await auth.listUsers();
    const users = listUsersResult.users;
    
    let deletedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      // Skip admin user
      if (user.email === ADMIN_EMAIL) {
        console.log(`   ⏭️  Skipped admin: ${user.email}`);
        skippedCount++;
        continue;
      }

      // Delete user
      try {
        await auth.deleteUser(user.uid);
        console.log(`   ✓ Deleted auth user: ${user.email || user.uid}`);
        deletedCount++;
      } catch (error) {
        console.error(`   ❌ Failed to delete ${user.email}: ${error.message}`);
      }
    }

    console.log(`\n   📊 Auth Summary: ${deletedCount} deleted, ${skippedCount} skipped`);
  } catch (error) {
    console.error('   ❌ Error listing/deleting auth users:', error.message);
  }
}

async function deleteEmployeeData() {
  console.log('🗑️  DELETING ALL EMPLOYEE DATA FROM FIRESTORE\n');
  console.log('⚠️  This will remove:');
  console.log('   - All employees');
  console.log('   - All attendance records');
  console.log('   - All leave requests & balances');
  console.log('   - All payroll records');
  console.log('   - All project assignments');
  console.log('   - All Firebase Auth accounts (except admin)');
  console.log('   - All user roles & user documents\n');
  console.log('═'.repeat(60));

  try {
    // 1. Delete employees collection
    console.log('\n1️⃣  Deleting employees collection...');
    await deleteCollection('employees');
    console.log('   ✓ Employees deleted');

    // 2. Delete attendance collection
    console.log('\n2️⃣  Deleting attendance collection...');
    await deleteCollection('attendance');
    console.log('   ✓ Attendance records deleted');

    // 3. Delete leave_requests collection
    console.log('\n3️⃣  Deleting leave_requests collection...');
    await deleteCollection('leave_requests');
    console.log('   ✓ Leave requests deleted');

    // 4. Delete leave_balances collection
    console.log('\n4️⃣  Deleting leave_balances collection...');
    await deleteCollection('leave_balances');
    console.log('   ✓ Leave balances deleted');

    // 5. Delete payroll collection
    console.log('\n5️⃣  Deleting payroll collection...');
    await deleteCollection('payroll');
    console.log('   ✓ Payroll records deleted');

    // 6. Delete project_assignments collection
    console.log('\n6️⃣  Deleting project_assignments collection...');
    await deleteCollection('project_assignments');
    console.log('   ✓ Project assignments deleted');

    // 7. Delete users collection
    console.log('\n7️⃣  Deleting users collection...');
    await deleteCollection('users');
    console.log('   ✓ Users deleted');

    // 8. Delete user_roles collection
    console.log('\n8️⃣  Deleting user_roles collection...');
    await deleteCollection('user_roles');
    console.log('   ✓ User roles deleted');

    // 9. Delete Firebase Auth accounts
    await deleteEmployeeAuthAccounts();

    console.log('\n' + '═'.repeat(60));
    console.log('✅ ALL EMPLOYEE DATA DELETED SUCCESSFULLY!');
    console.log('\n💡 Next steps:');
    console.log('   1. You can now add new employees through the admin panel');
    console.log('   2. Or run test data scripts to populate sample data');
    console.log('   3. The following collections remain intact:');
    console.log('      - departments');
    console.log('      - holidays');
    console.log('      - leave_policies');
    console.log('      - projects');
    console.log('      - clients');
    console.log('      - ip_whitelist');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run the deletion
deleteEmployeeData();
