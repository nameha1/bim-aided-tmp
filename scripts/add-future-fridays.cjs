/**
 * Add Fridays for Multiple Years
 * 
 * Run with: node scripts/add-future-fridays.cjs 2028 2030
 * This will add all Fridays from 2028 to 2030
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
} catch (error) {
  console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT_KEY');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

const db = admin.firestore();

/**
 * Get all Fridays in a given year
 */
function getAllFridays(year) {
  const fridays = [];
  const date = new Date(year, 0, 1);
  
  // Find the first Friday
  while (date.getDay() !== 5) {
    date.setDate(date.getDate() + 1);
  }
  
  // Add all Fridays
  while (date.getFullYear() === year) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    fridays.push(`${year}-${month}-${day}`);
    date.setDate(date.getDate() + 7);
  }
  
  return fridays;
}

/**
 * Add Friday holidays for specified year range
 */
async function addFridaysForYears(startYear, endYear) {
  console.log(`📅 Adding Friday Weekends from ${startYear} to ${endYear}...\n`);

  try {
    console.log('✓ Connected to Firebase Admin SDK');
    console.log(`✓ Project: ${serviceAccount.project_id}\n`);

    let totalAdded = 0;
    let totalSkipped = 0;

    for (let year = startYear; year <= endYear; year++) {
      console.log(`\n📆 Processing year ${year}...`);
      const fridays = getAllFridays(year);
      console.log(`   Found ${fridays.length} Fridays in ${year}`);

      let yearAdded = 0;
      let yearSkipped = 0;

      // Use batch writes for better performance
      const batch = db.batch();
      let batchCount = 0;
      const maxBatchSize = 500; // Firestore limit

      for (const fridayDate of fridays) {
        // Check if already exists
        const existingSnapshot = await db
          .collection('holidays')
          .where('date', '==', fridayDate)
          .where('type', '==', 'weekend')
          .get();

        if (!existingSnapshot.empty) {
          yearSkipped++;
          continue;
        }

        // Add to batch
        const docRef = db.collection('holidays').doc();
        batch.set(docRef, {
          name: 'Friday Weekend',
          date: fridayDate,
          type: 'weekend',
          description: 'Company weekend - Friday',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        batchCount++;
        yearAdded++;

        // Commit batch if we hit the limit
        if (batchCount >= maxBatchSize) {
          await batch.commit();
          batchCount = 0;
        }
      }

      // Commit remaining items in batch
      if (batchCount > 0) {
        await batch.commit();
      }

      console.log(`   ✓ Added: ${yearAdded} Fridays`);
      console.log(`   ⏭️  Skipped: ${yearSkipped} existing Fridays`);
      
      totalAdded += yearAdded;
      totalSkipped += yearSkipped;
    }

    console.log('\n' + '─'.repeat(50));
    console.log(`\n✅ Friday weekends setup complete!`);
    console.log(`📊 Total added: ${totalAdded} Fridays`);
    console.log(`⏭️  Total skipped: ${totalSkipped} existing Fridays`);
    console.log(`📅 Years covered: ${startYear} to ${endYear}\n`);

  } catch (error) {
    console.error('❌ Error adding Friday holidays:', error);
    console.error('\nDetails:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.log('Usage: node scripts/add-future-fridays.cjs <startYear> <endYear>');
  console.log('Example: node scripts/add-future-fridays.cjs 2028 2030');
  process.exit(1);
}

const startYear = parseInt(args[0]);
const endYear = parseInt(args[1]);

if (isNaN(startYear) || isNaN(endYear) || startYear > endYear) {
  console.error('❌ Invalid year range. Start year must be <= end year.');
  process.exit(1);
}

// Run the script
addFridaysForYears(startYear, endYear)
  .then(() => {
    console.log('✨ All done! Friday weekends have been added.\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
