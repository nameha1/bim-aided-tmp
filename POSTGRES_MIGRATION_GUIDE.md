# Migrating from Supabase to PostgreSQL + MinIO

## Why This Setup?

✅ **Simpler** - Just PostgreSQL + MinIO (no complex Supabase stack)  
✅ **Lighter** - Less resource usage on your VPS  
✅ **Full Control** - Direct database and storage access  
✅ **S3-Compatible** - MinIO works like AWS S3  

## Architecture

```
Your App → PostgreSQL (database) + MinIO (file storage)
         → Authentication handled in Next.js
```

## Step 1: Deploy PostgreSQL + MinIO on Coolify

### 1.1 Create New Service in Coolify

1. Go to Coolify Dashboard: http://srv1095294.hstgr.cloud:8000
2. Click "New Resource" → "Docker Compose"
3. Name: "BIMaided Database"
4. Paste contents from `postgres-compose.yml`

### 1.2 Set Environment Variables in Coolify

```bash
# PostgreSQL
POSTGRES_PASSWORD=<strong-password-here>

# MinIO Storage
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=<strong-password-here>

# pgAdmin (optional)
PGADMIN_EMAIL=admin@bimaided.com
PGADMIN_PASSWORD=<strong-password-here>
```

### 1.3 Configure Domains in Coolify

- **PostgreSQL**: No domain needed (internal access only)
- **MinIO API**: `minio.yourdomain.com` → Port 9000
- **MinIO Console**: `minio-console.yourdomain.com` → Port 9001
- **pgAdmin**: `pgadmin.yourdomain.com` → Port 5050

### 1.4 Deploy

Click "Deploy" and wait for all services to start.

## Step 2: Set Up Database Schema

### 2.1 Access pgAdmin

Go to `http://srv1095294.hstgr.cloud:5050` or your domain.

### 2.2 Connect to PostgreSQL

- Host: `postgres` (internal Docker name) or `srv1095294.hstgr.cloud`
- Port: `5432`
- Database: `bimaided`
- Username: `bimaided_user`
- Password: Your `POSTGRES_PASSWORD`

### 2.3 Run Schema

Open Query Tool and paste contents from `database/postgres-schema.sql`, then execute.

## Step 3: Set Up MinIO Buckets

### 3.1 Access MinIO Console

Go to `http://srv1095294.hstgr.cloud:9001`

Login:
- Username: Value of `MINIO_ROOT_USER`
- Password: Value of `MINIO_ROOT_PASSWORD`

### 3.2 Create Buckets

Create these buckets:
- `project-images` - For project photos
- `employee-avatars` - For employee profile pictures
- `documents` - For invoices, receipts, etc.

### 3.3 Set Bucket Policies to Public (for images)

For each bucket, go to "Access" → "Access Policy" → Set to "Public"

Or use this policy for `project-images`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": ["*"]
      },
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::project-images/*"]
    }
  ]
}
```

## Step 4: Update Your Next.js App

### 4.1 Install Required Packages

```bash
npm install pg @aws-sdk/client-s3 @aws-sdk/s3-request-presigner bcryptjs
npm install -D @types/pg @types/bcryptjs
```

### 4.2 Update .env.local

```bash
# Database
DATABASE_URL=postgresql://bimaided_user:YOUR_PASSWORD@srv1095294.hstgr.cloud:5432/bimaided

# MinIO Storage
MINIO_ENDPOINT=srv1095294.hstgr.cloud
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=YOUR_MINIO_PASSWORD
MINIO_USE_SSL=false
MINIO_BUCKET_PROJECTS=project-images
MINIO_BUCKET_EMPLOYEES=employee-avatars
MINIO_BUCKET_DOCUMENTS=documents

# Public URLs (for accessing uploaded files)
NEXT_PUBLIC_MINIO_URL=http://srv1095294.hstgr.cloud:9000

# Session Secret (for authentication)
SESSION_SECRET=your-super-secret-session-key-change-this

# Email (keep existing)
EMAIL_USER=bimaided.website@gmail.com
EMAIL_PASSWORD=rwgy biho ilda memw
EMAIL_TO=tasneemlabeeb@gmail.com

# reCAPTCHA (keep existing)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4.3 Update .env.production

```bash
# Database (use internal Docker network if app is also on Coolify)
DATABASE_URL=postgresql://bimaided_user:YOUR_PASSWORD@postgres:5432/bimaided
# OR use external if app is elsewhere:
# DATABASE_URL=postgresql://bimaided_user:YOUR_PASSWORD@srv1095294.hstgr.cloud:5432/bimaided

# MinIO Storage (use your domain)
MINIO_ENDPOINT=minio.yourdomain.com
MINIO_PORT=443
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=YOUR_MINIO_PASSWORD
MINIO_USE_SSL=true
MINIO_BUCKET_PROJECTS=project-images
MINIO_BUCKET_EMPLOYEES=employee-avatars
MINIO_BUCKET_DOCUMENTS=documents

# Public URLs
NEXT_PUBLIC_MINIO_URL=https://minio.yourdomain.com

# Session Secret
SESSION_SECRET=your-super-secret-session-key-change-this

# App URL
NEXT_PUBLIC_APP_URL=https://bimaided.com
```

## Step 5: Create Database & Storage Helpers

I'll create these helper files for you:
- `lib/db.ts` - PostgreSQL connection
- `lib/storage.ts` - MinIO storage client
- `lib/auth.ts` - Session-based authentication

## Step 6: Migrate Existing Data

If you have data in Supabase:

1. Export from Supabase:
   - Use pgAdmin or `pg_dump` to export data
   - Or export via Supabase Studio

2. Import to PostgreSQL:
   - Use pgAdmin Query Tool
   - Or `psql` command line

## File Upload Flow

### For Project Images:

```typescript
// 1. User uploads file
// 2. Upload to MinIO
const fileName = `${projectId}-${Date.now()}.jpg`;
await uploadToMinio('project-images', fileName, file);

// 3. Save URL to database
const imageUrl = `${MINIO_URL}/project-images/${fileName}`;
await db.query(
  'UPDATE projects SET image_url = $1 WHERE id = $2',
  [imageUrl, projectId]
);
```

## Advantages vs Supabase

✅ **Simpler**: Just 2 services vs 15+ Supabase containers  
✅ **Faster**: Direct PostgreSQL queries, no REST API overhead  
✅ **Lighter**: ~500MB RAM vs 2-4GB for Supabase  
✅ **Flexible**: Full SQL control, no RLS complexity  
✅ **Cost**: More efficient resource usage  

## What You Lose

❌ **Auto-generated REST API** - You write your own API routes  
❌ **Built-in Auth** - You implement sessions/JWT yourself  
❌ **Real-time subscriptions** - Would need to add separately  
❌ **Storage policies** - MinIO bucket policies instead  

## Next Steps

1. Deploy PostgreSQL + MinIO on Coolify
2. Run the schema SQL
3. Install npm packages
4. I'll create the helper files for you
5. Update your API routes to use PostgreSQL directly
6. Test locally, then deploy

Ready to proceed? I can create the database and storage helper files for you.
