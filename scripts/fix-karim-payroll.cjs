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

async function fixKarimPayroll() {
  console.log('\n🔧 FIXING KARIM PAYROLL');
  console.log('='.repeat(60));

  const employeeId = 'emp-003';

  // Step 1: Delete existing August and September payroll records
  console.log('\n📝 Step 1: Deleting old payroll records...');
  const payrollSnapshot = await db
    .collection('payroll')
    .where('employee_id', '==', employeeId)
    .get();

  const batch = db.batch();
  let deletedCount = 0;

  payrollSnapshot.docs.forEach(doc => {
    const data = doc.data();
    if ((data.month === 8 || data.month === 9) && data.year === 2025) {
      batch.delete(doc.ref);
      deletedCount++;
      console.log(`  ✗ Deleting payroll for ${data.month}/2025`);
    }
  });

  if (deletedCount > 0) {
    await batch.commit();
    console.log(`✓ Deleted ${deletedCount} old payroll records\n`);
  } else {
    console.log('  No old payroll records found\n');
  }

  // Step 2: Get employee data
  console.log('📊 Step 2: Fetching employee data...');
  const empDoc = await db.collection('employees').doc(employeeId).get();
  const empData = empDoc.data();
  const basicSalary = empData.salary || 90000;
  const dailyRate = basicSalary / 22; // 22 working days avg
  
  console.log(`  Employee: ${empData.name}`);
  console.log(`  Basic Salary: BDT ${basicSalary.toLocaleString()}`);
  console.log(`  Daily Rate: BDT ${dailyRate.toFixed(2)}\n`);

  // Step 3: Calculate August payroll
  console.log('�� Step 3: Calculating August 2025 payroll...');
  
  // Get August attendance
  const augustAtt = await db
    .collection('attendance')
    .where('employee_id', '==', employeeId)
    .get();

  let augustPresent = 0;
  let augustLate = 0;

  augustAtt.docs.forEach(doc => {
    const att = doc.data();
    const attDate = new Date(att.date);
    if (attDate.getMonth() === 7 && attDate.getFullYear() === 2025) {
      if (att.status === 'present') {
        augustPresent++;
        if (att.is_late) augustLate++;
      }
    }
  });

  const augustLatePenaltyDays = Math.floor(augustLate / 3);
  const augustLatePenalty = augustLatePenaltyDays * dailyRate;

  console.log(`  Present Days: ${augustPresent}`);
  console.log(`  Late Days: ${augustLate}`);
  console.log(`  Late Penalty Days: ${augustLatePenaltyDays} (${augustLate}/3)`);
  console.log(`  Late Penalty: BDT ${augustLatePenalty.toFixed(2)}`);
  console.log(`  Casual Leave Used: 10 days (paid)`);
  console.log(`  Total Deduction: BDT ${augustLatePenalty.toFixed(2)}`);
  console.log(`  Net Payable: BDT ${(basicSalary - augustLatePenalty).toFixed(2)}\n`);

  // Create August payroll record
  await db.collection('payroll').add({
    employee_id: employeeId,
    month: 8,
    year: 2025,
    basic_salary: basicSalary,
    festival_bonus: 0,
    loan_deduction: 0,
    lunch_subsidy: 0,
    ait: 0,
    total_present_days: augustPresent,
    total_absent_days: 0,
    total_late_days: augustLate,
    total_half_days: 0,
    casual_leave_taken: 10,
    sick_leave_taken: 0,
    unpaid_leave_days: 0,
    late_penalty_days: augustLatePenaltyDays,
    late_penalty: augustLatePenalty,
    unpaid_leave_deduction: 0,
    half_day_deduction: 0,
    absent_deduction: 0,
    total_deduction: augustLatePenalty,
    net_payable_salary: basicSalary - augustLatePenalty,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  console.log('✓ August 2025 payroll created\n');

  // Step 4: Calculate September payroll
  console.log('📅 Step 4: Calculating September 2025 payroll...');
  
  // Get September attendance
  const septAtt = await db
    .collection('attendance')
    .where('employee_id', '==', employeeId)
    .get();

  let septPresent = 0;
  let septLate = 0;

  septAtt.docs.forEach(doc => {
    const att = doc.data();
    const attDate = new Date(att.date);
    if (attDate.getMonth() === 8 && attDate.getFullYear() === 2025) {
      if (att.status === 'present') {
        septPresent++;
        if (att.is_late) septLate++;
      }
    }
  });

  const septLatePenaltyDays = Math.floor(septLate / 3);
  const septLatePenalty = septLatePenaltyDays * dailyRate;
  const unpaidDays = 3; // 6 half-days = 3 full days
  const unpaidDeduction = unpaidDays * dailyRate;
  const septTotalDeduction = septLatePenalty + unpaidDeduction;

  console.log(`  Present Days: ${septPresent}`);
  console.log(`  Late Days: ${septLate}`);
  console.log(`  Late Penalty Days: ${septLatePenaltyDays} (${septLate}/3)`);
  console.log(`  Late Penalty: BDT ${septLatePenalty.toFixed(2)}`);
  console.log(`  Unpaid Leave Days: ${unpaidDays} (6 half-days)`);
  console.log(`  Unpaid Leave Deduction: BDT ${unpaidDeduction.toFixed(2)}`);
  console.log(`  Total Deduction: BDT ${septTotalDeduction.toFixed(2)}`);
  console.log(`  Net Payable: BDT ${(basicSalary - septTotalDeduction).toFixed(2)}\n`);

  // Create September payroll record
  await db.collection('payroll').add({
    employee_id: employeeId,
    month: 9,
    year: 2025,
    basic_salary: basicSalary,
    festival_bonus: 0,
    loan_deduction: 0,
    lunch_subsidy: 0,
    ait: 0,
    total_present_days: septPresent,
    total_absent_days: 0,
    total_late_days: septLate,
    total_half_days: 0,
    casual_leave_taken: 0,
    sick_leave_taken: 0,
    unpaid_leave_days: unpaidDays,
    late_penalty_days: septLatePenaltyDays,
    late_penalty: septLatePenalty,
    unpaid_leave_deduction: unpaidDeduction,
    half_day_deduction: 0,
    absent_deduction: 0,
    total_deduction: septTotalDeduction,
    net_payable_salary: basicSalary - septTotalDeduction,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  console.log('✓ September 2025 payroll created\n');

  console.log('='.repeat(60));
  console.log('✅ PAYROLL FIX COMPLETE!\n');
  console.log('Summary:');
  console.log(`  August: BDT ${(basicSalary - augustLatePenalty).toFixed(2)} (Late penalty: ${augustLatePenalty.toFixed(2)})`);
  console.log(`  September: BDT ${(basicSalary - septTotalDeduction).toFixed(2)} (Deductions: ${septTotalDeduction.toFixed(2)})`);
  console.log('\n');
}

fixKarimPayroll().catch(console.error);
