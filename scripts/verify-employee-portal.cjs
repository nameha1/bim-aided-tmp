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

async function verifyEmployeePortal() {
  try {
    const employeeId = 'emp-003';
    
    console.log('\n🔍 EMPLOYEE PORTAL VERIFICATION');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Get employee data
    const empDoc = await db.collection('employees').doc(employeeId).get();
    const empData = empDoc.data();
    
    console.log('1️⃣ LEAVE BALANCE DISPLAY');
    console.log('──────────────────────────────────────────────────');
    console.log(`Casual Leave: ${empData.casual_leave_remaining || 0}/10 days remaining`);
    console.log(`Sick Leave: ${empData.sick_leave_remaining || 0}/10 days remaining`);
    console.log(`Unpaid Leave: ${empData.unpaid_leave_days || 0} days taken\n`);
    
    if (empData.casual_leave_remaining === 0 && empData.sick_leave_remaining === 0) {
      console.log('⚠️  WARNING: Both leave balances exhausted!');
      console.log('   Any new leave requests will impact salary.\n');
    }
    
    // Get leave history
    console.log('2️⃣ LEAVE REQUEST HISTORY');
    console.log('──────────────────────────────────────────────────');
    
    const leaveSnapshot = await db.collection('leave_requests')
      .where('employee_id', '==', employeeId)
      .get();
    
    const leavesByMonth = {};
    
    leaveSnapshot.docs.forEach(doc => {
      const leave = doc.data();
      const date = new Date(leave.start_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!leavesByMonth[monthKey]) {
        leavesByMonth[monthKey] = [];
      }
      
      leavesByMonth[monthKey].push({
        id: doc.id,
        ...leave
      });
    });
    
    const monthNames = {
      '2025-07': 'July 2025',
      '2025-08': 'August 2025',
      '2025-09': 'September 2025'
    };
    
    for (const [month, leaves] of Object.entries(leavesByMonth).sort()) {
      console.log(`\n${monthNames[month] || month}:`);
      leaves.forEach(leave => {
        const effectiveDays = leave.effective_days || leave.days_requested;
        const isPaid = leave.leave_type === 'Sick Leave' || leave.leave_type === 'Casual Leave';
        const isUnpaid = !isPaid || (effectiveDays > (leave.leave_type === 'Sick Leave' ? empData.sick_leave_remaining : empData.casual_leave_remaining));
        
        console.log(`  • ${leave.leave_type}`);
        console.log(`    Dates: ${leave.start_date} to ${leave.end_date}`);
        console.log(`    Days: ${effectiveDays} day(s)`);
        console.log(`    Status: ${leave.status}`);
        console.log(`    Impact: ${isPaid && !isUnpaid ? 'PAID (from balance)' : 'UNPAID (salary deduction)'}`);
      });
    }
    
    // Calculate total leaves by type
    console.log('\n\n3️⃣ YEAR-TO-DATE SUMMARY (2025)');
    console.log('──────────────────────────────────────────────────');
    
    let totalCasual = 0;
    let totalSick = 0;
    let totalUnpaid = 0;
    let totalHalfDays = 0;
    
    leaveSnapshot.docs.forEach(doc => {
      const leave = doc.data();
      const effectiveDays = leave.effective_days || leave.days_requested || 0;
      
      if (leave.status === 'approved') {
        if (leave.leave_type === 'Casual Leave') {
          totalCasual += effectiveDays;
        } else if (leave.leave_type === 'Sick Leave') {
          totalSick += effectiveDays;
        } else if (leave.leave_type === 'Half Day Leave') {
          totalHalfDays += effectiveDays;
        } else if (leave.leave_type === 'Unpaid Leave') {
          totalUnpaid += effectiveDays;
        }
      }
    });
    
    console.log(`Casual Leave Used: ${totalCasual} days (10 allocated)`);
    console.log(`Sick Leave Used: ${totalSick} days (10 allocated)`);
    console.log(`Half-Day Leaves: ${totalHalfDays} days (${totalHalfDays * 2} half-days)`);
    console.log(`Unpaid Leave: ${totalUnpaid} days\n`);
    
    // Salary impact
    const dailyRate = (empData.salary || 90000) / 22;
    const unpaidImpact = totalHalfDays * dailyRate;
    
    console.log('💰 SALARY IMPACT:');
    console.log('──────────────────────────────────────────────────');
    console.log(`Daily Rate: BDT ${dailyRate.toFixed(2)}`);
    console.log(`Unpaid Days: ${totalHalfDays} days`);
    console.log(`Salary Deduction: BDT ${unpaidImpact.toFixed(2)}\n`);
    
    // Get attendance for August (late days)
    console.log('4️⃣ ATTENDANCE SUMMARY');
    console.log('──────────────────────────────────────────────────');
    
    const attendanceSnapshot = await db.collection('attendance')
      .where('employee_id', '==', employeeId)
      .get();
    
    const attendanceByMonth = {};
    
    attendanceSnapshot.docs.forEach(doc => {
      const att = doc.data();
      const date = new Date(att.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!attendanceByMonth[monthKey]) {
        attendanceByMonth[monthKey] = { present: 0, late: 0 };
      }
      
      if (att.status === 'present') {
        attendanceByMonth[monthKey].present++;
        if (att.is_late) {
          attendanceByMonth[monthKey].late++;
        }
      }
    });
    
    for (const [month, stats] of Object.entries(attendanceByMonth).sort()) {
      console.log(`\n${monthNames[month] || month}:`);
      console.log(`  Present Days: ${stats.present}`);
      console.log(`  Late Arrivals: ${stats.late}`);
      if (stats.late >= 3) {
        const penaltyDays = Math.floor(stats.late / 3);
        const penalty = penaltyDays * dailyRate;
        console.log(`  ⚠️  Late Penalty: ${penaltyDays} day(s) = BDT ${penalty.toFixed(2)}`);
      } else {
        console.log(`  ✓ No late penalty (within tolerance)`);
      }
    }
    
    console.log('\n\n5️⃣ WHAT EMPLOYEE SHOULD SEE IN PORTAL');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('Dashboard "Leave Balance" Card:');
    console.log('  ┌─────────────────────────────────────┐');
    console.log('  │  📅 Casual Leave                   │');
    console.log(`  │     0 of 10 days remaining         │`);
    console.log('  │     Used: 0 days                    │');
    console.log('  │                                     │');
    console.log('  │  🏥 Sick Leave                     │');
    console.log(`  │     0 of 10 days remaining         │`);
    console.log('  │     Used: 0 days                    │');
    console.log('  │                                     │');
    console.log('  │  ⏰ Unpaid Leave                   │');
    console.log(`  │     ${empData.unpaid_leave_days || 0} days taken this year           │`);
    console.log('  │     (After exceeding limits)        │');
    console.log('  └─────────────────────────────────────┘\n');
    
    console.log('Leave Policy Note:');
    console.log('  ℹ️  Casual and Sick leaves are paid leaves (no salary');
    console.log('     deduction). When you exceed your allocated leave');
    console.log('     balance, additional days will be marked as unpaid');
    console.log('     leave and will be deducted from your salary at the');
    console.log('     daily rate (Gross Salary ÷ Working Days).\n');
    
    console.log('\n✅ Verification Complete!\n');
    console.log('To View in Portal:');
    console.log('──────────────────────────────────────────────────');
    console.log('1. Login as emp3@gmail.com (Md. Karim Ahmed)');
    console.log('2. Navigate to Employee Dashboard');
    console.log('3. Check "Leave Balance" section');
    console.log('4. Review "Leave Request History" table');
    console.log('5. Verify balances match expectations\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyEmployeePortal();
