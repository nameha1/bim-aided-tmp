/**
 * Check IP Whitelist Status
 * 
 * Run with: node scripts/check-ip-whitelist.cjs
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

async function checkIpWhitelist() {
  console.log('🌐 Checking IP Whitelist Configuration\n');
  console.log('═'.repeat(60));

  try {
    // Get all IP whitelist entries
    console.log('\n📋 Current IP Whitelist Entries:\n');
    const ipSnapshot = await db.collection('ip_whitelist').get();

    if (ipSnapshot.empty) {
      console.log('❌ NO IP ADDRESSES IN WHITELIST!');
      console.log('\nTo add your current IP, use the admin panel:');
      console.log('   1. Login at http://localhost:3000/login');
      console.log('   2. Go to Admin → Settings → IP Whitelist');
      console.log('   3. Click "Add IP Address"');
      console.log('   4. Click "Use Current" to auto-fill your IP\n');
    } else {
      console.log(`Found ${ipSnapshot.size} IP address(es):\n`);
      
      ipSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. IP: ${data.ip_address}`);
        console.log(`   Location: ${data.location_name || 'N/A'}`);
        console.log(`   Description: ${data.description || 'N/A'}`);
        console.log(`   Status: ${data.is_active ? '✅ Active' : '❌ Inactive'}`);
        console.log(`   Added: ${data.created_at?.toDate?.() || 'N/A'}`);
        console.log('');
      });
    }

    // Try to fetch current IP
    console.log('═'.repeat(60));
    console.log('\n🔍 Attempting to detect your current IP...\n');
    
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

    try {
      const currentIp = await getCurrentIp();
      console.log(`Your Current IP: ${currentIp}\n`);

      // Check if current IP is whitelisted
      const whitelistedIps = ipSnapshot.docs
        .map(doc => doc.data())
        .filter(data => data.is_active);

      const isWhitelisted = whitelistedIps.some(data => data.ip_address === currentIp);

      if (isWhitelisted) {
        console.log('✅ YOUR IP IS WHITELISTED!');
        console.log('   You should be able to check in.\n');
      } else {
        console.log('❌ YOUR IP IS NOT WHITELISTED!');
        console.log('\n💡 To fix this:');
        console.log('   1. Login as admin at http://localhost:3000/login');
        console.log('   2. Navigate to Admin → Settings → IP Whitelist');
        console.log('   3. Click "Add IP Address"');
        console.log('   4. Click "Use Current" button to auto-fill: ' + currentIp);
        console.log('   5. Add a location name and click "Add IP Address"\n');
      }
    } catch (error) {
      console.log('⚠️  Could not detect current IP:', error.message);
      console.log('   You may be behind a firewall or proxy.\n');
    }

    console.log('═'.repeat(60));
    console.log('\n💡 Quick Fix Script:\n');
    console.log('   To automatically add your current IP, run:');
    console.log('   node scripts/add-current-ip.cjs\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

checkIpWhitelist();
