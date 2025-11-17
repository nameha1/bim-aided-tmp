require('dotenv').config({ path: '.env.local' });

const admin = require('firebase-admin');

// Parse the service account key from environment
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY not found in environment');
  process.exit(1);
}

const serviceAccount = JSON.parse(serviceAccountKey);

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function checkJobPostings() {
  try {
    console.log('\n=== Checking Job Postings ===\n');
    
    // Get all job postings
    const snapshot = await db.collection('job_postings').get();
    
    console.log(`Total job postings: ${snapshot.size}\n`);
    
    if (snapshot.empty) {
      console.log('No job postings found in the database.');
      return;
    }
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`ID: ${doc.id}`);
      console.log(`Title: ${data.title}`);
      console.log(`Status: ${data.status}`);
      console.log(`Has created_at: ${!!data.created_at}`);
      console.log(`Has createdAt: ${!!data.createdAt}`);
      if (data.created_at) {
        console.log(`created_at value: ${data.created_at.toDate()}`);
      }
      if (data.createdAt) {
        console.log(`createdAt value: ${data.createdAt.toDate()}`);
      }
      console.log('---');
    });
    
    // Check active postings specifically
    const activeSnapshot = await db.collection('job_postings')
      .where('status', '==', 'active')
      .get();
    
    console.log(`\nActive job postings: ${activeSnapshot.size}`);
    
    // Try the query with ordering
    try {
      const orderedSnapshot = await db.collection('job_postings')
        .where('status', '==', 'active')
        .orderBy('created_at', 'desc')
        .get();
      
      console.log(`\nOrdered query result: ${orderedSnapshot.size} postings`);
    } catch (error) {
      console.error('\nError with ordered query:', error.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkJobPostings();
