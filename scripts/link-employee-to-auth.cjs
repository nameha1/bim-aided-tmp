/**
 * Link Employee Records to Firebase Auth Users
 * 
 * This script finds employees without auth_uid and links them to their
 * corresponding Firebase Auth users based on email.
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function linkEmployeesToAuth() {
  try {
    console.log('🔗 Starting to link employees to auth users...\n');

    // Get all employees
    const employeesSnapshot = await db.collection('employees').get();
    
    if (employeesSnapshot.empty) {
      console.log('No employees found.');
      return;
    }

    let linkedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const doc of employeesSnapshot.docs) {
      const employee = doc.data();
      const employeeId = doc.id;

      // Skip if already has auth_uid
      if (employee.auth_uid) {
        console.log(`⏭️  ${employee.name || employee.email} - Already linked (${employee.auth_uid})`);
        skippedCount++;
        continue;
      }

      // Try to find auth user by email
      if (!employee.email) {
        console.log(`⚠️  ${employeeId} - No email address, cannot link`);
        errorCount++;
        continue;
      }

      try {
        // Check if auth user exists with this email
        const authUser = await auth.getUserByEmail(employee.email);
        
        // Update employee record with auth_uid
        await db.collection('employees').doc(employeeId).update({
          auth_uid: authUser.uid,
          updated_at: new Date().toISOString()
        });

        console.log(`✓ ${employee.name || employee.email} - Linked to auth user ${authUser.uid}`);
        linkedCount++;

        // Also ensure user_roles is set correctly
        const roleDoc = await db.collection('user_roles').doc(authUser.uid).get();
        if (!roleDoc.exists) {
          await db.collection('user_roles').doc(authUser.uid).set({
            role: 'employee',
            email: employee.email,
            employee_id: employeeId,
            created_at: new Date().toISOString()
          });
          console.log(`  └─ Created user_role for ${authUser.uid}`);
        } else {
          // Update employee_id if missing
          const roleData = roleDoc.data();
          if (!roleData.employee_id) {
            await db.collection('user_roles').doc(authUser.uid).update({
              employee_id: employeeId,
              updated_at: new Date().toISOString()
            });
            console.log(`  └─ Updated user_role with employee_id`);
          }
        }

      } catch (authError) {
        if (authError.code === 'auth/user-not-found') {
          console.log(`⚠️  ${employee.name || employee.email} - No auth user found for ${employee.email}`);
          console.log(`   💡 Tip: Create auth account for this employee via the admin panel`);
        } else {
          console.log(`❌ ${employee.name || employee.email} - Error: ${authError.message}`);
        }
        errorCount++;
      }
    }

    console.log('\n' + '─'.repeat(60));
    console.log('Summary:');
    console.log(`✓ Linked: ${linkedCount}`);
    console.log(`⏭️  Skipped (already linked): ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('─'.repeat(60));

    if (linkedCount > 0) {
      console.log('\n✅ Successfully linked employee records to auth users!');
      console.log('   Employees can now log in with their email and password.\n');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

linkEmployeesToAuth();
