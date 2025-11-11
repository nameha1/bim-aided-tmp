/**
 * Firebase Connection Test
 * Run this to verify your Firebase setup is working correctly
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const admin = require('firebase-admin');

// Parse the service account key from environment
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY not found in environment');
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(serviceAccountKey);
  
  console.log('✅ Service account key parsed successfully');
  console.log(`   Project ID: ${serviceAccount.project_id}`);
  console.log(`   Client Email: ${serviceAccount.client_email}`);
  
  // Initialize Firebase Admin
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  }
  
  // Test Firestore connection
  const db = admin.firestore();
  console.log('✅ Firestore instance created');
  
  // Test Auth
  const auth = admin.auth();
  console.log('✅ Auth instance created');
  
  // Try to list users (this will work even if no users exist)
  auth.listUsers(1)
    .then((listUsersResult) => {
      console.log('✅ Successfully connected to Firebase Authentication');
      console.log(`   Users in system: ${listUsersResult.users.length > 0 ? listUsersResult.users.length : 'None yet'}`);
      
      // Try a simple Firestore operation
      return db.collection('_test').doc('_test').set({ 
        test: true, 
        timestamp: admin.firestore.FieldValue.serverTimestamp() 
      });
    })
    .then(() => {
      console.log('✅ Successfully wrote to Firestore');
      
      // Clean up test document
      return db.collection('_test').doc('_test').delete();
    })
    .then(() => {
      console.log('✅ Successfully deleted test document from Firestore');
      console.log('\n🎉 All Firebase services are working correctly!');
      console.log('\nNext steps:');
      console.log('1. Enable Authentication (Email/Password) in Firebase Console');
      console.log('2. Create Firestore Database in Firebase Console');
      console.log('3. Enable Storage in Firebase Console');
      console.log('4. Start updating your components to use Firebase');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error testing Firebase:', error.message);
      console.log('\n⚠️  This might mean:');
      console.log('   - Firestore Database is not enabled in Firebase Console');
      console.log('   - Service account doesn\'t have proper permissions');
      console.log('\n📝 To fix:');
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'your-project-id';
      console.log(`   1. Go to https://console.firebase.google.com/project/${projectId}`);
      console.log('   2. Enable Firestore Database');
      console.log('   3. Enable Storage');
      console.log('   4. Enable Authentication');
      process.exit(1);
    });
    
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
