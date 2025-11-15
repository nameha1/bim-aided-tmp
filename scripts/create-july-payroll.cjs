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

async function createJulyPayroll() {
  console.log('\n📅 CREATING JULY 2025 PAYROLL');
  console.log('='.repeat(60));

  const employeeId = 'emp-003';

  // Get employee data
  const empDoc = await db.collection('employees').doc(employeeId).get();
  const empData = empDoc.data();
  const basicSalary = empData.salary || 90000;
  const dailyRate = basicSalary / 22;

  console.log(`\n Employee: ${empData.name}`);
  console.log(`  Basic Salary: BDT ${basicSalary.toLocaleString()}`);
  console.log(`  Daily Rate: BDT ${dailyRate.toFixed(2)}\n`);

  // July had 10 sick leave days (paid), no penalties
  console.log('📊 July 2025 Details:');
  console.log(`  Sick Leave: 10 days (PAID)`);
  console.log(`  Late Days: 0`);
  console.log(`  Deductions: BDT 0.00`);
  console.log(`  Net Payable: BDT ${basicSalary.toLocaleString()}\n`);

  // Create July payroll record
  await db.collection('payroll').add({
    employee_id: employeeId,
    month: 7,
    year: 2025,
    basic_salary: basicSalary,
    festival_bonus: 0,
    loan_deduction: 0,
    lunch_subsidy: 0,
    ait: 0,
    total_present_days: 12, // Approximate working days after 10 days leave
    total_absent_days: 0,
    total_late_days: 0,
    total_half_days: 0,
    casual_leave_taken: 0,
    sick_leave_taken: 10,
    unpaid_leave_days: 0,
    late_penalty_days: 0,
    late_penalty: 0,
    unpaid_leave_deduction: 0,
    half_day_deduction: 0,
    absent_deduction: 0,
    total_deduction: 0,
    net_payable_salary: basicSalary,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  console.log('✅ July 2025 payroll created successfully!\n');
}

createJulyPayroll().catch(console.error);
