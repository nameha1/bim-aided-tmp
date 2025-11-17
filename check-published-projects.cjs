const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function checkPublishedProjects() {
  try {
    console.log('🔍 Checking for published projects in Firestore...\n');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Get all projects
    const allProjectsSnapshot = await getDocs(collection(db, 'projects'));
    console.log(`📊 Total projects in database: ${allProjectsSnapshot.size}\n`);
    
    if (allProjectsSnapshot.size === 0) {
      console.log('❌ No projects found in database!');
      console.log('💡 You need to add projects through the admin panel first.');
      return;
    }
    
    // Get published projects
    const publishedQuery = query(collection(db, 'projects'), where('published', '==', true));
    const publishedSnapshot = await getDocs(publishedQuery);
    console.log(`✅ Published projects: ${publishedSnapshot.size}\n`);
    
    if (publishedSnapshot.size === 0) {
      console.log('⚠️  No published projects found!');
      console.log('💡 You have projects in the database, but none are published.');
      console.log('💡 Go to your admin panel and publish some projects.\n');
      
      console.log('Unpublished projects:');
      allProjectsSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ${data.title} (published: ${data.published || false})`);
      });
    } else {
      console.log('Published projects that will show on the landing page:');
      publishedSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n${index + 1}. ${data.title}`);
        console.log(`   Category: ${data.category}`);
        console.log(`   Image URL: ${data.image_url || data.gallery_image_1 || data.image || 'N/A'}`);
        console.log(`   Description: ${data.description?.substring(0, 100)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking projects:', error);
  }
}

checkPublishedProjects();
