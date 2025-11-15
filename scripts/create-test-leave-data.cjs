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

async function createTestLeaveData() {
  try {
    console.log('\n🧪 Creating Test Leave Data...\n');
    console.log('═══════════════════════════════════════════════════\n');

    // Create various leave requests to showcase different scenarios
    const testLeaves = [
      {
        employee_id: 'emp-002',
        employee_name: 'Ayesha Khan',
        leave_type: 'Hourly Leave',
        start_date: '2025-11-18',
        end_date: '2025-11-18',
        days_requested: 4, // 4 hours
        reason: 'Doctor appointment',
        status: 'pending',
        created_at: new Date(),
      },
      {
        employee_id: 'emp-003',
        employee_name: 'Md. Karim Ahmed',
        leave_type: 'Half Day Leave',
        start_date: '2025-11-19',
        end_date: '2025-11-19',
        days_requested: 1, // 1 half day = 0.5 days
        reason: 'Personal work',
        status: 'pending',
        supervisor_id: 'BhXRb5PdZLELYk3DYAA2',
        created_at: new Date(),
      },
      {
        employee_id: 'emp-002',
        employee_name: 'Ayesha Khan',
        leave_type: 'Casual Leave',
        start_date: '2025-11-25',
        end_date: '2025-11-27',
        days_requested: 3,
        reason: 'Family function',
        status: 'pending',
        supervisor_id: 'BhXRb5PdZLELYk3DYAA2',
        created_at: new Date(),
      },
      {
        employee_id: 'emp-003',
        employee_name: 'Md. Karim Ahmed',
        leave_type: 'Unpaid Leave',
        start_date: '2025-12-02',
        end_date: '2025-12-03',
        days_requested: 2,
        reason: 'Emergency travel',
        status: 'pending',
        supervisor_id: 'BhXRb5PdZLELYk3DYAA2',
        created_at: new Date(),
      },
      {
        employee_id: 'emp-002',
        employee_name: 'Ayesha Khan',
        leave_type: 'Sick Leave',
        start_date: '2025-11-20',
        end_date: '2025-11-21',
        days_requested: 2,
        reason: 'Fever and cold',
        status: 'rejected',
        supervisor_id: 'BhXRb5PdZLELYk3DYAA2',
        supervisor_approved: false,
        rejection_reason: 'Need medical certificate for more than 1 day',
        appeal_message: 'I have attached the medical certificate now. The doctor advised 2 days rest.',
        appeal_submitted_at: new Date(),
        appeal_reviewed: false,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
    ];

    console.log('Creating leave requests...\n');

    for (const leave of testLeaves) {
      const leaveRef = await db.collection('leave_requests').add(leave);
      console.log(`✓ Created ${leave.leave_type} for ${leave.employee_name}`);
      console.log(`  ID: ${leaveRef.id}`);
      console.log(`  Duration: ${leave.days_requested} ${leave.leave_type === 'Hourly Leave' ? 'hours' : 'days'}`);
      console.log(`  Status: ${leave.status}`);
      if (leave.appeal_message) {
        console.log(`  📝 Has Appeal: Yes`);
      }
      console.log('');
    }

    console.log('\n📊 Test Data Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Leave Types Created:');
    console.log('  • Hourly Leave (4 hours → 0.5 days from casual)');
    console.log('  • Half Day Leave (1 half day → 0.5 days from casual)');
    console.log('  • Casual Leave (3 days → from casual balance)');
    console.log('  • Unpaid Leave (2 days → impacts salary)');
    console.log('  • Sick Leave with Appeal (rejected → appealed)\n');
    
    console.log('Features Demonstrated:');
    console.log('  ✓ Fractional leave handling');
    console.log('  ✓ Leave appeal system');
    console.log('  ✓ Salary impact categorization');
    console.log('  ✓ Supervisor workflow');
    console.log('\n✅ Test data creation complete!');
    console.log('\nNext Steps:');
    console.log('  1. Login as supervisor (Sakib Rahman) to see pending requests');
    console.log('  2. Approve some requests to see balance deductions');
    console.log('  3. Check admin panel to see salary impact details');
    console.log('  4. Review the appealed request in supervisor dashboard\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestLeaveData();
