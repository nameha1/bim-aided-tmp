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

async function addDummyAttendance() {
  console.log('\n📅 Adding Dummy Attendance Data\n');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Get all active employees
    const employeesSnapshot = await db.collection('employees')
      .where('status', '==', 'active')
      .get();

    if (employeesSnapshot.empty) {
      console.log('❌ No active employees found. Please add employees first.');
      process.exit(1);
    }

    console.log(`✓ Found ${employeesSnapshot.size} active employees\n`);

    // Generate attendance for the current month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const monthName = getMonthName(currentMonth + 1);

    // Get first and last day of current month
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const today = new Date();

    console.log(`📅 Generating attendance for: ${monthName} ${currentYear}`);
    console.log(`   From: ${formatDate(firstDay)} to ${formatDate(Math.min(today, lastDay))}\n`);

    // Delete existing attendance for this month
    const existingAttendance = await db.collection('attendance')
      .where('date', '>=', formatDate(firstDay))
      .where('date', '<=', formatDate(lastDay))
      .get();

    if (!existingAttendance.empty) {
      console.log(`🗑️  Deleting ${existingAttendance.size} existing attendance records...`);
      const batch = db.batch();
      existingAttendance.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log('✓ Existing records deleted\n');
    }

    let totalRecords = 0;
    console.log('📝 Creating attendance records:\n');

    // For each employee
    for (const empDoc of employeesSnapshot.docs) {
      const employee = empDoc.data();
      const employeeId = empDoc.id;
      let employeeRecords = 0;
      let presentDays = 0;
      let lateDays = 0;
      let absentDays = 0;

      // Generate attendance for each working day (Monday-Friday)
      for (let d = new Date(firstDay); d <= Math.min(today, lastDay); d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        
        // Skip weekends (Saturday = 6, Sunday = 0)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          continue;
        }

        const dateStr = formatDate(d);
        
        // 95% chance of being present
        const isPresent = Math.random() < 0.95;
        
        if (isPresent) {
          // Generate random check-in and check-out times
          const checkIn = generateCheckInTime(d);
          const checkOut = generateCheckOutTime(d);
          const isLate = checkIn.getHours() >= 9 || (checkIn.getHours() === 9 && checkIn.getMinutes() > 15);
          
          const attendanceData = {
            employee_id: employeeId,
            date: dateStr,
            check_in: checkIn.toISOString(),
            check_out: checkOut.toISOString(),
            status: 'present',
            is_late: isLate,
            work_hours: calculateWorkHours(checkIn, checkOut),
            created_at: new Date().toISOString(),
          };

          await db.collection('attendance').add(attendanceData);
          presentDays++;
          if (isLate) lateDays++;
          employeeRecords++;
        } else {
          // Absent or on leave
          const leaveTypes = ['casual_leave', 'sick_leave', 'absent'];
          const leaveType = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
          
          const attendanceData = {
            employee_id: employeeId,
            date: dateStr,
            status: leaveType,
            created_at: new Date().toISOString(),
          };

          await db.collection('attendance').add(attendanceData);
          if (leaveType === 'absent') absentDays++;
          employeeRecords++;
        }

        totalRecords++;
      }

      console.log(`   ✓ ${employee.firstName || employee.name} ${employee.lastName || ''}`);
      console.log(`      Present: ${presentDays}, Late: ${lateDays}, Absent: ${absentDays}, Total: ${employeeRecords} days`);
    }

    console.log(`\n✅ Successfully created ${totalRecords} attendance records!\n`);
    console.log('═══════════════════════════════════════════════════\n');
    console.log('📊 Summary:');
    console.log(`   Month: ${monthName} ${currentYear}`);
    console.log(`   Employees: ${employeesSnapshot.size}`);
    console.log(`   Total Records: ${totalRecords}`);
    console.log(`   Avg Records/Employee: ${Math.round(totalRecords / employeesSnapshot.size)}`);
    console.log('\n💡 Next Steps:');
    console.log('   1. Go to http://localhost:3001/admin');
    console.log('   2. Click on the "Attendance" tab');
    console.log('   3. View the generated attendance records');
    console.log('   4. Now you can generate payroll based on this attendance\n');

  } catch (error) {
    console.error('❌ Error creating attendance data:', error);
    process.exit(1);
  }

  process.exit(0);
}

function generateCheckInTime(date) {
  // Check-in between 8:30 AM and 9:30 AM
  const baseTime = new Date(date);
  baseTime.setHours(8, 30, 0, 0);
  const randomMinutes = Math.floor(Math.random() * 60); // 0-60 minutes
  baseTime.setMinutes(baseTime.getMinutes() + randomMinutes);
  return baseTime;
}

function generateCheckOutTime(date) {
  // Check-out between 5:00 PM and 7:00 PM
  const baseTime = new Date(date);
  baseTime.setHours(17, 0, 0, 0);
  const randomMinutes = Math.floor(Math.random() * 120); // 0-120 minutes (2 hours)
  baseTime.setMinutes(baseTime.getMinutes() + randomMinutes);
  return baseTime;
}

function calculateWorkHours(checkIn, checkOut) {
  const diff = checkOut - checkIn;
  const hours = diff / (1000 * 60 * 60);
  return Math.round(hours * 10) / 10; // Round to 1 decimal
}

function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonthName(month) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
}

// Run the script
addDummyAttendance().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
