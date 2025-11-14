/**
 * Initialize Sample Holidays for 2025-2026
 * Run this script to populate the holidays collection with common UAE/Government holidays
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = require('../bim-aided-firebase-adminsdk.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const holidays2025 = [
  // 2025 Holidays
  { name: "New Year's Day", date: "2025-01-01", type: "public", description: "First day of the Gregorian calendar year" },
  { name: "Eid Al Fitr Holiday", date: "2025-03-30", type: "public", description: "Islamic festival marking end of Ramadan (estimated)" },
  { name: "Eid Al Fitr Holiday", date: "2025-03-31", type: "public", description: "Eid Al Fitr Day 2 (estimated)" },
  { name: "Eid Al Fitr Holiday", date: "2025-04-01", type: "public", description: "Eid Al Fitr Day 3 (estimated)" },
  { name: "Arafat Day", date: "2025-06-06", type: "public", description: "Day before Eid Al Adha (estimated)" },
  { name: "Eid Al Adha", date: "2025-06-07", type: "public", description: "Festival of Sacrifice (estimated)" },
  { name: "Eid Al Adha Holiday", date: "2025-06-08", type: "public", description: "Eid Al Adha Day 2 (estimated)" },
  { name: "Eid Al Adha Holiday", date: "2025-06-09", type: "public", description: "Eid Al Adha Day 3 (estimated)" },
  { name: "Islamic New Year", date: "2025-06-27", type: "public", description: "First day of Muharram (estimated)" },
  { name: "Prophet Muhammad's Birthday", date: "2025-09-05", type: "public", description: "Mawlid (estimated)" },
  { name: "Commemoration Day", date: "2025-12-01", type: "public", description: "Martyrs' Day - UAE" },
  { name: "National Day", date: "2025-12-02", type: "public", description: "UAE National Day" },
  { name: "National Day Holiday", date: "2025-12-03", type: "public", description: "UAE National Day Holiday" },
  
  // 2026 Holidays
  { name: "New Year's Day", date: "2026-01-01", type: "public", description: "First day of the Gregorian calendar year" },
  { name: "Eid Al Fitr Holiday", date: "2026-03-20", type: "public", description: "Islamic festival marking end of Ramadan (estimated)" },
  { name: "Eid Al Fitr Holiday", date: "2026-03-21", type: "public", description: "Eid Al Fitr Day 2 (estimated)" },
  { name: "Eid Al Fitr Holiday", date: "2026-03-22", type: "public", description: "Eid Al Fitr Day 3 (estimated)" },
  { name: "Arafat Day", date: "2026-05-27", type: "public", description: "Day before Eid Al Adha (estimated)" },
  { name: "Eid Al Adha", date: "2026-05-28", type: "public", description: "Festival of Sacrifice (estimated)" },
  { name: "Eid Al Adha Holiday", date: "2026-05-29", type: "public", description: "Eid Al Adha Day 2 (estimated)" },
  { name: "Eid Al Adha Holiday", date: "2026-05-30", type: "public", description: "Eid Al Adha Day 3 (estimated)" },
  { name: "Islamic New Year", date: "2026-06-17", type: "public", description: "First day of Muharram (estimated)" },
  { name: "Prophet Muhammad's Birthday", date: "2026-08-26", type: "public", description: "Mawlid (estimated)" },
  { name: "Commemoration Day", date: "2026-12-01", type: "public", description: "Martyrs' Day - UAE" },
  { name: "National Day", date: "2026-12-02", type: "public", description: "UAE National Day" },
  { name: "National Day Holiday", date: "2026-12-03", type: "public", description: "UAE National Day Holiday" },
];

async function initializeHolidays() {
  console.log('🎉 Initializing holidays collection...');
  
  try {
    const batch = db.batch();
    let count = 0;

    for (const holiday of holidays2025) {
      // Check if holiday already exists
      const existingSnapshot = await db.collection('holidays')
        .where('date', '==', holiday.date)
        .get();

      if (existingSnapshot.empty) {
        const holidayRef = db.collection('holidays').doc();
        batch.set(holidayRef, {
          ...holiday,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        count++;
        console.log(`  ✓ Adding: ${holiday.name} (${holiday.date})`);
      } else {
        console.log(`  ⊘ Skipping: ${holiday.name} (${holiday.date}) - already exists`);
      }
    }

    if (count > 0) {
      await batch.commit();
      console.log(`\n✅ Successfully added ${count} holidays!`);
    } else {
      console.log('\n✅ All holidays already exist in the database!');
    }

    console.log('\n📊 Holiday Summary:');
    console.log(`   Total holidays added/updated: ${count}`);
    console.log(`   Total holidays in database: ${holidays2025.length}`);
    console.log('\n⚠️  Note: Islamic holiday dates are estimated and may need adjustment based on moon sighting.');

  } catch (error) {
    console.error('❌ Error initializing holidays:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the initialization
initializeHolidays();
