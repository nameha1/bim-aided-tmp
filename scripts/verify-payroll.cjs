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

async function verifyPayrollData() {
  console.log('\n🔍 Verifying Payroll Manager Data\n');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // 1. Check Payroll Settings
    console.log('⚙️  PAYROLL SETTINGS:');
    const settingsSnapshot = await db.collection('payroll_settings').get();
    console.log(`   ✓ ${settingsSnapshot.size} configuration(s) found`);
    settingsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`     - ${data.config_key}: ${data.config_value}`);
    });

    // 2. Check Attendance Records
    console.log('\n📅 ATTENDANCE RECORDS:');
    const attendanceSnapshot = await db.collection('attendance').get();
    console.log(`   ✓ ${attendanceSnapshot.size} record(s) found`);
    
    // Group by status
    const statusCount = {};
    attendanceSnapshot.docs.forEach(doc => {
      const data = doc.data();
      statusCount[data.status] = (statusCount[data.status] || 0) + 1;
    });
    
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`     - ${status}: ${count}`);
    });

    // 3. Check Payroll Records
    console.log('\n💰 PAYROLL RECORDS:');
    const payrollSnapshot = await db.collection('payroll')
      .where('month', '==', currentMonth)
      .where('year', '==', currentYear)
      .get();
    
    console.log(`   ✓ ${payrollSnapshot.size} record(s) for ${getMonthName(currentMonth)} ${currentYear}`);
    
    if (payrollSnapshot.size > 0) {
      console.log('\n   Details:');
      for (const doc of payrollSnapshot.docs) {
        const data = doc.data();
        
        // Get employee details
        const empDoc = await db.collection('employees').doc(data.employee_id).get();
        const emp = empDoc.data();
        
        console.log(`\n   📋 ${emp?.firstName || emp?.name || 'Unknown'} ${emp?.lastName || ''}`);
        console.log(`      Employee ID: ${emp?.eid || 'N/A'}`);
        console.log(`      Designation: ${emp?.designation || 'N/A'}`);
        console.log(`      ---------------------------------`);
        console.log(`      Basic Salary: ${formatCurrency(data.basic_salary)}`);
        console.log(`      Festival Bonus: ${formatCurrency(data.festival_bonus || 0)}`);
        console.log(`      Lunch Subsidy: ${formatCurrency(data.lunch_subsidy || 0)}`);
        console.log(`      Loan Deduction: -${formatCurrency(data.loan_deduction || 0)}`);
        console.log(`      AIT: -${formatCurrency(data.ait || 0)}`);
        console.log(`      ---------------------------------`);
        console.log(`      Present Days: ${data.total_present_days}`);
        console.log(`      Absent Days: ${data.total_absent_days}`);
        console.log(`      Late Days: ${data.total_late_days}`);
        console.log(`      Unpaid Leave: ${data.unpaid_leave_days}`);
        console.log(`      ---------------------------------`);
        console.log(`      Late Penalty: -${formatCurrency(data.late_penalty || 0)}`);
        console.log(`      Unpaid Leave Ded.: -${formatCurrency(data.unpaid_leave_deduction || 0)}`);
        console.log(`      Total Deduction: -${formatCurrency(data.total_deduction)}`);
        console.log(`      ---------------------------------`);
        console.log(`      NET PAYABLE: ${formatCurrency(data.net_payable_salary)}`);
        console.log(`      Status: ${data.status.toUpperCase()}`);
      }
    }

    // 4. Summary
    console.log('\n\n═══════════════════════════════════════════════════');
    console.log('\n✅ VERIFICATION COMPLETE!\n');
    console.log('📊 Summary:');
    console.log(`   Settings: ${settingsSnapshot.size}`);
    console.log(`   Attendance: ${attendanceSnapshot.size}`);
    console.log(`   Payroll: ${payrollSnapshot.size}`);
    
    if (payrollSnapshot.size > 0) {
      let totalPayable = 0;
      payrollSnapshot.docs.forEach(doc => {
        totalPayable += doc.data().net_payable_salary;
      });
      console.log(`   Total Payable: ${formatCurrency(totalPayable)}`);
    }

    console.log('\n🌐 Access Payroll Manager:');
    console.log('   http://localhost:3001/admin');
    console.log('   → Click on "Payroll" tab\n');

    console.log('💡 You can now:');
    console.log('   • View and edit payroll records');
    console.log('   • Approve/reject payroll');
    console.log('   • Export to Excel/CSV');
    console.log('   • Configure payroll settings');
    console.log('   • Generate new payroll for different months\n');

  } catch (error) {
    console.error('❌ Error verifying payroll data:', error);
    process.exit(1);
  }

  process.exit(0);
}

function getMonthName(month) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0
  }).format(amount || 0);
}

// Run the script
verifyPayrollData().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
