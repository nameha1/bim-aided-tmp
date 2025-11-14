require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const db = admin.firestore();

async function updateProjectImageUrls() {
  console.log('\n🔧 Updating Project Image URLs to Public R2 Domain\n');
  console.log('═══════════════════════════════════════════════════\n');
  
  const OLD_BASE = 'https://d28078bd8d86342463905c45d566137c.r2.cloudflarestorage.com/bimaided';
  const NEW_BASE = 'https://pub-9181a67fa2874087b2989b3dd8b45efe.r2.dev';
  
  try {
    const projectsSnapshot = await db.collection('projects').get();
    
    if (projectsSnapshot.empty) {
      console.log('❌ No projects found in database!');
      process.exit(0);
    }
    
    console.log(`Found ${projectsSnapshot.size} project(s) to check:\n`);
    
    let updatedCount = 0;
    
    for (const doc of projectsSnapshot.docs) {
      const data = doc.data();
      const updates = {};
      let needsUpdate = false;
      
      console.log(`🔹 Checking: ${data.title} (${doc.id})`);
      
      // Check and update image_url
      if (data.image_url && data.image_url.includes(OLD_BASE)) {
        const newUrl = data.image_url.replace(OLD_BASE, NEW_BASE);
        updates.image_url = newUrl;
        needsUpdate = true;
        console.log(`   📸 Main image: ${data.image_url.substring(0, 60)}...`);
        console.log(`   ✅ Will update to: ${newUrl.substring(0, 60)}...`);
      }
      
      // Check gallery images
      for (let i = 1; i <= 5; i++) {
        const field = `gallery_image_${i}`;
        if (data[field] && data[field].includes(OLD_BASE)) {
          const newUrl = data[field].replace(OLD_BASE, NEW_BASE);
          updates[field] = newUrl;
          needsUpdate = true;
          console.log(`   📸 Gallery ${i}: Will update`);
        }
      }
      
      if (needsUpdate) {
        await doc.ref.update({
          ...updates,
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        updatedCount++;
        console.log(`   ✅ Updated!\n`);
      } else {
        console.log(`   ℹ️  No updates needed\n`);
      }
    }
    
    console.log('═══════════════════════════════════════════════════');
    console.log(`\n✅ Update complete!`);
    console.log(`   Projects checked: ${projectsSnapshot.size}`);
    console.log(`   Projects updated: ${updatedCount}\n`);
    
    if (updatedCount > 0) {
      console.log('🎉 Image URLs updated to public R2 domain!');
      console.log('   Refresh your website to see images loading.\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

updateProjectImageUrls();
