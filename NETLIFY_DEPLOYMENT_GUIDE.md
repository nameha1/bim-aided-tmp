# Netlify Deployment Guide for BIM-AIDED

## Prerequisites
1. Push your code to GitHub repository
2. Have a Netlify account (sign up at https://netlify.com)

## Deployment Steps

### 1. Connect Repository to Netlify
1. Log in to Netlify
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy with GitHub"
4. Authorize Netlify to access your repository
5. Select your `bim-aided-tmp` repository

### 2. Configure Build Settings
Netlify should auto-detect Next.js. Verify these settings:
- **Base directory:** (leave empty)
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Functions directory:** `.netlify/functions`

The `netlify.toml` file in the repository will handle these automatically.

### 3. Add Environment Variables
Go to Site configuration → Environment variables and add:

#### Firebase Configuration (Required)
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### Firebase Admin SDK (Required)
```
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
```
Note: This should be the entire JSON content on one line

#### MinIO Storage (Required)
```
MINIO_ENDPOINT=your_minio_server_ip
MINIO_PORT=9000
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key
MINIO_USE_SSL=false
```

#### Email Configuration (Required for contact form)
```
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_TO=recipient@gmail.com
```

#### reCAPTCHA (Optional but recommended)
```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

### 4. Deploy
1. Click "Deploy site"
2. Wait for build to complete (3-5 minutes)
3. Your site will be live at `https://random-name.netlify.app`

### 5. Custom Domain (Optional)
1. Go to Domain settings
2. Click "Add custom domain"
3. Follow instructions to configure DNS

## Troubleshooting

### White Screen Issues
If you see a blank white screen:

1. **Check Build Logs**
   - Look for errors in the deploy logs
   - Common issues: Missing environment variables, TypeScript errors

2. **Check Browser Console**
   - Open DevTools (F12) and check Console for errors
   - Look for 404s or failed API calls

3. **Verify Environment Variables**
   - All `NEXT_PUBLIC_*` variables must be set before build
   - Restart build after adding new env vars

4. **Check Functions**
   - Netlify Functions timeout after 10 seconds (free tier)
   - Check Function logs in Netlify dashboard

### Build Failures

1. **Dependency Issues**
   - The `.npmrc` file handles legacy peer deps
   - Clear build cache: Deploy settings → Clear cache and retry

2. **TypeScript Errors**
   - Run `npm run build` locally first to catch errors
   - Fix all TypeScript errors before deploying

3. **Memory Issues**
   - If build runs out of memory, upgrade Netlify plan
   - Or simplify dependencies

## Local Testing Before Deploy

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Build locally
npm run build

# Test production build
npm run start
```

If it works locally, it should work on Netlify with proper env variables.

## Important Notes

1. **Environment Variables:** Set all env vars in Netlify dashboard BEFORE deploying
2. **NODE_TLS_REJECT_UNAUTHORIZED:** Only disabled in development, production uses proper SSL
3. **Image Optimization:** Disabled (`unoptimized: true`) because Netlify doesn't support Next.js Image Optimization on free tier
4. **API Routes:** Automatically converted to Netlify Functions by `@netlify/plugin-nextjs`

## Support Resources
- [Netlify Next.js Documentation](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
