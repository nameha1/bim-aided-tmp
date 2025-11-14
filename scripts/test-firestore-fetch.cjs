#!/usr/bin/env node
/**
 * Test Firestore data fetching to diagnose why pages show placeholder content
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const db = admin.firestore();

async function testDataFetch() {
  console.log('\n🧪 Testing Firestore Data Fetch\n');
  console.log('═══════════════════════════════════════════════════\n');
  
  try {
    // Test 1: Fetch all projects
    console.log('📋 Test 1: Fetch ALL projects');
    const allProjects = await db.collection('projects').get();
    console.log(`   Result: ${allProjects.size} total projects found\n`);
    
    // Test 2: Fetch only published projects
    console.log('📋 Test 2: Fetch PUBLISHED projects');
    const publishedProjects = await db.collection('projects')
      .where('published', '==', true)
      .get();
    console.log(`   Result: ${publishedProjects.size} published projects found\n`);
    
    // Test 3: Show published projects data
    if (publishedProjects.size > 0) {
      console.log('📊 Published Projects Data:\n');
      publishedProjects.forEach((doc, index) => {
        const data = doc.data();
        console.log(`   ${index + 1}. ${data.title}`);
        console.log(`      ID: ${doc.id}`);
        console.log(`      Category: ${data.category}`);
        console.log(`      Description: ${data.description?.substring(0, 50)}...`);
        console.log(`      Published: ${data.published}`);
        console.log(`      Image URL: ${data.image_url ? '✅ Set' : '❌ Missing'}`);
        console.log(`      Created: ${data.created_at?.toDate().toLocaleString()}\n`);
      });
    }
    
    // Test 4: Fetch with category filter
    console.log('📋 Test 4: Fetch by CATEGORY (Education & Healthcare)');
    const categoryProjects = await db.collection('projects')
      .where('published', '==', true)
      .where('category', '==', 'Education & Healthcare')
      .get();
    console.log(`   Result: ${categoryProjects.size} projects in Education & Healthcare\n`);
    
    // Test 5: Fetch with ordering
    console.log('📋 Test 5: Fetch with ORDERING (created_at desc)');
    const orderedProjects = await db.collection('projects')
      .where('published', '==', true)
      .orderBy('created_at', 'desc')
      .limit(3)
      .get();
    console.log(`   Result: ${orderedProjects.size} projects (limit 3)\n`);
    
    if (orderedProjects.size > 0) {
      console.log('📊 Ordered Projects:\n');
      orderedProjects.forEach((doc, index) => {
        const data = doc.data();
        console.log(`   ${index + 1}. ${data.title} (${data.created_at?.toDate().toLocaleDateString()})`);
      });
    }
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log('\n✅ All Firestore queries working correctly!\n');
    
    // Summary
    console.log('📋 Summary:');
    console.log(`   • Total Projects: ${allProjects.size}`);
    console.log(`   • Published Projects: ${publishedProjects.size}`);
    console.log(`   • Should display on website: ${publishedProjects.size > 0 ? '✅ YES' : '❌ NO'}\n`);
    
    if (publishedProjects.size === 0) {
      console.log('⚠️  WARNING: No published projects found!');
      console.log('   Check that your projects have published=true\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

testDataFetch();
