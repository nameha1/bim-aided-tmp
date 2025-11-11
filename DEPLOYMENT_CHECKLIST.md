# Netlify Deployment Checklist

## ✅ Pre-Deployment (Completed)
- [x] Removed conflicting config files (Vite-specific tsconfig files)
- [x] Removed Vercel-specific files
- [x] Cleaned and simplified `netlify.toml`
- [x] Fixed environment variable naming (NEXT_PUBLIC_* instead of VITE_*)
- [x] Updated package.json with correct project name
- [x] Fresh install of dependencies
- [x] Pushed clean code to GitHub

## 📋 Your Next Steps

### 1. Go to Netlify Dashboard
Visit: https://app.netlify.com

### 2. Import Your Repository
1. Click "Add new site" → "Import an existing project"
2. Select GitHub
3. Choose repository: `nameha1/bim-aided-tmp`
4. Branch: `main`

### 3. Configure Build Settings (Should Auto-detect)
Verify these settings:
- Base directory: _(leave empty)_
- Build command: `npm run build`
- Publish directory: `.next`

### 4. Add Environment Variables (CRITICAL!)
Click "Show advanced" → "New variable" and add ALL of these:

#### Firebase (Required)
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_SERVICE_ACCOUNT_KEY
```

#### MinIO Storage (Required)
```
MINIO_ENDPOINT
MINIO_PORT
MINIO_ACCESS_KEY
MINIO_SECRET_KEY
MINIO_USE_SSL
```

#### Email (Required)
```
EMAIL_USER
EMAIL_PASSWORD
EMAIL_TO
```

#### reCAPTCHA (Optional)
```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY
RECAPTCHA_SECRET_KEY
```

### 5. Deploy
Click "Deploy site" button

### 6. Wait for Build
- Initial build takes 3-5 minutes
- Watch the deploy logs for any errors

### 7. Test Your Site
1. Click on the generated URL (e.g., `https://random-name.netlify.app`)
2. Open browser DevTools (F12) to check Console for errors
3. Test key functionality:
   - Login/Authentication
   - Project pages
   - Contact form
   - Admin panel

## 🐛 If You See a White Screen

### Check These:
1. **Deploy Logs** - Look for build errors
2. **Function Logs** - Check if API routes are failing
3. **Browser Console** - Check for JavaScript errors
4. **Environment Variables** - Verify all are set correctly

### Common Fixes:
- Re-deploy after adding missing env variables
- Clear build cache: Site settings → Build & deploy → Clear cache
- Check that MinIO server is accessible from Netlify
- Verify Firebase configuration is correct

## 🔄 Redeploying After Changes

When you make code changes:
```bash
git add -A
git commit -m "Your change description"
git push origin main
```

Netlify will automatically rebuild and deploy!

## 📞 Need Help?
Check `NETLIFY_DEPLOYMENT_GUIDE.md` for detailed troubleshooting.
