/**
 * Setup Invoices Collection in Firestore
 * Run: node scripts/setup-invoices-collection.cjs
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function setupInvoicesCollection() {
  console.log('🚀 Setting up invoices collection...\n');

  try {
    // Check if collection exists
    const snapshot = await db.collection('invoices').limit(1).get();
    
    if (snapshot.empty) {
      console.log('📝 Creating invoices collection structure...\n');
      
      // Create a sample invoice document (you can delete this later)
      const sampleInvoice = {
        invoiceNumber: 'SAMPLE-001',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        fromProfileId: '',
        fromProfile: null,
        billedTo: {
          name: 'Sample Client',
          address: '123 Sample Street',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          country: 'Country',
          email: 'client@example.com',
          phone: '+1234567890',
          taxId: ''
        },
        items: [
          {
            id: '1',
            name: 'Sample Service',
            description: 'Sample description',
            quantity: 1,
            rate: 1000,
            amount: 1000
          }
        ],
        subtotal: 1000,
        discountType: 'percentage',
        discountValue: 0,
        discountAmount: 0,
        taxType: 'percentage',
        taxValue: 0,
        taxAmount: 0,
        total: 1000,
        currency: 'USD',
        bankDetailsId: '',
        bankDetails: null,
        notes: 'This is a sample invoice. You can delete it.',
        terms: 'Sample terms and conditions',
        status: 'draft',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('invoices').add(sampleInvoice);
      
      console.log('✅ Invoices collection created successfully!');
      console.log('📄 Sample invoice added (you can delete it from the admin panel)\n');
    } else {
      console.log('✅ Invoices collection already exists!');
      console.log(`📊 Found ${snapshot.size} document(s)\n`);
    }

    console.log('📋 Invoice Collection Schema:');
    console.log('  - invoiceNumber: string (unique)');
    console.log('  - invoiceDate: string (YYYY-MM-DD)');
    console.log('  - dueDate: string (YYYY-MM-DD)');
    console.log('  - fromProfileId: string (reference to company_profiles)');
    console.log('  - fromProfile: object (company details)');
    console.log('  - billedTo: object (client info)');
    console.log('  - items: array of invoice items');
    console.log('  - subtotal: number');
    console.log('  - discountType: string (percentage|fixed)');
    console.log('  - discountValue: number');
    console.log('  - discountAmount: number');
    console.log('  - taxType: string (percentage|fixed)');
    console.log('  - taxValue: number');
    console.log('  - taxAmount: number');
    console.log('  - total: number');
    console.log('  - currency: string (USD|BDT)');
    console.log('  - bankDetailsId: string (reference to bank_details)');
    console.log('  - bankDetails: object (bank info)');
    console.log('  - notes: string');
    console.log('  - terms: string');
    console.log('  - status: string (draft|sent|paid|overdue|cancelled)');
    console.log('  - createdAt: timestamp');
    console.log('  - updatedAt: timestamp\n');

    console.log('✨ You can now create invoices from the admin panel!');
    console.log('   Go to: Admin Panel → Finance → Invoices\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

setupInvoicesCollection();
