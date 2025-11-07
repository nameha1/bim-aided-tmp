# BIM Portal - Coolify Full Stack Deployment Guide

## 🚀 Deploy Frontend + Backend to Coolify

This guide shows you how to deploy both your React frontend and Node.js backend as a single service in Coolify.

### 📋 Prerequisites

- ✅ Coolify installed on Hostinger VPS
- ✅ Supabase running in Coolify (your current setup)
- ✅ GitHub repo: `tasneemlabeeb/bimsync-portal`
- ✅ Domain name for the application

### 🔧 Deployment Steps

#### Step 1: Create New Service in Coolify

1. **Login to Coolify Dashboard**
   - Go to your Coolify URL on Hostinger VPS
   - Login with your admin credentials

2. **Create New Application**
   - Click **"+ New"** → **"Application"**
   - Choose **"Public Repository"**
   - Repository URL: `https://github.com/tasneemlabeeb/bimsync-portal.git`
   - Branch: `main`

3. **Configure Build Settings**
   - Build Pack: **Docker** 
   - Dockerfile Location: `Dockerfile`
   - Port: `3000` (Nixpacks uses 3000 by default)
   - Health Check URL: `/api/health`
   - **Important**: Make sure "Use Dockerfile" is enabled

#### Step 2: Environment Variables

Copy all variables from `.env.coolify` file to Coolify environment variables:

**Required Variables:**
```bash
NODE_ENV=production
PORT=3001
VITE_SUPABASE_URL=http://supabasekong-i480ws8cosk4kwkskssck8o8.72.60.222.97.sslip.io
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
SUPABASE_SERVICE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
DATABASE_URL=postgresql://postgres:417wIu14OxPmnQNpUCeieTSZ7IN6pYSa@supabase-db:5432/postgres
JWT_SECRET=rt4h4cKZkKWezb8AwtUxN3buEKwEVqzO
EMAIL_USER=bimaided.website@gmail.com
EMAIL_PASSWORD=rwgy biho ilda memw
EMAIL_TO=tasneemlabeeb@gmail.com
VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
```

**Important:** Update `VITE_API_URL` with your actual Coolify app URL after deployment.

#### Step 3: Domain Configuration

1. **Set Custom Domain**
   - In Coolify, go to your app → **"Domains"**
   - Add your domain: `bimsync.yourdomain.com`
   - Enable SSL certificate (Let's Encrypt)

2. **Update API URL**
   - After domain is set, update environment variable:
   - `VITE_API_URL=https://bimsync.yourdomain.com`

#### Step 4: Deploy

1. **Start Deployment**
   - Click **"Deploy"** in Coolify
   - Monitor build logs for any errors
   - Wait for deployment to complete

2. **Verify Deployment**
   - Frontend: `https://bimsync.yourdomain.com`
   - Backend API: `https://bimsync.yourdomain.com/api/health`
   - Admin Dashboard: `https://bimsync.yourdomain.com/admin`

### 🗄️ Database Setup

Since you're keeping your existing Supabase, just run the missing migrations:

1. **Access Supabase Dashboard**
   ```
   http://supabasekong-i480ws8cosk4kwkskssck8o8.72.60.222.97.sslip.io
   ```

2. **Run Migration Files** (in order):
   ```sql
   -- 1. Job Applications Table
   database/16_create_job_applications_table.sql
   
   -- 2. Projects Table Updates  
   database/17_verify_projects_table.sql
   
   -- 3. Assignments System
   database/15_create_assignments_tables.sql
   ```

3. **Create Storage Buckets**:
   - **Storage** → **Create bucket** → `project-images` (Public ✅)
   - **Storage** → **Create bucket** → `cvs` (Private ❌)
   - Add policies from `database/18_create_storage_buckets.sql`

### 🔧 How It Works

**Architecture:**
```
Internet → Coolify Proxy → Your App Container
                           ├── Frontend (React) - Port 3001/static
                           └── Backend (Node.js) - Port 3001/api
                                    ↓
                           Supabase Container (Same Coolify)
```

**Request Flow:**
- `yourdomain.com/` → Serves React frontend
- `yourdomain.com/api/*` → Routes to Node.js backend  
- `yourdomain.com/admin` → Admin dashboard
- Backend connects to Supabase via internal network

### 📱 Features Available After Deployment

**Public Features:**
- ✅ Landing page with featured projects
- ✅ Project portfolio with image galleries
- ✅ Services pages (BIM Modeling, Advanced BIM)
- ✅ Career page with job applications
- ✅ Contact forms

**Admin Dashboard:**
- ✅ Employee management
- ✅ Project management with image uploads
- ✅ Assignment tracking
- ✅ Leave request approvals
- ✅ Job application review

**Employee Portal:**
- ✅ Attendance check-in/out
- ✅ Leave request submission  
- ✅ Assignment tracking
- ✅ Profile management

### 🚨 Troubleshooting

**Build Fails:**
- Check Dockerfile.coolify syntax
- Verify all dependencies in package.json
- Check build logs in Coolify

**App Won't Start:**
- Verify PORT environment variable (3001)
- Check health check endpoint: `/health`
- Review application logs

**Database Connection Issues:**
- Verify DATABASE_URL points to supabase-db
- Check Supabase is running in same Coolify instance
- Verify credentials match

**Frontend/Backend Communication:**
- Update VITE_API_URL with your actual domain
- Ensure CORS is configured for your domain
- Check network connectivity between services

### ✅ Post-Deployment Checklist

- [ ] App accessible at your domain
- [ ] Frontend loads correctly
- [ ] Admin login works
- [ ] Database tables created
- [ ] File uploads work (project images, CVs)
- [ ] Email functionality working
- [ ] SSL certificate active

### 🔄 Updates & Maintenance

**To Update the Application:**
1. Push changes to GitHub main branch
2. In Coolify → **"Redeploy"**
3. Monitor deployment logs
4. Verify functionality

**Database Migrations:**
- Run new SQL files in Supabase SQL Editor
- No app restart needed for DB changes

**Environment Variables:**
- Update in Coolify → **"Environment Variables"**
- Restart application after changes

Need help with any specific step? Let me know!