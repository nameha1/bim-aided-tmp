require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function listAllCollections() {
  console.log('\n🔍 Scanning Firestore Database...\n');
  
  const collections = await db.listCollections();
  
  console.log(`Found ${collections.length} collections:\n`);
  
  for (const collection of collections) {
    const snapshot = await collection.get();
    console.log(`📁 ${collection.id}: ${snapshot.size} documents`);
    
    if (snapshot.size > 0 && snapshot.size <= 10) {
      snapshot.docs.forEach(doc => {
        console.log(`   └─ ${doc.id}`);
      });
    }
  }
  
  console.log('\n✅ Scan complete!\n');
  console.log('🌐 View in Firebase Console:');
  console.log('   https://console.firebase.google.com/project/bimaided-b4447/firestore\n');
  
  process.exit(0);
}

listAllCollections().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
