# 🚀 BIM Portal - Netlify Full Stack Deployment

## 📋 Simple Architecture

```
Frontend + Backend (Netlify) → Supabase (Coolify)
           ↓                           ↓
React SPA + Netlify Functions    PostgreSQL DB
```

**Benefits of this setup:**
- ✅ **Netlify**: Frontend + Backend serverless functions, CDN, auto-deployments
- ✅ **Coolify**: Only for Supabase database (simplest setup)
- ✅ **No separate backend**: Everything in one Netlify deployment

---

## 🚀 Deploy to Netlify

### Step 1: Connect GitHub to Netlify

1. **Go to Netlify.com** → Login/Signup
2. **Import from Git** → Choose GitHub → Select `tasneemlabeeb/bimsync-portal`
3. **Branch**: `main`

### Step 2: Configure Build Settings

```bash
Build command: npm run build
Publish directory: dist
Functions directory: netlify/functions
Node version: 18
```

### Step 3: Environment Variables

In Netlify → **Site settings** → **Environment variables**, add:

```bash
# Frontend Variables
VITE_SUPABASE_URL=http://supabasekong-i480ws8cosk4kwkskssck8o8.72.60.222.97.sslip.io
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
VITE_API_URL=https://your-app.netlify.app/.netlify/functions
VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI

# Backend Functions Variables
SUPABASE_SERVICE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
JWT_SECRET=rt4h4cKZkKWezb8AwtUxN3buEKwEVqzO
EMAIL_USER=bimaided.website@gmail.com
EMAIL_PASSWORD=rwgy biho ilda memw
EMAIL_TO=tasneemlabeeb@gmail.com
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here

# Build Settings
NODE_ENV=production
```

### Step 4: Deploy

1. **Deploy** in Netlify (automatic after setup)
2. **Test Deployment**:
   - Frontend: `https://your-app.netlify.app`
   - API Health: `https://your-app.netlify.app/.netlify/functions/api/health`
   - Contact Form: Test the contact page

---

## 📱 What's Included

**Netlify Functions Created:**
- `/.netlify/functions/api` - Main API endpoints (employee creation, etc.)
- `/.netlify/functions/contact` - Contact form email sending

**Frontend Features:**
- ✅ Project portfolio with image galleries
- ✅ Contact forms with serverless email
- ✅ Career page with job applications
- ✅ Admin dashboard for management
- ✅ Employee portal with attendance

**Database (Coolify Supabase):**
- ✅ All existing data preserved
- ✅ Internal Coolify network performance
- ✅ No migration needed

**⚠️ IMPORTANT:** Use your PRODUCTION credentials, not the local development ones!

### Step 3: Update Supabase URL Configuration

In Supabase Dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Add your Netlify URLs:
   - **Site URL**: `https://your-site-name.netlify.app`
   - **Redirect URLs**: `https://your-site-name.netlify.app/**`

### Step 4: Trigger Deployment

1. Go to **Deploys** in Netlify
2. Click **Trigger deploy** → **Clear cache and deploy site**
3. Wait for the build to complete
4. Your site should now be live! 🎉

## 📝 Local Development Setup

Your local `.env.production` file still exists on your machine (just not in Git). For local development, you can keep using:

```bash
VITE_SUPABASE_URL=http://supabasekong-i480ws8cosk4kwkskssck8o8.72.60.222.97.sslip.io
VITE_SUPABASE_ANON_KEY=your-local-key
```

This file won't be committed to Git, so your local credentials stay secure.

## 🔍 Troubleshooting

### Build still failing with secrets detected?
- Make sure you triggered a **Clear cache and deploy**
- Check that `netlify.toml` is in your repo

### Site loads but shows "Failed to fetch"?
- Verify environment variables are set in Netlify
- Check that URLs don't have trailing slashes
- Ensure Netlify domain is added to Supabase allowed URLs

### Authentication not working?
- Make sure redirect URLs in Supabase include your Netlify domain
- Check that environment variables are correctly set

## 📚 Additional Resources

- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Supabase Documentation](https://supabase.com/docs)
- [Netlify Redirects](https://docs.netlify.com/routing/redirects/)

---

**Need help?** Check the Netlify build logs for specific error messages.
