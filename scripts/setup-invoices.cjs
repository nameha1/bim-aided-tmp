const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../lib/firebase/serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function setupInvoicesCollection() {
  console.log('Setting up invoices collection...');

  try {
    // Check if collection exists by trying to get documents
    const snapshot = await db.collection('invoices').limit(1).get();
    
    if (snapshot.empty) {
      console.log('✓ Invoices collection is empty and ready to use');
      console.log('\nCollection structure:');
      console.log('- invoiceNumber: string (unique invoice number)');
      console.log('- invoiceDate: string (ISO date)');
      console.log('- dueDate: string (ISO date)');
      console.log('- clientName: string');
      console.log('- clientAddress: string');
      console.log('- clientEmail: string');
      console.log('- clientPhone: string');
      console.log('- items: array of {description, quantity, rate, amount}');
      console.log('- subtotal: number');
      console.log('- taxRate: number');
      console.log('- taxAmount: number');
      console.log('- total: number');
      console.log('- notes: string');
      console.log('- status: string (draft|sent|paid)');
      console.log('- createdAt: string (ISO date)');
      console.log('- createdBy: string (admin email)');
    } else {
      console.log(`✓ Invoices collection exists with ${snapshot.size} document(s)`);
    }

    console.log('\n✅ Invoices collection setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up invoices collection:', error);
    process.exit(1);
  }
}

setupInvoicesCollection();
