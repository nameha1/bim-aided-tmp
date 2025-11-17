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

async function migrateJobPostings() {
  try {
    console.log('\n=== Migrating Job Postings ===\n');
    
    // Get all job postings
    const snapshot = await db.collection('job_postings').get();
    
    console.log(`Total job postings to check: ${snapshot.size}\n`);
    
    if (snapshot.empty) {
      console.log('No job postings found in the database.');
      return;
    }
    
    let migrated = 0;
    let skipped = 0;
    
    const batch = db.batch();
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Check if it has createdAt but not created_at
      if (data.createdAt && !data.created_at) {
        console.log(`Migrating: ${data.title} (ID: ${doc.id})`);
        batch.update(doc.ref, {
          created_at: data.createdAt,
          updated_at: data.updatedAt || data.createdAt || admin.firestore.FieldValue.serverTimestamp()
        });
        migrated++;
      } else if (data.created_at) {
        console.log(`Skipping: ${data.title} (already has created_at)`);
        skipped++;
      } else {
        console.log(`Warning: ${data.title} has neither createdAt nor created_at - setting to now`);
        batch.update(doc.ref, {
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        migrated++;
      }
    });
    
    if (migrated > 0) {
      await batch.commit();
      console.log(`\n✅ Successfully migrated ${migrated} job posting(s)`);
    }
    
    if (skipped > 0) {
      console.log(`ℹ️  Skipped ${skipped} job posting(s) (already correct)`);
    }
    
    console.log('\n=== Verifying migration ===\n');
    
    // Verify all postings now have created_at
    const verifySnapshot = await db.collection('job_postings').get();
    let allGood = true;
    
    verifySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.created_at) {
        console.log(`❌ ${data.title} still missing created_at`);
        allGood = false;
      } else {
        console.log(`✅ ${data.title} has created_at: ${data.created_at.toDate()}`);
      }
    });
    
    if (allGood) {
      console.log('\n🎉 All job postings now have created_at field!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

migrateJobPostings();
