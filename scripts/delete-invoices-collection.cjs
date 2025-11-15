/**
 * Script to delete the invoices collection from Firebase Firestore
 * This will permanently remove all invoice documents and the collection itself
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
} catch (error) {
  console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT_KEY');
  console.error('Make sure your .env.local file has the correct FIREBASE_SERVICE_ACCOUNT_KEY');
  process.exit(1);
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    process.exit(1);
  }
}

const db = admin.firestore();

async function deleteCollection(collectionPath, batchSize = 100) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

async function deleteInvoicesCollection() {
  try {
    console.log('🗑️  Starting deletion of invoices collection...\n');

    // Check if collection exists and has documents
    const snapshot = await db.collection('invoices').limit(1).get();
    
    if (snapshot.empty) {
      console.log('✓ Invoices collection is already empty or does not exist');
      console.log('\n✅ No action needed - invoices collection is already clean!');
      process.exit(0);
      return;
    }

    // Get total count
    const countSnapshot = await db.collection('invoices').count().get();
    const totalDocs = countSnapshot.data().count;
    
    console.log(`📊 Found ${totalDocs} invoice document(s) to delete\n`);
    console.log('⚠️  WARNING: This action is IRREVERSIBLE!');
    console.log('   All invoice data will be permanently deleted from Firebase.\n');

    // Delete the collection
    console.log('🔄 Deleting documents...');
    await deleteCollection('invoices');
    
    console.log('✓ All invoice documents deleted');
    console.log('\n✅ Invoices collection successfully deleted from Firebase!');
    console.log('\nNote: The collection name may still appear in Firebase Console');
    console.log('until you restart the console or add a new collection.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting invoices collection:', error);
    process.exit(1);
  }
}

// Run the deletion
console.log('═══════════════════════════════════════════════════════');
console.log('  DELETE INVOICES COLLECTION FROM FIREBASE');
console.log('═══════════════════════════════════════════════════════\n');

deleteInvoicesCollection();
