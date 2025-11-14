/**
 * Add Friday Weekends as Holidays
 * 
 * This script adds all Fridays as company weekends (holidays)
 * Run with: node scripts/add-friday-holidays.cjs
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
} catch (error) {
  console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT_KEY');
  console.error('Make sure it\'s a valid JSON string in your .env.local file');
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
  const date = new Date(year, 0, 1); // Start from January 1
  
  // Find the first Friday of the year
  while (date.getDay() !== 5) { // 5 = Friday
    date.setDate(date.getDate() + 1);
  }
  
  // Add all Fridays for the year
  while (date.getFullYear() === year) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    fridays.push(`${year}-${month}-${day}`);
    date.setDate(date.getDate() + 7); // Move to next Friday
  }
  
  return fridays;
}

/**
 * Add Friday holidays for specified years
 */
async function addFridayHolidays() {
  console.log('📅 Adding Friday Weekends as Holidays...\n');

  try {
    console.log('✓ Connected to Firebase Admin SDK');
    console.log(`✓ Project: ${serviceAccount.project_id}\n`);

    // Years to add (current year and next few years)
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear + 1, currentYear + 2];
    
    let totalAdded = 0;
    let totalSkipped = 0;

    for (const year of years) {
      console.log(`\n📆 Processing year ${year}...`);
      const fridays = getAllFridays(year);
      console.log(`   Found ${fridays.length} Fridays in ${year}`);

      let yearAdded = 0;
      let yearSkipped = 0;

      for (const fridayDate of fridays) {
        // Check if this Friday already exists
        const existingSnapshot = await db
          .collection('holidays')
          .where('date', '==', fridayDate)
          .where('type', '==', 'weekend')
          .get();

        if (!existingSnapshot.empty) {
          yearSkipped++;
          continue;
        }

        // Add the Friday as a weekend holiday
        const holidayData = {
          name: 'Friday Weekend',
          date: fridayDate,
          type: 'weekend',
          description: 'Company weekend - Friday',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await db.collection('holidays').add(holidayData);
        yearAdded++;
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
    console.log(`📅 Years covered: ${years.join(', ')}\n`);

    console.log('─'.repeat(50));
    console.log('\n🎯 Summary:');
    console.log(`   • All Fridays marked as company weekends`);
    console.log(`   • Type: "weekend" (different from government holidays)`);
    console.log(`   • Will be used in attendance calculations`);
    console.log('\n💡 Tip: Run this script annually to add Fridays for new years\n');

  } catch (error) {
    console.error('❌ Error adding Friday holidays:', error);
    console.error('\nDetails:', error.message);
    process.exit(1);
  }
}

// Run the script
addFridayHolidays()
  .then(() => {
    console.log('✨ All done! Friday weekends have been added.\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
