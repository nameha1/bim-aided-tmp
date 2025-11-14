const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const projectId = admin.app().options.projectId;

console.log('\n🔥 Firestore Index Creation Guide\n');
console.log('='.repeat(60));
console.log(`\nProject ID: ${projectId}\n`);

const indexes = [
  {
    name: 'Leave Requests - Status + Created At',
    collection: 'leave_requests',
    fields: [
      { field: 'status', direction: 'ASCENDING' },
      { field: 'created_at', direction: 'DESCENDING' }
    ]
  },
  {
    name: 'Leave Requests - Supervisor ID + Created At',
    collection: 'leave_requests',
    fields: [
      { field: 'supervisor_id', direction: 'ASCENDING' },
      { field: 'created_at', direction: 'DESCENDING' }
    ]
  },
  {
    name: 'Leave Requests - Employee ID + Created At',
    collection: 'leave_requests',
    fields: [
      { field: 'employee_id', direction: 'ASCENDING' },
      { field: 'created_at', direction: 'DESCENDING' }
    ]
  }
];

console.log('📋 Required Indexes:\n');

indexes.forEach((index, i) => {
  console.log(`${i + 1}. ${index.name}`);
  console.log(`   Collection: ${index.collection}`);
  console.log(`   Fields:`);
  index.fields.forEach(f => {
    console.log(`     - ${f.field} (${f.direction})`);
  });
  console.log();
});

console.log('='.repeat(60));
console.log('\n🔗 Direct Link to Create Indexes:\n');
console.log(`https://console.firebase.google.com/project/${projectId}/firestore/indexes\n`);

console.log('='.repeat(60));
console.log('\n📝 Steps to Create Manually:\n');
console.log('1. Click the link above (or copy-paste into browser)');
console.log('2. Sign in to Firebase Console');
console.log('3. Click "Create Index" button');
console.log('4. For each index:');
console.log('   - Collection ID: leave_requests');
console.log('   - Add fields as listed above');
console.log('   - Click "Create"');
console.log('\n⏳ Each index takes 5-10 minutes to build');
console.log('📧 You\'ll receive email notifications when ready\n');

console.log('='.repeat(60));
console.log('\n✅ TEMPORARY FIX ALREADY APPLIED:\n');
console.log('The API has been updated to work WITHOUT indexes');
console.log('(sorting is done in JavaScript instead)');
console.log('\nThe page should work now, but will be slower.');
console.log('Create the indexes for better performance!\n');

console.log('='.repeat(60));
console.log('\n🚀 Quick Deploy (if Firebase CLI installed):\n');
console.log('npm install -g firebase-tools  # If not installed');
console.log('firebase login                  # If not logged in');
console.log('./scripts/deploy-firestore-indexes.sh\n');

process.exit(0);
