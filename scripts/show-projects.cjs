require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function showProjects() {
  console.log('\n📋 All Projects in Firestore\n');
  console.log('═══════════════════════════════════════════════════\n');
  
  const projectsSnapshot = await db.collection('projects').get();
  
  if (projectsSnapshot.empty) {
    console.log('❌ No projects found in database!');
    console.log('\n💡 The database is empty. You need to add projects via the admin panel.');
    process.exit(0);
  }
  
  console.log(`Found ${projectsSnapshot.size} project(s):\n`);
  
  projectsSnapshot.forEach((doc, index) => {
    const data = doc.data();
    console.log(`\n🔹 Project ${index + 1}: ${doc.id}`);
    console.log('   ─────────────────────────────────────────');
    console.log(`   Title:          ${data.title || 'N/A'}`);
    console.log(`   Category:       ${data.category || 'N/A'}`);
    console.log(`   Description:    ${data.description ? data.description.substring(0, 80) + '...' : 'N/A'}`);
    console.log(`   Published:      ${data.published === true ? '✅ Yes' : '❌ No'}`);
    console.log(`   Image URL:      ${data.image_url || 'N/A'}`);
    console.log(`   Gallery Image 1: ${data.gallery_image_1 || 'N/A'}`);
    console.log(`   Gallery Image 2: ${data.gallery_image_2 || 'N/A'}`);
    console.log(`   Gallery Image 3: ${data.gallery_image_3 || 'N/A'}`);
    console.log(`   Gallery Image 4: ${data.gallery_image_4 || 'N/A'}`);
    console.log(`   Gallery Image 5: ${data.gallery_image_5 || 'N/A'}`);
    console.log(`   Client:         ${data.client_name || 'N/A'}`);
    console.log(`   Location:       ${data.location || 'N/A'}`);
    console.log(`   Completion Date: ${data.completion_date || 'N/A'}`);
    console.log(`   Created:        ${data.created_at ? data.created_at.toDate().toLocaleString() : 'N/A'}`);
    console.log(`   Updated:        ${data.updated_at ? data.updated_at.toDate().toLocaleString() : 'N/A'}`);
  });
  
  const publishedCount = projectsSnapshot.docs.filter(doc => doc.data().published === true).length;
  console.log('\n═══════════════════════════════════════════════════');
  console.log(`\n📊 Summary:`);
  console.log(`   Total Projects: ${projectsSnapshot.size}`);
  console.log(`   Published: ${publishedCount}`);
  console.log(`   Unpublished: ${projectsSnapshot.size - publishedCount}`);
  console.log(`\n💡 Tip: Only published projects show on the website.`);
  console.log(`   Go to /admin to manage projects.\n`);
  
  process.exit(0);
}

showProjects().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
