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

async function debugKarimPayroll() {
  console.log('🔍 DEBUGGING KARIM PAYROLL DATA\n');
  console.log('='.repeat(60));

  // Get Karim's employee data using document ID directly
  const empDoc = await db.collection('employees').doc('emp-003').get();

  if (!empDoc.exists) {
    console.log('❌ Employee emp-003 not found!');
    return;
  }

  const employee = empDoc.data();
  const employeeDocId = 'emp-003';

  console.log('\n📋 EMPLOYEE INFO:');
  console.log(`  Name: ${employee.name}`);
  console.log(`  ID: ${employee.employee_id || employeeDocId}`);
  console.log(`  Salary: BDT ${employee.salary?.toLocaleString()}`);
  console.log(`  Doc ID: ${employeeDocId}`);
  console.log(`  Casual Leave: ${employee.casual_leave_remaining}`);
  console.log(`  Sick Leave: ${employee.sick_leave_remaining}`);
  console.log(`  Unpaid Leave: ${employee.unpaid_leave_days || 0}`);

  // Check leave requests for Aug-Sept
  console.log('\n📝 LEAVE REQUESTS (Aug-Sept 2025):');
  const leaveRequests = await db
    .collection('leave_requests')
    .where('employee_id', '==', employeeDocId)
    .where('status', '==', 'approved')
    .get();

  const augustLeaves = [];
  const septemberLeaves = [];

  leaveRequests.docs.forEach(doc => {
    const leave = doc.data();
    const startDate = new Date(leave.start_date);
    const month = startDate.getMonth() + 1;
    
    if (month === 8) augustLeaves.push({ id: doc.id, ...leave });
    if (month === 9) septemberLeaves.push({ id: doc.id, ...leave });
  });

  console.log(`\n  AUGUST (${augustLeaves.length} requests):`);
  augustLeaves.forEach(leave => {
    console.log(`    ${leave.start_date} to ${leave.end_date}`);
    console.log(`    Type: ${leave.leave_type}, Days: ${leave.days_requested}`);
    console.log(`    Effective Days: ${leave.effective_days || leave.days_requested}`);
  });

  console.log(`\n  SEPTEMBER (${septemberLeaves.length} requests):`);
  septemberLeaves.forEach(leave => {
    console.log(`    ${leave.start_date} to ${leave.end_date}`);
    console.log(`    Type: ${leave.leave_type}, Days: ${leave.days_requested}`);
    console.log(`    Effective Days: ${leave.effective_days || leave.days_requested}`);
  });

  // Check attendance for Aug-Sept
  console.log('\n🕐 ATTENDANCE RECORDS:');
  
  const augustAttendance = await db
    .collection('attendance')
    .where('employee_id', '==', employeeDocId)
    .where('date', '>=', '2025-08-01')
    .where('date', '<=', '2025-08-31')
    .get();

  console.log(`\n  AUGUST (${augustAttendance.docs.length} records):`);
  let augustLate = 0;
  let augustPresent = 0;
  augustAttendance.docs.forEach(doc => {
    const att = doc.data();
    if (att.status === 'present') {
      augustPresent++;
      if (att.is_late) {
        console.log(`    ${att.date}: ${att.status} - LATE ⚠️`);
        augustLate++;
      }
    }
  });
  console.log(`  Total Present: ${augustPresent}`);
  console.log(`  Total Late Days: ${augustLate}`);

  const septemberAttendance = await db
    .collection('attendance')
    .where('employee_id', '==', employeeDocId)
    .where('date', '>=', '2025-09-01')
    .where('date', '<=', '2025-09-30')
    .get();

  console.log(`\n  SEPTEMBER (${septemberAttendance.docs.length} records):`);
  let septLate = 0;
  let septPresent = 0;
  septemberAttendance.docs.forEach(doc => {
    const att = doc.data();
    if (att.status === 'present') {
      septPresent++;
      if (att.is_late) {
        console.log(`    ${att.date}: ${att.status} - LATE ⚠️`);
        septLate++;
      }
    }
  });
  console.log(`  Total Present: ${septPresent}`);
  console.log(`  Total Late Days: ${septLate}`);

  // Check payroll records
  console.log('\n💰 EXISTING PAYROLL RECORDS:');
  const payroll = await db
    .collection('payroll')
    .where('employee_id', '==', employeeDocId)
    .get();

  if (payroll.empty) {
    console.log('  ⚠️  No payroll records found');
  } else {
    payroll.docs.forEach(doc => {
      const data = doc.data();
      if ((data.month === 8 || data.month === 9) && data.year === 2025) {
        console.log(`\n  ${data.month}/${data.year}:`);
        console.log(`    Basic Salary: BDT ${data.basic_salary?.toLocaleString()}`);
        console.log(`    Present Days: ${data.total_present_days}`);
        console.log(`    Late Days: ${data.total_late_days}`);
        console.log(`    Late Penalty Days: ${data.late_penalty_days}`);
        console.log(`    Late Penalty: BDT ${data.late_penalty?.toLocaleString()}`);
        console.log(`    Casual Leave: ${data.casual_leave_taken} days`);
        console.log(`    Sick Leave: ${data.sick_leave_taken} days`);
        console.log(`    Unpaid Leave: ${data.unpaid_leave_days} days`);
        console.log(`    Unpaid Deduction: BDT ${data.unpaid_leave_deduction?.toLocaleString()}`);
        console.log(`    Total Deduction: BDT ${data.total_deduction?.toLocaleString()}`);
        console.log(`    Net Payable: BDT ${data.net_payable_salary?.toLocaleString()}`);
      }
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Debug complete!\n');
}

debugKarimPayroll().catch(console.error);
