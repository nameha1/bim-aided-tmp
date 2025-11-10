# Hybrid Storage Architecture: Firebase + MinIO

## Overview

This application uses a **hybrid approach** for backend services:

- **Firebase**: Authentication, Firestore Database, and user management
- **MinIO**: Self-hosted S3-compatible storage for files and images

This architecture provides the best of both worlds:
- Firebase's robust auth and real-time database
- MinIO's cost-effective, self-hosted file storage

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  BIM-AIDED Application                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐         ┌────────────────────┐   │
│  │   Firebase Auth  │         │  MinIO Storage     │   │
│  │   - Login/Logout │         │  - Image Uploads   │   │
│  │   - User Sessions│         │  - File Storage    │   │
│  └────────┬─────────┘         └─────────┬──────────┘   │
│           │                             │              │
│  ┌────────▼─────────┐                   │              │
│  │ Firestore DB     │                   │              │
│  │ - employees      │                   │              │
│  │ - projects       │                   │              │
│  │ - assignments    │                   │              │
│  │ - payroll        │                   │              │
│  │ - transactions   │                   │              │
│  │ - invoices       │                   │              │
│  └──────────────────┘                   │              │
│                                         │              │
│                   Next.js App Router    │              │
│                   API Routes ───────────┘              │
└─────────────────────────────────────────────────────────┘
```

---

## Firebase Configuration

### Client-Side (Browser)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bimaided-b4447.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bimaided-b4447
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bimaided-b4447.firebasestorage.app
```

### Server-Side (API Routes)
```env
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account", ...}'
```

### What Firebase Handles
1. **Authentication**: User login, logout, session management
2. **Firestore Database**: All application data
   - Users & roles
   - Employees
   - Projects & assignments
   - Payroll records
   - Transactions & invoices
   - Leave requests
   - Attendance records
3. **Security**: RLS (Row Level Security) via Firestore rules

---

## MinIO Configuration

### Server Configuration
```env
MINIO_ENDPOINT=bimaided-minio-071b16-72-60-222-97.traefik.me
MINIO_PORT=80
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=rzicugo7mgcanezn
MINIO_BUCKET=bimaided
```

### Public URL Configuration
```env
NEXT_PUBLIC_MINIO_ENDPOINT=bimaided-minio-071b16-72-60-222-97.traefik.me
NEXT_PUBLIC_MINIO_PORT=80
NEXT_PUBLIC_MINIO_USE_SSL=false
```

### What MinIO Handles
1. **File Storage**: Images, documents, attachments
2. **Public Files**: Project images, profile pictures
3. **Private Files**: Employee documents, invoices (with presigned URLs)

---

## File Upload Implementation

### API Route: `/app/api/upload-image/route.ts`

```typescript
import { uploadFile } from '@/lib/storage/minio';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const folder = formData.get('folder') as string || 'public/uploads';

  // Upload to MinIO
  const { data, error } = await uploadFile(filePath, file);
  
  return NextResponse.json({
    success: true,
    data: { url: data?.url, path: data?.path }
  });
}
```

### Client-Side Upload Example

```typescript
// Upload an image
const formData = new FormData();
formData.append('file', imageFile);
formData.append('folder', 'public/projects');

const response = await fetch('/api/upload-image', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log('Image URL:', result.data.url);
```

---

## Storage Library: `/lib/storage/minio.ts`

### Available Functions

#### 1. Upload File
```typescript
import { uploadFile } from '@/lib/storage/minio';

const { data, error } = await uploadFile(
  'public/images/logo.png',  // path
  fileBlob,                   // file
  { 'Content-Type': 'image/png' } // metadata
);
```

#### 2. Get File URL
```typescript
import { getFileUrl } from '@/lib/storage/minio';

// Public URL
const { data: url } = await getFileUrl('public/images/logo.png');

// Presigned URL (for private files)
const { data: url } = await getFileUrl('private/invoice.pdf', 'bimaided', true, 3600);
```

#### 3. Delete File
```typescript
import { deleteFile } from '@/lib/storage/minio';

const { error } = await deleteFile('public/images/old-logo.png');
```

#### 4. List Files
```typescript
import { listFiles } from '@/lib/storage/minio';

const { data: files } = await listFiles('public/projects/');
// Returns: [{ name, size, lastModified }, ...]
```

#### 5. Check File Exists
```typescript
import { fileExists } from '@/lib/storage/minio';

const exists = await fileExists('public/images/logo.png');
```

---

## Folder Structure in MinIO

```
bimaided (bucket)
├── public/
│   ├── uploads/           # General uploads
│   ├── projects/          # Project images
│   ├── employees/         # Profile pictures
│   └── services/          # Service images
├── private/
│   ├── invoices/          # Invoice PDFs
│   ├── documents/         # Employee documents
│   └── reports/           # Payroll reports
└── temp/                  # Temporary files
```

---

## Testing MinIO Connection

### Run Test Script
```bash
npm run test-minio
```

### Expected Output
```
🔧 Testing MinIO Connection...

✅ MinIO client initialized
📦 Listing all buckets...
Found 1 bucket(s):
  - bimaided (created: 2025-01-01)

✅ Bucket "bimaided" exists
📄 Listing objects in "bimaided"...
📤 Testing file upload...
✅ Test file uploaded: test/connection-test.txt
📎 Public URL: http://...
📥 Testing file download...
✅ File downloaded successfully
🗑️  Cleaning up test file...
✅ Test file deleted

✅ All MinIO tests passed!
```

---

## Troubleshooting

### MinIO Connection Issues

**Problem**: `ECONNREFUSED` or connection timeout

**Solutions**:
1. Verify MinIO server is running:
   ```bash
   curl http://bimaided-minio-071b16-72-60-222-97.traefik.me
   ```

2. Check firewall rules allow port 80

3. Verify credentials in `.env.local`:
   ```env
   MINIO_ACCESS_KEY=minioadmin
   MINIO_SECRET_KEY=rzicugo7mgcanezn
   ```

4. Test with MinIO CLI:
   ```bash
   mc alias set myminio http://bimaided-minio-071b16-72-60-222-97.traefik.me minioadmin rzicugo7mgcanezn
   mc ls myminio
   ```

### Upload Fails

**Problem**: File upload returns 500 error

**Solutions**:
1. Check bucket exists: `npm run test-minio`
2. Verify file size is under 5MB
3. Check file type is allowed (images only)
4. Review server logs for detailed error

### File URLs Not Working

**Problem**: File uploaded but URL returns 404

**Solutions**:
1. Ensure file is in `public/*` folder for public access
2. Check bucket policy allows public read
3. Verify NEXT_PUBLIC_MINIO_ENDPOINT is correct
4. Use presigned URLs for private files

---

## Migration Status

### ✅ Completed
- Firebase Authentication setup
- Firestore database with 9 collections
- Firebase Admin SDK for server-side operations
- MinIO storage library implementation
- Upload API route (`/api/upload-image`)
- Auth state management
- Session handling with cookies

### 🔄 In Progress
- MinIO connection verification (network issues)
- Testing file uploads end-to-end

### 📋 TODO
- Migrate existing Firebase Storage files to MinIO
- Add image compression/optimization
- Implement file upload in admin components:
  - Project images
  - Employee profile pictures
  - Invoice PDFs
- Add file deletion to cleanup storage

---

## Security Considerations

### Firebase
- ✅ Service account key stored securely in `.env.local`
- ✅ Client credentials use `NEXT_PUBLIC_` prefix (safe for browser)
- ✅ API routes use Admin SDK for privileged operations
- ✅ Firestore rules enforce RLS

### MinIO
- ✅ Access keys stored in `.env.local` (not committed to git)
- ✅ Public files in `public/*` folder
- ✅ Private files require presigned URLs
- ⚠️ Bucket policy allows public read for `public/*` only
- 🔒 Consider enabling SSL/TLS in production

---

## Performance Optimization

### Firebase
- Use compound indexes for complex queries
- Fetch all data and filter in JavaScript (for small datasets < 1000 items)
- Cache frequently accessed data in React state

### MinIO
- Use CDN for public files (optional)
- Generate presigned URLs with appropriate expiry
- Implement lazy loading for images
- Compress images before upload

---

## Deployment Checklist

### Firebase
- [ ] Verify Firestore indexes are created
- [ ] Test authentication flow
- [ ] Check Firestore security rules
- [ ] Verify service account permissions

### MinIO
- [ ] Ensure MinIO server is accessible from production
- [ ] Update MINIO_ENDPOINT to production URL
- [ ] Enable SSL/TLS (set MINIO_USE_SSL=true)
- [ ] Configure CDN if needed
- [ ] Test file uploads from production
- [ ] Verify bucket policies

### Environment Variables
- [ ] All env vars set in production
- [ ] Service account key properly formatted
- [ ] Public URLs point to production endpoints
- [ ] SMTP credentials verified for emails

---

## Useful Commands

```bash
# Test Firebase connection
npm run test-firebase

# Test MinIO connection
npm run test-minio

# Setup Firestore collections
npm run setup-firestore

# Build for production
npm run build

# Start production server
npm start

# Development server
npm run dev
```

---

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in terminal
3. Test individual services (Firebase, MinIO)
4. Verify environment variables
5. Check network connectivity

---

**Last Updated**: November 10, 2025  
**Version**: 1.0.0  
**Architecture**: Hybrid (Firebase + MinIO)
