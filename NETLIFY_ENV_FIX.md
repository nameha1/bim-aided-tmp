# Netlify Environment Variables - 4KB Limit Fix

## Problem
Your deployment failed with: **"Your environment variables exceed the 4KB limit imposed by AWS Lambda"**

You had **43 environment variables** (many duplicates), exceeding the 4KB limit.

## Solution Applied

### 1. ✅ Removed Duplicate MinIO Variables
Since you're using Cloudflare R2, the MinIO variables were redundant:
- ❌ Removed: `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_USE_SSL`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`
- ❌ Removed: `MINIO_BROWSER_REDIRECT`, `MINIO_BROWSER_REDIRECT_URL`
- ❌ Removed: `NEXT_PUBLIC_MINIO_ENDPOINT`, `NEXT_PUBLIC_MINIO_PORT`, `NEXT_PUBLIC_MINIO_USE_SSL`

**Total removed: 11 variables**

### 2. ✅ Consolidated Email Variables
Removed duplicate email configuration:
- ❌ Removed: `EMAIL_USER`, `EMAIL_PASSWORD`, `SMTP_ADMIN_EMAIL`
- ✅ Kept: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SENDER_NAME`, `EMAIL_TO`

**Reduced from 9 to 6 variables**

### 3. ✅ Removed Unused Variables
- ❌ Removed: `NEXT_PUBLIC_APP_URL` (not used anywhere)

### 4. ✅ Updated Code References
- Updated `/app/api/send-contact-email/route.ts` to use consolidated SMTP variables

## Final Environment Variables Count

**Before:** 43 variables ❌  
**After:** ~28 variables ✅  
**Savings:** ~35% reduction (should be well under 4KB)

## Variables to Set in Netlify

Go to **Netlify Dashboard → Site Settings → Environment Variables** and ensure these are set:

### Firebase (7 variables)
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
FIREBASE_SERVICE_ACCOUNT_KEY
```

### Cloudflare R2 (6 variables)
```
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_R2_ACCESS_KEY_ID
CLOUDFLARE_R2_SECRET_ACCESS_KEY
CLOUDFLARE_R2_BUCKET
CLOUDFLARE_R2_ENDPOINT
NEXT_PUBLIC_R2_PUBLIC_URL
```

### Email (6 variables)
```
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_SENDER_NAME
EMAIL_TO
```

### Application (2 variables)
```
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_USE_FIREBASE_EMULATOR
```

### reCAPTCHA (2 variables)
```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY
RECAPTCHA_SECRET_KEY
```

### Build (2 variables - already in netlify.toml)
```
NODE_VERSION
SECRETS_SCAN_OMIT_PATHS
```

## Next Steps

1. **Remove old variables from Netlify:**
   - Go to Netlify Dashboard → Your Site → Site Settings → Environment Variables
   - Delete all MINIO_* variables
   - Delete EMAIL_USER, EMAIL_PASSWORD, SMTP_ADMIN_EMAIL
   - Delete NEXT_PUBLIC_APP_URL
   - Delete NEXT_PUBLIC_MINIO_* variables

2. **Verify remaining variables match the list above**

3. **Trigger a new deployment:**
   ```bash
   git add .
   git commit -m "fix: reduce environment variables to fix 4KB Lambda limit"
   git push
   ```

4. **Monitor the build logs** - it should now deploy successfully!

## Verification

After deployment, test:
- ✅ File uploads (Cloudflare R2 should still work)
- ✅ Contact form (email should still send)
- ✅ Firebase authentication
- ✅ All other features

## Notes

- The code already had fallback logic for MinIO → Cloudflare R2, so no functionality is lost
- All email functionality consolidated under SMTP_* variables
- Your `.env.local` file has been updated for consistency
