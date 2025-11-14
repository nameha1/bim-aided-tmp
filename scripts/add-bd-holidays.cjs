/**
 * Add Bangladesh Holidays for 2025-2026
 * 
 * This script adds all public holidays for Bangladesh based on the government calendar
 * Run with: node scripts/add-bd-holidays.cjs
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

// Bangladesh Holidays 2025-2026
const holidays = [
  // 2025 Holidays
  { name: 'New Year', date: '2025-01-01', type: 'government', description: 'New Year\'s Day' },
  { name: 'Shab-e-Barat', date: '2025-02-15', type: 'government', description: 'Night of Forgiveness' },
  { name: 'Shaheed Day (Martyrs\' Day)', date: '2025-02-21', type: 'government', description: 'International Mother Language Day' },
  { name: 'Independence Day', date: '2025-03-26', type: 'government', description: 'Bangladesh Independence Day' },
  { name: 'Jumatul Bidah', date: '2025-03-28', type: 'government', description: 'Last Friday of Ramadan' },
  { name: 'Eid-ul-Fitr', date: '2025-03-31', type: 'government', description: 'Eid-ul-Fitr (Subject to moon sighting)' },
  { name: 'Eid-ul-Fitr Holiday', date: '2025-04-01', type: 'government', description: 'Eid-ul-Fitr Holiday' },
  { name: 'Eid-ul-Fitr Holiday', date: '2025-04-02', type: 'government', description: 'Eid-ul-Fitr Holiday' },
  { name: 'Pahela Baishakh', date: '2025-04-14', type: 'government', description: 'Bengali New Year' },
  { name: 'May Day', date: '2025-05-01', type: 'government', description: 'International Workers\' Day' },
  { name: 'Buddha Purnima', date: '2025-05-11', type: 'government', description: 'Buddha\'s Birthday' },
  { name: 'Eid-ul-Adha', date: '2025-06-07', type: 'government', description: 'Eid-ul-Adha (Subject to moon sighting)' },
  { name: 'Eid-ul-Adha Holiday', date: '2025-06-08', type: 'government', description: 'Eid-ul-Adha Holiday' },
  { name: 'Eid-ul-Adha Holiday', date: '2025-06-09', type: 'government', description: 'Eid-ul-Adha Holiday' },
  { name: 'Ashura', date: '2025-07-06', type: 'government', description: 'Day of Ashura' },
  { name: 'National Mourning Day', date: '2025-08-15', type: 'government', description: 'Death anniversary of Bangabandhu Sheikh Mujibur Rahman' },
  { name: 'Janmashtami', date: '2025-08-16', type: 'government', description: 'Birth of Krishna' },
  { name: 'Eid-e-Milad-un-Nabi', date: '2025-09-05', type: 'government', description: 'Birthday of Prophet Muhammad' },
  { name: 'Durga Puja', date: '2025-10-01', type: 'government', description: 'Durga Puja' },
  { name: 'Durga Puja (Maha Ashtami)', date: '2025-10-02', type: 'government', description: 'Durga Puja - Maha Ashtami' },
  { name: 'Victory Day', date: '2025-12-16', type: 'government', description: 'Bangladesh Victory Day' },
  { name: 'Christmas', date: '2025-12-25', type: 'government', description: 'Christmas Day' },
  { name: 'Rescheduled Holiday (Sep 6)', date: '2025-12-27', type: 'government', description: 'Rescheduled holiday from September 6, 2025' },

  // 2026 Holidays
  { name: 'New Year', date: '2026-01-01', type: 'government', description: 'New Year\'s Day' },
  { name: 'Shab-e-Barat', date: '2026-02-05', type: 'government', description: 'Night of Forgiveness' },
  { name: 'Shaheed Day (Martyrs\' Day)', date: '2026-02-21', type: 'government', description: 'International Mother Language Day' },
  { name: 'Eid-ul-Fitr', date: '2026-02-28', type: 'government', description: 'Eid-ul-Fitr (Subject to moon sighting)' },
  { name: 'Independence Day', date: '2026-03-26', type: 'government', description: 'Bangladesh Independence Day' },
  { name: 'Jumatul Bidah', date: '2026-03-20', type: 'government', description: 'Last Friday of Ramadan' },
  { name: 'Pahela Baishakh', date: '2026-04-14', type: 'government', description: 'Bengali New Year' },
  { name: 'May Day', date: '2026-05-01', type: 'government', description: 'International Workers\' Day' },
  { name: 'Buddha Purnima', date: '2026-05-01', type: 'government', description: 'Buddha\'s Birthday (Combined with May Day)' },
  { name: 'Eid-ul-Adha', date: '2026-05-27', type: 'government', description: 'Eid-ul-Adha (Subject to moon sighting)' },
  { name: 'Eid-ul-Adha Holiday', date: '2026-05-28', type: 'government', description: 'Eid-ul-Adha Holiday' },
  { name: 'Eid-ul-Adha Holiday', date: '2026-05-29', type: 'government', description: 'Eid-ul-Adha Holiday' },
  { name: 'Ashura', date: '2026-06-26', type: 'government', description: 'Day of Ashura' },
  { name: 'National Mourning Day', date: '2026-08-15', type: 'government', description: 'Death anniversary of Bangabandhu Sheikh Mujibur Rahman' },
  { name: 'Eid-e-Milad-un-Nabi', date: '2026-08-25', type: 'government', description: 'Birthday of Prophet Muhammad' },
  { name: 'Janmashtami', date: '2026-09-04', type: 'government', description: 'Birth of Krishna' },
  { name: 'Durga Puja (Maha Ashtami)', date: '2026-10-21', type: 'government', description: 'Durga Puja - Maha Ashtami' },
  { name: 'Victory Day', date: '2026-12-16', type: 'government', description: 'Bangladesh Victory Day' },
  { name: 'Christmas', date: '2026-12-25', type: 'government', description: 'Christmas Day' },
];

async function addHolidays() {
  console.log('🎉 Adding Bangladesh Holidays for 2025-2026...\n');

  try {
    console.log('✓ Connected to Firebase Admin SDK');
    console.log(`✓ Project: ${serviceAccount.project_id}\n`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const holiday of holidays) {
      // Check if holiday already exists
      const existingSnapshot = await db
        .collection('holidays')
        .where('date', '==', holiday.date)
        .where('name', '==', holiday.name)
        .get();

      if (!existingSnapshot.empty) {
        console.log(`   ⏭️  ${holiday.name} (${holiday.date}) already exists, skipping...`);
        skippedCount++;
        continue;
      }

      // Add the holiday
      const holidayData = {
        ...holiday,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await db.collection('holidays').add(holidayData);
      console.log(`   ✓ Added: ${holiday.name} - ${holiday.date}`);
      addedCount++;
    }

    console.log('\n' + '─'.repeat(50));
    console.log(`\n✅ Holidays setup complete!`);
    console.log(`📊 Added: ${addedCount} new holidays`);
    console.log(`⏭️  Skipped: ${skippedCount} existing holidays`);
    console.log(`📅 Total in calendar: ${holidays.length} holidays\n`);

    console.log('─'.repeat(50));
    console.log('\n🎯 Holidays added for:');
    console.log('   • 2025: January - December');
    console.log('   • 2026: January - December');
    console.log('\n📝 Note: Holidays marked with * are subject to moon sighting\n');

  } catch (error) {
    console.error('❌ Error adding holidays:', error);
    console.error('\nDetails:', error.message);
    process.exit(1);
  }
}

// Run the script
addHolidays()
  .then(() => {
    console.log('✨ All done! Holidays have been added to the database.\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
