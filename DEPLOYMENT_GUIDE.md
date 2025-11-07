# Deployment Guide - Complete Production Setup

## 🚀 Deploy to Netlify (Frontend)

### Option 1: Direct Git Deployment (Recommended)

1. **Push to GitHub** (already done):
   ```bash
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select `bimsync-portal` repository
   - Build settings are already configured in `netlify.toml`

3. **Environment Variables in Netlify**:
   - Go to Site settings → Environment variables
   - Add these variables:

   ```bash
   VITE_SUPABASE_URL=your_production_supabase_url
   VITE_SUPABASE_ANON_KEY=your_production_anon_key
   VITE_API_URL=https://your-backend-domain.com
   VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
   ```

4. **Deploy**: 
   - Netlify will automatically build and deploy
   - Your site will be live at `https://yoursite.netlify.app`

### Option 2: Manual Deploy

If you prefer manual deployment:
```bash
# Build the frontend
npm run build

# Deploy the dist/ folder to Netlify manually
```

---

## 🗄️ Deploy Backend (Node.js Server)

### Option 1: Deploy to Railway/Render/Vercel

**For Railway:**
1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Select the `server` folder as root
4. Add environment variables:

```bash
SUPABASE_URL=your_production_supabase_url
SUPABASE_SERVICE_KEY=your_production_service_role_key
DATABASE_URL=your_production_postgres_url
EMAIL_USER=bimaided.website@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_TO=tasneemlabeeb@gmail.com
JWT_SECRET=your_jwt_secret
RECAPTCHA_SECRET_KEY=your_recaptcha_secret
```

**For Render:**
1. Go to [render.com](https://render.com)
2. Create new Web Service from GitHub
3. Set build command: `cd server && npm install`
4. Set start command: `cd server && node index.js`
5. Add same environment variables as above

### Option 2: Deploy to Coolify

**Coolify Setup:**
1. Connect your Git repository to Coolify
2. Create two applications:
   - **Frontend**: Vite build (port 5173)
   - **Backend**: Node.js server (port 3001)

**Frontend Coolify Config:**
```yaml
# Build Command
npm run build

# Start Command  
npm run preview

# Port
5173

# Environment Variables
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=https://your-backend-url
```

**Backend Coolify Config:**
```yaml
# Build Command
cd server && npm install

# Start Command
cd server && node index.js

# Port  
3001

# Environment Variables
DATABASE_URL=postgresql://postgres:password@host:5432/db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
EMAIL_USER=bimaided.website@gmail.com
EMAIL_PASSWORD=your_password
```

---

## 🗃️ Database Setup (Production Supabase)

### Create Production Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Create new project**:
   - Organization: Create new or use existing
   - Project name: `bimsync-portal-prod`
   - Database password: Generate strong password
   - Region: Choose closest to your users

3. **Get credentials**:
   - Project Settings → API
   - Copy `Project URL` and `anon public` key
   - Copy `service_role` key (for backend)

4. **Run database migrations**:
   - Go to SQL Editor in new project
   - Run these files in order:

```sql
-- 1. First run: user roles and basic tables
-- Copy from: database/01_create_user_roles.sql
-- Copy from: database/02_create_employees.sql
-- etc...

-- 2. Run all migration files in order (1-18)
-- See DEPLOYMENT_SQL.sql below for complete script
```

### Migration Order:
1. `database/DEPLOYMENT_SQL.sql` (I'll create this with everything)
2. Create storage buckets manually in dashboard
3. Add storage policies

---

## 📁 Required Files for Deployment

### Frontend Files (✅ Already committed):
- `package.json` - Dependencies and build scripts
- `vite.config.ts` - Build configuration  
- `netlify.toml` - Netlify deployment config
- `src/` - All React source code
- `public/` - Static assets
- `index.html` - Entry point

### Backend Files (✅ Already committed):
- `server/package.json` - Backend dependencies
- `server/index.js` - Express server
- `server/` - All backend code

### Configuration Files (✅ Already committed):
- `.gitignore` - Excludes sensitive files
- Environment templates in guides

---

## 🔧 Environment Variables Summary

### Frontend (.env for Netlify):
```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1Q...
VITE_API_URL=https://your-backend.onrender.com
VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
```

### Backend (for Railway/Render/Coolify):
```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=eyJ0eXAiOiJKV1Q...service_role_key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
EMAIL_USER=bimaided.website@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_TO=tasneemlabeeb@gmail.com
JWT_SECRET=your_random_jwt_secret_32_chars
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

---

## 🚀 Quick Deploy Steps

### 1. Prepare Production Database
```bash
# Create Supabase project at supabase.com
# Run DEPLOYMENT_SQL.sql in SQL Editor
# Create storage buckets: 'cvs' and 'project-images'
```

### 2. Deploy Backend
```bash
# Push code to GitHub (already done)
# Connect to Railway/Render
# Set environment variables
# Deploy
```

### 3. Deploy Frontend  
```bash
# Connect Netlify to GitHub repo
# Set VITE_* environment variables
# Deploy (automatic)
```

### 4. Test Everything
```bash
# Visit your Netlify URL
# Test login, project creation, job applications
# Verify backend APIs work
# Check database connections
```

---

## 📋 Deployment Checklist

**Pre-deployment:**
- [ ] All code committed to GitHub
- [ ] Production Supabase project created
- [ ] Database migrations run
- [ ] Storage buckets created
- [ ] Email credentials configured

**Backend deployment:**
- [ ] Server deployed to Railway/Render/Coolify
- [ ] Environment variables set
- [ ] Health check endpoint working
- [ ] Database connection verified

**Frontend deployment:**
- [ ] Netlify connected to GitHub
- [ ] Build successful
- [ ] Environment variables set
- [ ] Site accessible

**Post-deployment:**
- [ ] Test user registration/login
- [ ] Test admin dashboard
- [ ] Test project creation/editing
- [ ] Test job applications
- [ ] Test email notifications
- [ ] Test image uploads

---

## 🆘 Troubleshooting

**Build Fails:**
- Check Node.js version compatibility
- Verify all dependencies in package.json
- Check environment variables are set

**Backend Connection Issues:**
- Verify DATABASE_URL format
- Check Supabase service key permissions
- Ensure CORS is configured for frontend domain

**Frontend API Errors:**
- Check VITE_API_URL points to deployed backend
- Verify backend is running and accessible
- Check network requests in browser dev tools

**Database Issues:**
- Verify all migrations ran successfully
- Check RLS policies are enabled
- Ensure storage buckets exist