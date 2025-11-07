# Admin API Production Deployment Guide

## For www.bimaided.com

Your main website is deployed at `www.bimaided.com`. To enable employee creation in production, you need to deploy the Admin API server.

---

## Deployment Options

### Option 1: Deploy Admin API to Dokploy (Recommended)

Since you're already using Dokploy for Supabase, deploy the admin API there too.

#### Steps:

1. **Create New Application in Dokploy**
   - Name: `bimsync-admin-api`
   - Type: Node.js application
   - Repository: `https://github.com/tasneemlabeeb/bimsync-portal.git`
   - Branch: `main`
   - Build directory: `admin-api`

2. **Configure Environment Variables in Dokploy**
   ```
   SUPABASE_URL=http://bimaided-website-pre0225supabase-ec4f00-72-60-222-97.traefik.me
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q
   PORT=3001
   ALLOWED_ORIGINS=https://www.bimaided.com,http://www.bimaided.com,http://localhost:8094
   NODE_ENV=production
   ```

3. **Set Build Command**
   ```bash
   cd admin-api && npm install
   ```

4. **Set Start Command**
   ```bash
   cd admin-api && npm start
   ```

5. **Configure Domain/Subdomain**
   - Set up: `api.bimaided.com` pointing to your admin API
   - Or use Dokploy's auto-generated URL

6. **Deploy**

---

### Option 2: Deploy to Same Server as Main Website

If your www.bimaided.com is on a VPS/server:

1. **SSH into your server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Clone/Pull your repository**
   ```bash
   cd /var/www
   git clone https://github.com/tasneemlabeeb/bimsync-portal.git
   # or
   git pull origin main
   ```

3. **Install dependencies**
   ```bash
   cd bimsync-portal/admin-api
   npm install --production
   ```

4. **Create .env file**
   ```bash
   nano .env
   ```
   
   Paste:
   ```env
   SUPABASE_URL=http://bimaided-website-pre0225supabase-ec4f00-72-60-222-97.traefik.me
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q
   PORT=3001
   ALLOWED_ORIGINS=https://www.bimaided.com,http://www.bimaided.com
   NODE_ENV=production
   ```

5. **Install PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   ```

6. **Start with PM2**
   ```bash
   pm2 start index.js --name bimsync-admin-api
   pm2 save
   pm2 startup  # Follow the instructions
   ```

7. **Configure Nginx/Apache Reverse Proxy**
   
   **For Nginx** (`/etc/nginx/sites-available/bimaided.com`):
   ```nginx
   # API subdomain
   server {
       listen 80;
       listen 443 ssl;
       server_name api.bimaided.com;

       ssl_certificate /path/to/ssl/cert.pem;
       ssl_certificate_key /path/to/ssl/key.pem;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Or add to main domain:
   ```nginx
   # Inside existing www.bimaided.com server block
   location /api/admin {
       proxy_pass http://localhost:3001;
       # ... same proxy settings as above
   }
   ```

8. **Restart Nginx**
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. **Configure SSL** (if using subdomain)
   ```bash
   sudo certbot --nginx -d api.bimaided.com
   ```

---

### Option 3: Deploy to Vercel/Netlify Functions

Convert the Express app to serverless functions (more complex, not recommended for this use case).

---

## Update Frontend Production Build

### In Dokploy Environment Variables:

Add this to your main website deployment:

```
VITE_ADMIN_API_URL=https://api.bimaided.com
```

Or if using path-based routing:
```
VITE_ADMIN_API_URL=https://www.bimaided.com/api/admin
```

Then redeploy your main website.

---

## Verify Deployment

### 1. Test Health Check

```bash
curl https://api.bimaided.com/health
# Should return: {"status":"ok","message":"BIMSync Admin API is running"}
```

### 2. Test from Frontend

- Go to https://www.bimaided.com
- Login as admin
- Try to create an employee
- Check browser console for successful API call

### 3. Check Logs

**Dokploy**: Check application logs in dashboard

**PM2**:
```bash
pm2 logs bimsync-admin-api
```

**Nginx**:
```bash
sudo tail -f /var/log/nginx/error.log
```

---

## Security Checklist

- [ ] Admin API is behind HTTPS
- [ ] CORS is configured with specific origins (not `*`)
- [ ] SERVICE_ROLE key is in environment variables (not hardcoded)
- [ ] `.env` file is not committed to git
- [ ] Firewall allows only necessary ports
- [ ] SSL certificate is valid
- [ ] Consider adding rate limiting:
  ```bash
  npm install express-rate-limit
  ```

---

## Monitoring & Maintenance

### PM2 Commands:
```bash
pm2 status                  # Check if running
pm2 restart bimsync-admin-api   # Restart after updates
pm2 logs bimsync-admin-api      # View logs
pm2 monit                   # Monitor CPU/Memory
```

### Update Deployment:
```bash
cd /var/www/bimsync-portal
git pull origin main
cd admin-api
npm install --production
pm2 restart bimsync-admin-api
```

---

## Troubleshooting

### Can't connect to Admin API

1. Check if service is running:
   ```bash
   pm2 status
   # or
   curl http://localhost:3001/health
   ```

2. Check firewall:
   ```bash
   sudo ufw status
   sudo ufw allow 3001  # If needed
   ```

3. Check Nginx logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

### CORS Errors

- Update `ALLOWED_ORIGINS` in `.env`
- Restart the service
- Clear browser cache

### SERVICE_ROLE Key Not Working

- Verify the key matches Supabase Studio
- Check for extra spaces or line breaks
- Regenerate key in Supabase if needed

---

## Quick Reference

**Local Development:**
```
Frontend: http://localhost:8094
Admin API: http://localhost:3001
```

**Production:**
```
Frontend: https://www.bimaided.com
Admin API: https://api.bimaided.com (or /api/admin path)
Supabase: http://bimaided-website-pre0225supabase-ec4f00-72-60-222-97.traefik.me
```

---

## Next Steps

1. Choose deployment method (Dokploy recommended)
2. Deploy Admin API
3. Configure domain/subdomain
4. Update frontend environment variables
5. Redeploy frontend
6. Test employee creation in production
