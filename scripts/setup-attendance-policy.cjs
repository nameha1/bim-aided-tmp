const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../lib/firebase/serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function setupDefaultAttendancePolicy() {
  console.log('Setting up default attendance policy...\n');

  const defaultPolicy = {
    office_start_time: '09:00',
    office_end_time: '18:00',
    grace_period_minutes: 15,
    late_arrivals_per_day: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const POLICY_DOC_ID = 'default_policy';

  try {
    // Check if policy already exists
    const existingPolicy = await db
      .collection('attendance_policy')
      .doc(POLICY_DOC_ID)
      .get();
    
    if (existingPolicy.exists) {
      console.log('Attendance policy already exists:');
      const data = existingPolicy.data();
      console.log(`  Office Hours: ${data.office_start_time} - ${data.office_end_time}`);
      console.log(`  Grace Period: ${data.grace_period_minutes} minutes`);
      console.log(`  Late Arrival Rule: ${data.late_arrivals_per_day} late arrivals = 1 day deduction`);
      console.log('\n✓ Skipping setup to avoid overwriting existing policy.');
      console.log('\nTo update the policy, use the Admin Panel > HR > Attendance Policy tab.');
      return;
    }

    // Create default policy
    console.log('Creating default attendance policy...\n');
    
    await db
      .collection('attendance_policy')
      .doc(POLICY_DOC_ID)
      .set(defaultPolicy);

    console.log('✅ Default attendance policy created successfully!\n');
    console.log('Policy Details:');
    console.log(`  📅 Office Hours: ${defaultPolicy.office_start_time} - ${defaultPolicy.office_end_time}`);
    console.log(`  ⏰ Grace Period: ${defaultPolicy.grace_period_minutes} minutes`);
    console.log(`  📊 Late Arrival Rule: ${defaultPolicy.late_arrivals_per_day} late arrivals = 1 day salary deduction`);
    console.log('\nPolicy Summary:');
    
    // Calculate grace period end time
    const [hours, minutes] = defaultPolicy.office_start_time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + defaultPolicy.grace_period_minutes;
    const graceHours = Math.floor(totalMinutes / 60);
    const graceMinutes = totalMinutes % 60;
    const graceEndTime = `${graceHours.toString().padStart(2, '0')}:${graceMinutes.toString().padStart(2, '0')}`;
    
    console.log(`  ✓ Arriving between ${defaultPolicy.office_start_time} - ${graceEndTime}: No penalty`);
    console.log(`  ⚠ Arriving after ${graceEndTime}: Counted as late`);
    console.log(`  💰 Every ${defaultPolicy.late_arrivals_per_day} late arrivals = 1 day salary deduction`);
    
    console.log('\n📝 You can customize these settings from:');
    console.log('   Admin Panel > HR > Attendance Policy');

  } catch (error) {
    console.error('❌ Error setting up attendance policy:', error);
    throw error;
  }
}

// Run the setup
setupDefaultAttendancePolicy()
  .then(() => {
    console.log('\n✨ Setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  });
