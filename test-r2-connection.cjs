/**
 * Test Cloudflare R2 Connection
 * Run with: node test-r2-connection.cjs
 */

const Minio = require('minio');

// R2 Configuration (from .env.local)
const r2Config = {
  endPoint: 'd28078bd8d86342463905c45d566137c.r2.cloudflarestorage.com',
  port: 443,
  useSSL: true,
  accessKey: '2d83148d1b4ca6c5016634f745e10784',
  secretKey: '4f3980a2eea968fd76b27730b61caf33dd840baa3b14b7a73f647fc4cf246b81',
};

const bucketName = 'bimaided';

async function testR2Connection() {
  console.log('🔄 Testing Cloudflare R2 Connection...\n');
  console.log('Configuration:');
  console.log('  Endpoint:', r2Config.endPoint);
  console.log('  Port:', r2Config.port);
  console.log('  SSL:', r2Config.useSSL);
  console.log('  Bucket:', bucketName);
  console.log('  Access Key:', r2Config.accessKey.substring(0, 8) + '...');
  console.log('');

  try {
    // Initialize client
    const client = new Minio.Client(r2Config);
    console.log('✅ MinIO client initialized\n');

    // Test 1: List buckets
    console.log('Test 1: Listing buckets...');
    const buckets = await client.listBuckets();
    console.log('✅ Buckets found:', buckets.length);
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (created: ${bucket.creationDate})`);
    });
    console.log('');

    // Test 2: Check if our bucket exists
    console.log('Test 2: Checking bucket existence...');
    const exists = await client.bucketExists(bucketName);
    if (exists) {
      console.log(`✅ Bucket "${bucketName}" exists\n`);
    } else {
      console.log(`❌ Bucket "${bucketName}" does not exist\n`);
      return;
    }

    // Test 3: List objects in bucket
    console.log('Test 3: Listing objects in bucket...');
    const objectsList = [];
    const stream = client.listObjects(bucketName, '', true);
    
    for await (const obj of stream) {
      objectsList.push(obj);
    }
    
    console.log(`✅ Found ${objectsList.length} objects in bucket`);
    if (objectsList.length > 0) {
      console.log('  Recent files:');
      objectsList.slice(0, 5).forEach(obj => {
        console.log(`  - ${obj.name} (${(obj.size / 1024).toFixed(2)} KB)`);
      });
    }
    console.log('');

    // Test 4: Upload test file
    console.log('Test 4: Uploading test file...');
    const testContent = Buffer.from('Hello from BIM AIDED! Test file at ' + new Date().toISOString());
    const testPath = `test/connection-test-${Date.now()}.txt`;
    
    await client.putObject(bucketName, testPath, testContent, testContent.length, {
      'Content-Type': 'text/plain',
    });
    console.log(`✅ Test file uploaded: ${testPath}\n`);

    // Test 5: Generate public URL
    console.log('Test 5: Generating public URL...');
    const publicUrl = `https://pub-9181a67fa2874087b2989b3dd8b45efe.r2.dev/${testPath}`;
    console.log(`✅ Public URL: ${publicUrl}\n`);

    // Test 6: Read the file back
    console.log('Test 6: Reading file back...');
    const readStream = await client.getObject(bucketName, testPath);
    const chunks = [];
    for await (const chunk of readStream) {
      chunks.push(chunk);
    }
    const readContent = Buffer.concat(chunks).toString();
    console.log('✅ File content:', readContent);
    console.log('');

    // Test 7: Clean up
    console.log('Test 7: Cleaning up test file...');
    await client.removeObject(bucketName, testPath);
    console.log('✅ Test file removed\n');

    console.log('🎉 All tests passed! R2 connection is working correctly.\n');
    console.log('Next steps:');
    console.log('1. Deploy Firestore indexes: firebase deploy --only firestore:indexes');
    console.log('2. Restart your Next.js dev server: npm run dev');
    console.log('3. Try uploading an image in the admin panel');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nError Details:');
    console.error('  Code:', error.code);
    console.error('  Status:', error.statusCode);
    
    if (error.code === 'InvalidAccessKeyId') {
      console.error('\n💡 Fix: Your R2 Access Key is invalid or has been revoked.');
      console.error('   Go to: https://dash.cloudflare.com > R2 > Manage R2 API Tokens');
      console.error('   Create a new token and update .env.local');
    } else if (error.code === 'SignatureDoesNotMatch') {
      console.error('\n💡 Fix: Your R2 Secret Key is incorrect.');
      console.error('   Double-check the secret key in .env.local');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('\n💡 Fix: Cannot connect to R2 endpoint.');
      console.error('   Check your internet connection and R2 endpoint URL');
    } else {
      console.error('\n💡 Check the error details above and verify your R2 configuration');
    }
  }
}

// Run the test
testR2Connection().catch(console.error);
