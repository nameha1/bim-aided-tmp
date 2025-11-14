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

async function addDummyPayrollData() {
  console.log('\n💰 Adding Dummy Payroll Data\n');
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

    // Set up payroll for current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

    console.log(`📅 Generating payroll for: ${getMonthName(currentMonth)} ${currentYear}\n`);

    // Check if payroll settings exist, if not create default
    const settingsSnapshot = await db.collection('payroll_settings').get();
    if (settingsSnapshot.empty) {
      console.log('⚙️  Creating default payroll settings...');
      await createDefaultSettings();
      console.log('✓ Default settings created\n');
    }

    // Delete existing payroll for this month/year to avoid duplicates
    const existingPayroll = await db.collection('payroll')
      .where('month', '==', currentMonth)
      .where('year', '==', currentYear)
      .get();

    if (!existingPayroll.empty) {
      console.log(`🗑️  Deleting ${existingPayroll.size} existing payroll records for this month...`);
      const batch = db.batch();
      existingPayroll.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log('✓ Existing records deleted\n');
    }

    // Generate payroll for each employee
    console.log('📝 Creating payroll records:\n');
    let count = 0;

    for (const empDoc of employeesSnapshot.docs) {
      const employee = empDoc.data();
      const employeeId = empDoc.id;

      // Generate random but realistic payroll data
      const basicSalary = employee.gross_salary || employee.salary || getRandomSalary(employee.designation);
      const totalPresentDays = getRandomInt(20, 26);
      const totalLateDays = getRandomInt(0, 3);
      const totalAbsentDays = getRandomInt(0, 2);
      const unpaidLeaveDays = getRandomInt(0, 1);
      const festivalBonus = getRandomBonus(basicSalary);
      const loanDeduction = getRandomLoanDeduction();
      const lunchSubsidy = getRandomInt(1000, 3000);
      const ait = calculateAIT(basicSalary);

      // Calculate deductions
      const workingDays = 26; // Standard working days
      const dailyRate = basicSalary / workingDays;
      const lateTolerance = 3;
      const latePenaltyDays = Math.floor(totalLateDays / lateTolerance);
      const latePenalty = latePenaltyDays * dailyRate;
      const unpaidLeaveDeduction = unpaidLeaveDays * dailyRate;
      const absentDeduction = totalAbsentDays * dailyRate;
      const halfDayDeduction = 0; // For simplicity

      const totalDeduction = latePenalty + unpaidLeaveDeduction + halfDayDeduction + absentDeduction + loanDeduction + ait;
      const netPayable = Math.max(0, basicSalary + festivalBonus + lunchSubsidy - totalDeduction);

      // Create payroll record
      const payrollData = {
        employee_id: employeeId,
        month: currentMonth,
        year: currentYear,
        basic_salary: Math.round(basicSalary),
        festival_bonus: Math.round(festivalBonus),
        loan_deduction: Math.round(loanDeduction),
        lunch_subsidy: Math.round(lunchSubsidy),
        ait: Math.round(ait),
        total_present_days: totalPresentDays,
        total_absent_days: totalAbsentDays,
        total_late_days: totalLateDays,
        casual_leave_taken: getRandomInt(0, 2),
        sick_leave_taken: getRandomInt(0, 2),
        unpaid_leave_days: unpaidLeaveDays,
        late_penalty_days: latePenaltyDays,
        late_penalty: Math.round(latePenalty),
        unpaid_leave_deduction: Math.round(unpaidLeaveDeduction),
        half_day_deduction: Math.round(halfDayDeduction),
        absent_deduction: Math.round(absentDeduction),
        total_deduction: Math.round(totalDeduction),
        net_payable_salary: Math.round(netPayable),
        status: count % 3 === 0 ? 'approved' : 'pending', // Mix of approved and pending
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await db.collection('payroll').add(payrollData);

      console.log(`   ✓ ${employee.firstName || employee.name} ${employee.lastName || ''} - ${formatCurrency(netPayable)} (${payrollData.status})`);
      count++;
    }

    console.log(`\n✅ Successfully created ${count} payroll records!\n`);
    console.log('═══════════════════════════════════════════════════\n');
    console.log('📊 Summary:');
    console.log(`   Month: ${getMonthName(currentMonth)} ${currentYear}`);
    console.log(`   Total Records: ${count}`);
    console.log(`   Status Distribution:`);
    console.log(`   - Pending: ${count - Math.floor(count / 3)}`);
    console.log(`   - Approved: ${Math.floor(count / 3)}`);
    console.log('\n💡 Next Steps:');
    console.log('   1. Go to http://localhost:3001/admin');
    console.log('   2. Click on the "Payroll" tab');
    console.log('   3. Review and manage the payroll records');
    console.log('   4. You can edit bonuses, deductions, and approve/reject records\n');

  } catch (error) {
    console.error('❌ Error creating payroll data:', error);
    process.exit(1);
  }

  process.exit(0);
}

async function createDefaultSettings() {
  const defaultSettings = [
    { config_key: 'annual_casual_leave', config_value: '10', created_at: new Date().toISOString() },
    { config_key: 'annual_sick_leave', config_value: '10', created_at: new Date().toISOString() },
    { config_key: 'late_tolerance_count', config_value: '3', created_at: new Date().toISOString() },
    { config_key: 'working_days_per_month', config_value: '26', created_at: new Date().toISOString() },
    { config_key: 'half_day_hours', config_value: '4', created_at: new Date().toISOString() },
    { config_key: 'full_day_hours', config_value: '8', created_at: new Date().toISOString() },
  ];

  for (const setting of defaultSettings) {
    await db.collection('payroll_settings').add(setting);
  }
}

function getRandomSalary(designation) {
  const salaryRanges = {
    'BIM Modeler': [30000, 40000],
    'Sr. BIM Modeler': [40000, 55000],
    'BIM Engineer': [45000, 60000],
    'Sr. BIM Engineer': [60000, 80000],
    'BIM Coordinator': [70000, 90000],
    'Sr. BIM Coordinator': [90000, 120000],
    'BIM Manager': [120000, 180000],
    'Admin': [40000, 60000],
    'default': [35000, 50000]
  };

  const range = salaryRanges[designation] || salaryRanges['default'];
  return getRandomInt(range[0], range[1]);
}

function getRandomBonus(basicSalary) {
  // 10-20% chance of getting a festival bonus
  if (Math.random() < 0.2) {
    return basicSalary * (Math.random() * 0.5 + 0.5); // 50-100% of salary
  }
  return 0;
}

function getRandomLoanDeduction() {
  // 15% chance of having a loan deduction
  if (Math.random() < 0.15) {
    return getRandomInt(5000, 20000);
  }
  return 0;
}

function calculateAIT(basicSalary) {
  // Simple AIT calculation (2-5% of salary for high earners)
  if (basicSalary > 80000) {
    return basicSalary * 0.03; // 3%
  } else if (basicSalary > 50000) {
    return basicSalary * 0.02; // 2%
  }
  return 0;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
  }).format(amount);
}

// Run the script
addDummyPayrollData().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
