/**
 * Cloudflare R2 Setup and Test Script
 * Verifies R2 connection, bucket access, and uploads a test file
 */

require('dotenv').config({ path: '.env.local' });
const Minio = require('minio');

const R2_CONFIG = {
  endPoint: process.env.MINIO_ENDPOINT || process.env.CLOUDFLARE_R2_ENDPOINT?.replace('https://', ''),
  port: 443,
  useSSL: true,
  accessKey: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
  secretKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
};

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET || 'bimaided';

async function setupR2() {
  console.log('🌩️  Cloudflare R2 Setup & Test\n');
  console.log('Configuration:');
  console.log(`  Endpoint: ${R2_CONFIG.endPoint}`);
  console.log(`  Bucket: ${BUCKET_NAME}`);
  console.log(`  Access Key: ${R2_CONFIG.accessKey?.substring(0, 8)}...`);
  console.log('');

  try {
    // Initialize R2 client
    const client = new Minio.Client(R2_CONFIG);
    console.log('✓ R2 client initialized\n');

    // Check bucket exists
    console.log(`Checking if bucket "${BUCKET_NAME}" exists...`);
    const bucketExists = await client.bucketExists(BUCKET_NAME);
    
    if (!bucketExists) {
      console.log(`❌ Bucket "${BUCKET_NAME}" does not exist`);
      console.log('\n📋 To create the bucket:');
      console.log('1. Go to: https://dash.cloudflare.com/');
      console.log('2. Navigate to R2 Object Storage');
      console.log('3. Click "Create bucket"');
      console.log(`4. Name it: ${BUCKET_NAME}`);
      console.log('5. Choose your location');
      console.log('6. Click "Create bucket"\n');
      return;
    }

    console.log(`✓ Bucket "${BUCKET_NAME}" exists\n`);

    // Test upload
    console.log('Testing file upload...');
    const testFileName = `test/upload-test-${Date.now()}.txt`;
    const testContent = Buffer.from('Hello from BIMaided! This is a test file.');
    
    await client.putObject(
      BUCKET_NAME,
      testFileName,
      testContent,
      testContent.length,
      { 'Content-Type': 'text/plain' }
    );
    
    console.log(`✓ Test file uploaded: ${testFileName}\n`);

    // Get file URL
    const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    if (publicUrl) {
      console.log(`📎 Public URL: ${publicUrl}/${testFileName}`);
    } else {
      console.log(`⚠️  No public URL configured`);
      console.log(`   Set NEXT_PUBLIC_R2_PUBLIC_URL in .env.local`);
    }
    console.log('');

    // Check for custom domain
    console.log('─'.repeat(60));
    console.log('\n🌐 Custom Domain Setup (Recommended)\n');
    console.log('For better performance and SEO, set up a custom domain:');
    console.log('');
    console.log('1. Go to your R2 bucket settings');
    console.log('2. Click on "Settings" tab');
    console.log('3. Under "Public access", enable "Allow Access"');
    console.log('4. Add a custom domain (e.g., cdn.bimaided.com)');
    console.log('5. Update NEXT_PUBLIC_R2_PUBLIC_URL in .env.local');
    console.log('');
    console.log('Example:');
    console.log('  NEXT_PUBLIC_R2_PUBLIC_URL=https://cdn.bimaided.com');
    console.log('');

    // List recent files
    console.log('─'.repeat(60));
    console.log('\n📁 Recent Files in Bucket:\n');
    
    const stream = client.listObjects(BUCKET_NAME, '', true);
    let count = 0;
    
    for await (const obj of stream) {
      if (count < 10 && obj.name) {
        const size = (obj.size / 1024).toFixed(2);
        console.log(`  • ${obj.name} (${size} KB)`);
        count++;
      }
    }
    
    if (count === 0) {
      console.log('  (No files yet)');
    }
    console.log('');

    // Clean up test file
    console.log('Cleaning up test file...');
    await client.removeObject(BUCKET_NAME, testFileName);
    console.log('✓ Test file removed\n');

    console.log('─'.repeat(60));
    console.log('\n✅ Cloudflare R2 is configured correctly!');
    console.log('\n🚀 You can now upload project images through the admin panel.\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nDetails:', error);
    
    if (error.code === 'NetworkingError') {
      console.log('\n💡 Troubleshooting:');
      console.log('  • Check your internet connection');
      console.log('  • Verify R2 credentials are correct');
      console.log('  • Ensure endpoint URL is correct');
    }
  }
}

setupR2()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
