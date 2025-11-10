/**
 * Test MinIO Connection
 * Verifies MinIO credentials and bucket access
 */

require('dotenv').config({ path: '.env.local' });
const Minio = require('minio');

// MinIO Configuration
const minioConfig = {
  endPoint: process.env.MINIO_ENDPOINT || '72.60.222.97',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'rzicugo7mgcanezn',
};

const BUCKET_NAME = process.env.MINIO_BUCKET || 'bimaided';

async function testMinioConnection() {
  console.log('\n🔧 Testing MinIO Connection...\n');
  console.log('Configuration:', {
    endpoint: minioConfig.endPoint,
    port: minioConfig.port,
    useSSL: minioConfig.useSSL,
    bucket: BUCKET_NAME,
  });
  console.log('\n');

  try {
    // Initialize MinIO client
    const minioClient = new Minio.Client(minioConfig);
    console.log('✅ MinIO client initialized');

    // Test 1: List buckets
    console.log('\n📦 Listing all buckets...');
    const buckets = await minioClient.listBuckets();
    console.log(`Found ${buckets.length} bucket(s):`);
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (created: ${bucket.creationDate})`);
    });

    // Test 2: Check if our bucket exists
    console.log(`\n🔍 Checking if bucket "${BUCKET_NAME}" exists...`);
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    
    if (bucketExists) {
      console.log(`✅ Bucket "${BUCKET_NAME}" exists`);
    } else {
      console.log(`⚠️  Bucket "${BUCKET_NAME}" does not exist. Creating it...`);
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`✅ Bucket "${BUCKET_NAME}" created successfully`);

      // Set bucket policy for public access
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/public/*`],
          },
        ],
      };
      
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
      console.log('✅ Bucket policy set for public access to /public/* files');
    }

    // Test 3: List objects in bucket
    console.log(`\n📄 Listing objects in "${BUCKET_NAME}"...`);
    const objectsList = [];
    const stream = minioClient.listObjects(BUCKET_NAME, '', true);
    
    for await (const obj of stream) {
      objectsList.push(obj);
    }

    if (objectsList.length > 0) {
      console.log(`Found ${objectsList.length} object(s):`);
      objectsList.slice(0, 10).forEach(obj => {
        const sizeMB = (obj.size / (1024 * 1024)).toFixed(2);
        console.log(`  - ${obj.name} (${sizeMB} MB)`);
      });
      if (objectsList.length > 10) {
        console.log(`  ... and ${objectsList.length - 10} more`);
      }
    } else {
      console.log('No objects found in bucket');
    }

    // Test 4: Upload a test file
    console.log('\n📤 Testing file upload...');
    const testFileName = 'test/connection-test.txt';
    const testContent = Buffer.from(`MinIO connection test - ${new Date().toISOString()}`);
    
    await minioClient.putObject(BUCKET_NAME, testFileName, testContent);
    console.log(`✅ Test file uploaded: ${testFileName}`);

    // Test 5: Generate public URL
    const protocol = minioConfig.useSSL ? 'https' : 'http';
    const port = minioConfig.useSSL && minioConfig.port === 443 ? '' : `:${minioConfig.port}`;
    const publicUrl = `${protocol}://${minioConfig.endPoint}${port}/${BUCKET_NAME}/${testFileName}`;
    console.log(`📎 Public URL: ${publicUrl}`);

    // Test 6: Download the test file
    console.log('\n📥 Testing file download...');
    const stream2 = await minioClient.getObject(BUCKET_NAME, testFileName);
    const chunks = [];
    for await (const chunk of stream2) {
      chunks.push(chunk);
    }
    const downloadedContent = Buffer.concat(chunks).toString();
    console.log('✅ File downloaded successfully');
    console.log(`Content: ${downloadedContent}`);

    // Test 7: Delete test file
    console.log('\n🗑️  Cleaning up test file...');
    await minioClient.removeObject(BUCKET_NAME, testFileName);
    console.log('✅ Test file deleted');

    console.log('\n✅ All MinIO tests passed! Connection is working correctly.\n');
    console.log('🎉 You can now use MinIO for file storage!\n');

  } catch (error) {
    console.error('\n❌ MinIO Connection Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Verify MinIO server is running and accessible');
    console.error('2. Check firewall rules for port', minioConfig.port);
    console.error('3. Verify credentials (MINIO_ACCESS_KEY and MINIO_SECRET_KEY)');
    console.error('4. Ensure network connectivity to', minioConfig.endPoint);
    process.exit(1);
  }
}

testMinioConnection();
