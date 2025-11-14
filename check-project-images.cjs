const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkProjectImages() {
  try {
    const projectsSnapshot = await db.collection('projects')
      .where('published', '==', true)
      .orderBy('created_at', 'desc')
      .limit(3)
      .get();

    console.log('\n=== Featured Projects Image Check ===\n');
    
    if (projectsSnapshot.empty) {
      console.log('No published projects found');
      return;
    }

    projectsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Project: ${data.title}`);
      console.log(`  - ID: ${doc.id}`);
      console.log(`  - Category: ${data.category}`);
      console.log(`  - image_url: ${data.image_url || 'NOT SET'}`);
      console.log(`  - image: ${data.image || 'NOT SET'}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProjectImages();
