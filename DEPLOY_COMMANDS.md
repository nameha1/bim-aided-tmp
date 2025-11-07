# Production deployment checklist and commands

## Quick Deploy Commands

### 1. Build and test locally
```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Build frontend
npm run build

# Test backend
cd server && npm start
```

### 2. Deploy to Netlify (Frontend)
```bash
# Option 1: Connect GitHub repo to Netlify dashboard
# Option 2: Manual deploy
npm run build
# Upload dist/ folder to Netlify

# Environment variables to set in Netlify:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your_anon_key
# VITE_API_URL=https://your-backend-url
# VITE_RECAPTCHA_SITE_KEY=your_site_key
```

### 3. Deploy Backend to Render/Railway
```bash
# Connect GitHub repo
# Set environment variables from .env.production.template
# Deploy automatically
```

### 4. Database Setup
```bash
# 1. Create Supabase project
# 2. Run database/DEPLOYMENT_SQL.sql in SQL Editor  
# 3. Create storage buckets:
#    - cvs (private)
#    - project-images (public)
```

## Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.production.yml up --build

# Or build individual containers
docker build -t bimsync-frontend .
docker build -t bimsync-backend ./server
```

## Environment Variables Checklist

### Frontend (Netlify/Vercel)
- [ ] VITE_SUPABASE_URL
- [ ] VITE_SUPABASE_ANON_KEY  
- [ ] VITE_API_URL
- [ ] VITE_RECAPTCHA_SITE_KEY

### Backend (Render/Railway/Coolify)
- [ ] SUPABASE_URL
- [ ] SUPABASE_SERVICE_KEY
- [ ] DATABASE_URL
- [ ] EMAIL_USER
- [ ] EMAIL_PASSWORD
- [ ] EMAIL_TO
- [ ] JWT_SECRET
- [ ] RECAPTCHA_SECRET_KEY

### Database (Supabase)
- [ ] Tables created (run DEPLOYMENT_SQL.sql)
- [ ] Storage buckets created
- [ ] Storage policies added
- [ ] First admin user created

## Verification Steps
1. [ ] Frontend loads without errors
2. [ ] Backend health check responds
3. [ ] Database connection works  
4. [ ] User can register/login
5. [ ] Admin dashboard accessible
6. [ ] Project creation works
7. [ ] Image upload works
8. [ ] Job applications work
9. [ ] Email notifications work