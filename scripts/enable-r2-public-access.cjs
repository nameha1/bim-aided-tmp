require('dotenv').config({ path: '.env.local' });
const Minio = require('minio');

const client = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'd28078bd8d86342463905c45d566137c.r2.cloudflarestorage.com',
  port: 443,
  useSSL: true,
  accessKey: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
  secretKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'bimaided';

async function enablePublicAccess() {
  console.log('\n🔓 Enabling Public Access for R2 Bucket\n');
  console.log('═══════════════════════════════════════════════════\n');
  
  try {
    // Check if bucket exists
    const exists = await client.bucketExists(BUCKET_NAME);
    if (!exists) {
      console.log(`❌ Bucket "${BUCKET_NAME}" does not exist!`);
      return;
    }
    
    console.log(`✅ Bucket "${BUCKET_NAME}" found\n`);
    
    // Set bucket policy to allow public read access
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadForPublicFolder',
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/public/*`]
        }
      ]
    };
    
    console.log('📝 Setting bucket policy...');
    console.log('   This will allow public read access to all files in /public/*\n');
    
    await client.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
    
    console.log('✅ Public access enabled successfully!\n');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('📋 Policy Summary:');
    console.log('   • Bucket: bimaided');
    console.log('   • Public Access: /public/* (read-only)');
    console.log('   • Images are now publicly accessible!\n');
    
    console.log('🔗 Example URL:');
    const endpoint = process.env.MINIO_ENDPOINT;
    console.log(`   https://${endpoint}/${BUCKET_NAME}/public/projects/main/your-image.jpg\n`);
    
    console.log('💡 Next Steps:');
    console.log('   1. Test by visiting the URL above with your actual image');
    console.log('   2. Add new projects via /admin panel');
    console.log('   3. Images will now load on the website!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Note: Cloudflare R2 may not support bucket policies via S3 API.');
    console.log('   You need to enable public access through Cloudflare Dashboard:\n');
    console.log('   1. Go to: https://dash.cloudflare.com');
    console.log('   2. Navigate to: R2 > Your Bucket (bimaided)');
    console.log('   3. Click: Settings > Public Access');
    console.log('   4. Enable: "Allow Public Access"');
    console.log('   5. Or set up a custom domain for public access\n');
  }
  
  process.exit(0);
}

enablePublicAccess();
