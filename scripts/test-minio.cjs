/**
 * MinIO Storage Connection Test
 * Run this to verify your MinIO setup is working correctly
 */

require('dotenv').config({ path: '.env.local' });
const Minio = require('minio');

console.log('Testing MinIO Connection...\n');

// Configuration
const config = {
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
};

console.log('Configuration:');
console.log(`  Endpoint: ${config.endPoint}:${config.port}`);
console.log(`  SSL: ${config.useSSL}`);
console.log(`  Access Key: ${config.accessKey ? '***' + config.accessKey.slice(-4) : 'NOT SET'}`);
console.log(`  Secret Key: ${config.secretKey ? '***' : 'NOT SET'}\n`);

// Check if credentials are set
if (!config.accessKey || !config.secretKey) {
  console.error('❌ MinIO credentials not set in .env.local');
  console.log('\nPlease update your .env.local file with:');
  console.log('  MINIO_ACCESS_KEY=your-access-key');
  console.log('  MINIO_SECRET_KEY=your-secret-key');
  process.exit(1);
}

// Create client
const client = new Minio.Client(config);

const bucketName = process.env.MINIO_BUCKET || 'bimaided';

// Test connection
async function test() {
  try {
    // 1. List buckets
    console.log('1. Testing connection by listing buckets...');
    const buckets = await client.listBuckets();
    console.log('✅ Connection successful!');
    console.log(`   Found ${buckets.length} bucket(s):`);
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (created: ${bucket.creationDate})`);
    });

    // 2. Check if our bucket exists
    console.log(`\n2. Checking if bucket "${bucketName}" exists...`);
    const bucketExists = await client.bucketExists(bucketName);
    
    if (bucketExists) {
      console.log(`✅ Bucket "${bucketName}" exists`);
    } else {
      console.log(`⚠️  Bucket "${bucketName}" does not exist`);
      console.log(`   Creating bucket...`);
      await client.makeBucket(bucketName, 'us-east-1');
      console.log(`✅ Bucket "${bucketName}" created successfully`);
      
      // Set public policy for /public/ path
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/public/*`],
          },
        ],
      };
      
      await client.setBucketPolicy(bucketName, JSON.stringify(policy));
      console.log('✅ Public access policy set for /public/* path');
    }

    // 3. Test file upload
    console.log('\n3. Testing file upload...');
    const testContent = Buffer.from('Hello from MinIO! ' + new Date().toISOString());
    const testFileName = `test/test-${Date.now()}.txt`;
    
    await client.putObject(
      bucketName,
      testFileName,
      testContent,
      testContent.length,
      { 'Content-Type': 'text/plain' }
    );
    console.log(`✅ Test file uploaded: ${testFileName}`);

    // 4. Test file read
    console.log('\n4. Testing file download...');
    const stream = await client.getObject(bucketName, testFileName);
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const downloadedContent = Buffer.concat(chunks).toString();
    console.log(`✅ Test file downloaded`);
    console.log(`   Content: ${downloadedContent}`);

    // 5. Get file URL
    console.log('\n5. Testing file URL generation...');
    const protocol = config.useSSL ? 'https' : 'http';
    const port = config.useSSL && config.port === 443 ? '' : `:${config.port}`;
    const publicUrl = `${protocol}://${config.endPoint}${port}/${bucketName}/${testFileName}`;
    console.log(`✅ Public URL: ${publicUrl}`);

    // 6. Get presigned URL
    console.log('\n6. Testing presigned URL generation...');
    const presignedUrl = await client.presignedGetObject(bucketName, testFileName, 3600);
    console.log(`✅ Presigned URL generated (expires in 1 hour)`);
    console.log(`   URL: ${presignedUrl.substring(0, 80)}...`);

    // 7. List files
    console.log('\n7. Testing file listing...');
    const stream2 = client.listObjects(bucketName, 'test/', true);
    let fileCount = 0;
    for await (const obj of stream2) {
      fileCount++;
      console.log(`   - ${obj.name} (${obj.size} bytes)`);
    }
    console.log(`✅ Listed ${fileCount} file(s) in test/ directory`);

    // 8. Clean up test file
    console.log('\n8. Cleaning up test file...');
    await client.removeObject(bucketName, testFileName);
    console.log(`✅ Test file deleted`);

    // Success!
    console.log('\n' + '='.repeat(60));
    console.log('🎉 All MinIO tests passed successfully!');
    console.log('='.repeat(60));
    console.log('\nYour MinIO storage is ready to use!');
    console.log('\nNext steps:');
    console.log('1. Update your code to use @/lib/storage for file operations');
    console.log('2. Migrate existing files from Supabase to MinIO');
    console.log('3. Test file uploads in your application');
    console.log('\nSee MINIO_SETUP_GUIDE.md for detailed usage examples.');

  } catch (error) {
    console.error('\n❌ MinIO test failed:', error.message);
    console.log('\n⚠️  Possible issues:');
    console.log('   - MinIO server is not running');
    console.log('   - Incorrect endpoint or port');
    console.log('   - Invalid access key or secret key');
    console.log('   - Firewall blocking connection');
    console.log('\n📝 Troubleshooting:');
    console.log(`   1. Check if MinIO is running: http://${config.endPoint}:9001`);
    console.log('   2. Verify credentials in MinIO console');
    console.log('   3. Check firewall: sudo ufw status');
    console.log('   4. Review MINIO_SETUP_GUIDE.md for installation steps');
    process.exit(1);
  }
}

test();
