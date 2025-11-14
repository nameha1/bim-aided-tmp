# Cloudflare R2 Setup for Project Images

✅ **Status: Cloudflare R2 is configured and working!**

## Current Configuration

- **Bucket Name:** bimaided
- **Endpoint:** d28078bd8d86342463905c45d566137c.r2.cloudflarestorage.com
- **Public URL:** https://d28078bd8d86342463905c45d566137c.r2.cloudflarestorage.com/bimaided
- **Existing Files:** ✓ (You already have files uploaded)

## How to Upload Project Images

### Option 1: Via Admin Panel (Recommended)

1. Log in as admin
2. Go to Projects section
3. Click "Add Project" or edit existing project
4. Use the image upload field
5. Images are automatically uploaded to R2

### Option 2: Direct API Upload

```bash
# Test upload via API
curl -X POST http://localhost:3000/api/upload-image \
  -F "file=@/path/to/image.jpg" \
  -F "folder=public/projects"
```

## Setting Up Custom Domain (Optional but Recommended)

### Why Use a Custom Domain?
- Better performance
- Cleaner URLs (e.g., `cdn.bimaided.com/image.jpg`)
- Better SEO
- Professional appearance

### Steps to Set Up Custom Domain:

#### 1. Create a Subdomain in Cloudflare DNS

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your domain (bimaided.com)
3. Go to **DNS** > **Records**
4. Add a new **CNAME** record:
   - **Name:** cdn (or images, or assets)
   - **Target:** Your R2 bucket endpoint
   - **Proxy status:** Proxied (orange cloud) ✅
   - Click **Save**

#### 2. Connect Domain to R2 Bucket

1. In Cloudflare Dashboard, go to **R2** > **bimaided** bucket
2. Click **Settings** tab
3. Scroll to **Public Access**
4. Click **Connect Domain**
5. Enter your custom domain: `cdn.bimaided.com`
6. Click **Connect Domain**

#### 3. Update Environment Variables

In your `.env.local` file, update:

```env
NEXT_PUBLIC_R2_PUBLIC_URL=https://cdn.bimaided.com
```

#### 4. Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## Enabling Public Access (If Not Already Enabled)

If images are not publicly accessible:

1. Go to **R2** > **bimaided** bucket
2. Click **Settings** tab
3. Under **Public Access**, click **Allow Access**
4. Confirm the action

**Note:** Cloudflare R2 gives you:
- 10 GB free storage
- Unlimited egress (free bandwidth)
- Perfect for project images

## Testing Image Upload

### Test via Browser:

1. Go to `/admin` (as admin)
2. Navigate to Projects
3. Add a new project
4. Upload an image
5. The image URL should be returned

### Verify Upload:

```bash
# Run the R2 test script
node scripts/setup-r2.cjs
```

## Current Files in R2

You already have these files:
- `public/uploads/1762870931241-Picture4.png` (12.74 KB)
- `test/bimaided-test.html` (1.45 KB)

## Folder Structure Recommendation

```
bimaided/                          (R2 bucket root)
├── public/                        (Publicly accessible files)
│   ├── projects/                  (Project images)
│   │   ├── project-1-hero.jpg
│   │   ├── project-1-gallery-1.jpg
│   │   └── ...
│   ├── uploads/                   (General uploads)
│   └── images/                    (Other public images)
└── private/                       (Private files, use presigned URLs)
    └── documents/
```

## API Endpoints

### Upload Image
```
POST /api/upload-image
Content-Type: multipart/form-data

Fields:
- file: Image file (max 5MB)
- folder: Target folder (default: public/uploads)

Response:
{
  "success": true,
  "data": {
    "url": "https://...r2.cloudflarestorage.com/bimaided/public/projects/image.jpg",
    "path": "public/projects/image.jpg",
    "fileName": "image.jpg",
    "size": 123456,
    "type": "image/jpeg"
  }
}
```

## Security Notes

✅ **Already Configured:**
- Access keys stored in environment variables (not in code)
- HTTPS/SSL enabled
- File type validation (images only)
- File size limits (5MB max)

## Troubleshooting

### Images Not Loading?

1. **Check public access:**
   ```bash
   node scripts/setup-r2.cjs
   ```

2. **Verify URL format:**
   - Should be: `https://[account-id].r2.cloudflarestorage.com/[bucket]/[path]`
   - Or custom domain: `https://cdn.bimaided.com/[path]`

3. **Check CORS settings** (if accessing from browser):
   - Go to R2 bucket settings
   - Add CORS policy if needed

### Upload Fails?

1. Check credentials in `.env.local`
2. Verify bucket exists
3. Check file size (max 5MB)
4. Check file type (only images allowed)

## Next Steps

1. ✅ R2 is working - you can upload now!
2. 🌐 (Optional) Set up custom domain for cleaner URLs
3. 🖼️ Upload your project images via admin panel
4. 📱 Test on production after deployment

---

**Quick Test:** Try uploading an image via the admin panel now - it should work immediately!
