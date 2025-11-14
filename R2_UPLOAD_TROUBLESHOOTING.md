# Cloudflare R2 Upload Troubleshooting Guide

## Issue
Image upload is failing with 500 error when adding projects.

## Error
```
api/upload-image:1 Failed to load resource: the server responded with a status of 500 ()
```

## Root Causes & Solutions

### 1. Check Environment Variables

Verify your `.env.local` has correct R2 credentials:

```bash
CLOUDFLARE_ACCOUNT_ID=d28078bd8d86342463905c45d566137c
CLOUDFLARE_R2_ACCESS_KEY_ID=2d83148d1b4ca6c5016634f745e10784
CLOUDFLARE_R2_SECRET_ACCESS_KEY=4f3980a2eea968fd76b27730b61caf33dd840baa3b14b7a73f647fc4cf246b81
CLOUDFLARE_R2_BUCKET=bimaided
CLOUDFLARE_R2_ENDPOINT=https://d28078bd8d86342463905c45d566137c.r2.cloudflarestorage.com
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-9181a67fa2874087b2989b3dd8b45efe.r2.dev
```

### 2. Verify R2 Bucket Configuration

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to R2 → Buckets → `bimaided`
3. Check:
   - ✅ Bucket exists
   - ✅ Public access is enabled
   - ✅ CORS is configured (if needed)

### 3. Test R2 Access Keys

Run this test to verify credentials work:

```bash
# Create test file
node -e "
const Minio = require('minio');
const client = new Minio.Client({
  endPoint: 'd28078bd8d86342463905c45d566137c.r2.cloudflarestorage.com',
  port: 443,
  useSSL: true,
  accessKey: '2d83148d1b4ca6c5016634f745e10784',
  secretKey: '4f3980a2eea968fd76b27730b61caf33dd840baa3b14b7a73f647fc4cf246b81',
});

client.listBuckets().then(buckets => {
  console.log('✅ R2 Connection successful!');
  console.log('Buckets:', buckets);
}).catch(err => {
  console.error('❌ R2 Connection failed:', err.message);
});
"
```

### 4. Check Server Logs

When you try to upload, check the terminal where Next.js is running. You should see:

```
[Upload API] Starting upload request...
[Upload API] File: filename.jpg Size: 123456 Folder: public/uploads
[R2] Starting upload: { path: '...', bucketName: 'bimaided', fileType: 'File' }
[R2] Converted to buffer: { size: 123456, contentType: 'image/jpeg' }
[R2] Uploading to bucket: { bucketName: 'bimaided', path: '...', size: 123456 }
[R2] Upload successful: { url: '...', path: '...' }
```

If you see errors, they will show:
- `[R2] Error details:` - Shows the exact R2 error
- Error code, status code, and message

### 5. Common R2 Errors

#### "Access Denied"
- **Cause**: Invalid access keys or insufficient permissions
- **Fix**: 
  1. Go to R2 → Manage R2 API Tokens
  2. Create new API token with Admin Read & Write permissions
  3. Update `.env.local` with new credentials

#### "No Such Bucket"
- **Cause**: Bucket name mismatch
- **Fix**: Verify bucket name is exactly `bimaided`

#### "SignatureDoesNotMatch"
- **Cause**: Wrong secret key or encoding issue
- **Fix**: Copy-paste credentials directly from Cloudflare dashboard

#### "Network Error" / "ECONNREFUSED"
- **Cause**: Endpoint URL is incorrect
- **Fix**: Use the format: `ACCOUNT_ID.r2.cloudflarestorage.com` (no https://)

### 6. Restart Development Server

After updating environment variables:

```bash
# Stop the server (Ctrl+C)
# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

### 7. Alternative: Use Firebase Storage Instead

If R2 continues to fail, you can temporarily switch to Firebase Storage:

1. Update `lib/storage/minio.ts` to use Firebase Storage SDK
2. Or keep R2 and add Firebase as fallback

## Testing Upload

After fixes, test the upload:

1. Go to Admin → Projects
2. Click "Add New Project"
3. Fill in the form
4. Upload an image
5. Check browser console and server logs
6. Verify image appears in R2 bucket

## Files Updated

The following files have been updated with better error logging:
- ✅ `/app/api/upload-image/route.ts` - Added detailed logging
- ✅ `/lib/storage/minio.ts` - Added R2 operation logging
- ✅ `/lib/storage/minio-client.ts` - Fixed endpoint configuration

## Next Steps

1. Deploy Firestore indexes (see FIRESTORE_INDEXES_PROJECTS.md)
2. Check server logs when uploading
3. Verify R2 credentials in Cloudflare dashboard
4. Test upload again
5. Report specific error messages if issue persists
