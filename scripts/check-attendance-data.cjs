require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkAttendanceData() {
  try {
    console.log('🔍 Checking attendance data...\n');

    // Get all attendance records
    const attendanceSnapshot = await db.collection('attendance').get();
    
    console.log(`📋 Found ${attendanceSnapshot.size} attendance records\n`);

    for (const doc of attendanceSnapshot.docs) {
      const data = doc.data();
      console.log(`\n📌 Attendance ID: ${doc.id}`);
      console.log(`   Date: ${data.date}`);
      console.log(`   Employee ID: ${data.employee_id || '❌ MISSING'}`);
      console.log(`   Status: ${data.status}`);
      console.log(`   Check-in: ${data.check_in_time ? 'Yes' : 'No'}`);
      console.log(`   Check-out: ${data.check_out_time ? 'Yes' : 'No'}`);
      console.log(`   Manual: ${data.manually_added || false}`);

      // Try to fetch employee if employee_id exists
      if (data.employee_id) {
        try {
          const employeeDoc = await db.collection('employees').doc(data.employee_id).get();
          if (employeeDoc.exists) {
            const emp = employeeDoc.data();
            console.log(`   ✅ Employee Found: ${emp.firstName || emp.first_name} ${emp.lastName || emp.last_name}`);
          } else {
            console.log(`   ❌ Employee NOT found in database with ID: ${data.employee_id}`);
          }
        } catch (err) {
          console.log(`   ❌ Error fetching employee: ${err.message}`);
        }
      }
    }

    console.log('\n\n📊 Summary:');
    console.log(`   Total Attendance Records: ${attendanceSnapshot.size}`);
    
    const missingEmployeeId = attendanceSnapshot.docs.filter(doc => !doc.data().employee_id);
    console.log(`   Records without employee_id: ${missingEmployeeId.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkAttendanceData();
