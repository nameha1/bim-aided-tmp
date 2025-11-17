/**
 * Add Current IP to Whitelist
 * 
 * Run with: node scripts/add-current-ip.cjs
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

const db = admin.firestore();

async function addCurrentIp() {
  console.log('🌐 Adding Current IP to Whitelist\n');
  console.log('═'.repeat(60));

  try {
    // Get current IP
    const https = require('https');
    
    const getCurrentIp = () => {
      return new Promise((resolve, reject) => {
        https.get('https://api.ipify.org?format=json', (resp) => {
          let data = '';
          resp.on('data', (chunk) => { data += chunk; });
          resp.on('end', () => {
            try {
              const json = JSON.parse(data);
              resolve(json.ip);
            } catch (e) {
              reject(e);
            }
          });
        }).on('error', reject);
      });
    };

    const currentIp = await getCurrentIp();
    console.log(`\n📍 Your Current IP: ${currentIp}\n`);

    // Check if already whitelisted
    const existingSnapshot = await db.collection('ip_whitelist')
      .where('ip_address', '==', currentIp)
      .get();

    if (!existingSnapshot.empty) {
      console.log('✅ This IP is already whitelisted!\n');
      const doc = existingSnapshot.docs[0];
      const data = doc.data();
      console.log('   Location: ' + (data.location_name || 'N/A'));
      console.log('   Status: ' + (data.is_active ? 'Active' : 'Inactive'));
      
      if (!data.is_active) {
        console.log('\n⚠️  IP exists but is inactive. Activating...');
        await doc.ref.update({
          is_active: true,
          updated_at: new Date()
        });
        console.log('✅ IP has been activated!\n');
      }
    } else {
      console.log('➕ Adding IP to whitelist...\n');
      
      await db.collection('ip_whitelist').add({
        ip_address: currentIp,
        location_name: 'Office/Home Network',
        description: 'Auto-added via script',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });

      console.log('✅ IP Successfully Added to Whitelist!\n');
      console.log('   IP Address: ' + currentIp);
      console.log('   Location: Office/Home Network');
      console.log('   Status: Active\n');
    }

    console.log('═'.repeat(60));
    console.log('\n💡 You can now check in from this network!');
    console.log('   Refresh your employee dashboard to try again.\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

addCurrentIp();
