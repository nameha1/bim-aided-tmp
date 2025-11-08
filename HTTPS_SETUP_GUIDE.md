# HTTPS Setup Guide for Supabase

## Problem
Your website (bimaided.com) shows "Not Secure" because it's served over HTTPS but connects to Supabase over HTTP (mixed content).

## Solution
Created an HTTPS reverse proxy for Supabase accessible at `https://supabase.bimaided.com`

## Steps to Complete Setup

### 1. Add DNS Record
You need to add a DNS record in your domain registrar (where you bought bimaided.com):

**Record Type:** A Record  
**Name/Host:** supabase  
**Value/Points to:** 72.60.222.97  
**TTL:** 3600 (or Auto)

This will make `supabase.bimaided.com` point to your server.

### 2. Wait for DNS Propagation
After adding the DNS record, wait 5-15 minutes for it to propagate.

You can check if it's ready by running:
```bash
nslookup supabase.bimaided.com
```

### 3. Test the HTTPS Endpoint
Once DNS is propagated, test:
```bash
curl -I https://supabase.bimaided.com
```

You should see HTTP 200 response.

### 4. Deploy Updated Code
After DNS is working, deploy the updated code with the new HTTPS URL:

```bash
# The .env.local file has been updated to use:
# NEXT_PUBLIC_SUPABASE_URL=https://supabase.bimaided.com

# Build and deploy
docker build --no-cache --platform linux/amd64 -t tasneemlabeeb/bimsync-portal:latest .
docker push tasneemlabeeb/bimsync-portal:latest

# Then deploy to production (use the deployment script)
```

## What Was Created

1. **Nginx Reverse Proxy Container** (`supabase-https-proxy`)
   - Proxies requests from https://supabase.bimaided.com to internal Supabase
   - Has Traefik labels for automatic HTTPS certificate
   - Running on Coolify network

2. **Updated Environment Variable**
   - Changed from: `http://supabasekong-n4g4og0cos0ocwg0ss8cswss.72.60.222.97.sslip.io`
   - Changed to: `https://supabase.bimaided.com`

## How It Works

```
Browser (HTTPS) 
  ↓
bimaided.com (HTTPS via Traefik)
  ↓
Supabase Client connects to https://supabase.bimaided.com (HTTPS via Traefik)
  ↓
Nginx Proxy (container)
  ↓
Supabase Kong (internal HTTP - no security warning because it's server-side)
```

## Current Status

✅ Nginx proxy container created and running  
✅ Traefik labels configured for HTTPS  
✅ .env.local updated with HTTPS URL  
⏳ Waiting for DNS record to be added  
⏳ Deployment with new URL pending  

## After DNS is Set Up

Once the DNS record is added and propagated:
1. Test the endpoint
2. Build fresh Docker image
3. Deploy to production
4. Your site will show as "Secure" with a padlock icon

## Troubleshooting

If you get errors after deployment:
- Make sure DNS is fully propagated
- Check proxy container logs: `docker logs supabase-https-proxy`
- Verify Kong container is running: `docker ps | grep kong`
- Test direct connection: `curl http://supabasekong-n4g4og0cos0ocwg0ss8cswss:8000`
