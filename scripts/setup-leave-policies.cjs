const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../lib/firebase/serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function setupDefaultLeavePolicies() {
  console.log('Setting up default leave policies...\n');

  const defaultPolicies = [
    {
      name: 'Casual Leave',
      days_allowed: 10,
      impacts_salary: true,
      description: 'Annual casual leave allowance for personal matters',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      name: 'Sick Leave',
      days_allowed: 14,
      impacts_salary: true,
      description: 'Medical leave for illness or health-related issues',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      name: 'Paid Leave',
      days_allowed: 15,
      impacts_salary: false,
      description: 'Fully paid leave that does not impact salary',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      name: 'Maternity Leave',
      days_allowed: 120,
      impacts_salary: false,
      description: 'Maternity leave as per company policy',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      name: 'Paternity Leave',
      days_allowed: 10,
      impacts_salary: false,
      description: 'Paternity leave for new fathers',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  try {
    // Check if policies already exist
    const existingPolicies = await db.collection('leave_policies').get();
    
    if (!existingPolicies.empty) {
      console.log(`Found ${existingPolicies.size} existing leave policies.`);
      console.log('Skipping setup to avoid duplicates.\n');
      console.log('Existing policies:');
      existingPolicies.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.name}: ${data.days_allowed} days (Impacts Salary: ${data.impacts_salary})`);
      });
      return;
    }

    // Create default policies
    console.log('Creating default leave policies...\n');
    
    for (const policy of defaultPolicies) {
      const docRef = await db.collection('leave_policies').add(policy);
      console.log(`✓ Created: ${policy.name} (${policy.days_allowed} days, Impacts Salary: ${policy.impacts_salary})`);
      console.log(`  ID: ${docRef.id}`);
    }

    console.log('\n✅ Default leave policies created successfully!');
    console.log('\nYou can now manage these policies from the Admin Panel > HR > Leave Policies tab.');
  } catch (error) {
    console.error('❌ Error setting up leave policies:', error);
    throw error;
  }
}

// Run the setup
setupDefaultLeavePolicies()
  .then(() => {
    console.log('\n✨ Setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  });
