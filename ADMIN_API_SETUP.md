# 🚀 Quick Start Guide: Admin API Setup

## Step 1: Get SERVICE_ROLE Key from Supabase

1. Open Supabase Studio in your browser:
   ```
   http://bimaided-website-pre0225supabase-ec4f00-72-60-222-97.traefik.me:3000
   ```

2. Navigate to: **Settings** → **API**

3. Scroll down to **Project API keys** section

4. Find the key labeled `service_role` (it's a long JWT token starting with `eyJh...`)

5. **Copy the entire SERVICE_ROLE key**

## Step 2: Configure Admin API

```bash
# Navigate to admin-api directory
cd admin-api

# Create .env file from example
cp .env.example .env

# Edit the .env file
nano .env
# Or use VS Code:
code .env
```

**Replace the placeholder with your actual SERVICE_ROLE key:**

```env
# Admin API Environment Variables
SUPABASE_URL=http://bimaided-website-pre0225supabase-ec4f00-72-60-222-97.traefik.me
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...PASTE_YOUR_ACTUAL_KEY_HERE

PORT=3001
ALLOWED_ORIGINS=http://localhost:8094,http://localhost:5173

# Optional: Add a secret for extra security
ADMIN_API_SECRET=change_this_to_a_random_secret_key
```

**⚠️ CRITICAL: Never commit this .env file to git!**

## Step 3: Start the Admin API Server

```bash
# Make sure you're in the admin-api directory
cd /Users/tasneemzaman/Desktop/Untitled/admin-api

# Start the server (development mode with auto-reload)
npm run dev

# You should see:
# ✅ BIMSync Admin API running on http://localhost:3001
# 📍 Health check: http://localhost:3001/health
# 🔒 Admin endpoints require authentication
```

Keep this terminal open and running!

## Step 4: Start Your Frontend (In a NEW Terminal)

```bash
# Open a NEW terminal window/tab
cd /Users/tasneemzaman/Desktop/Untitled

# Start the frontend dev server
npm run dev

# You should see:
# ➜  Local:   http://localhost:8094/
```

## Step 5: Test Employee Creation

1. Open your browser: `http://localhost:8094`
2. Login with your admin account
3. Go to **Admin Dashboard** → **Employees** tab → **Add Employee**
4. Fill in the form and click "Add Employee"

**Expected behavior:**
- The frontend sends a request to `http://localhost:3001/api/admin/create-employee`
- The admin API verifies your admin role
- The admin API uses SERVICE_ROLE key to create the user (auto-confirmed!)
- The admin API creates employee record and assigns role
- You see success message!

## Step 6: Verify It Worked

Check the browser console (F12) - you should see:
```
API Response: {success: true, message: "Employee created successfully", ...}
```

Check the admin API terminal - you should see:
```
Creating employee: {email: "...", firstName: "...", lastName: "..."}
Auth user created: uuid-here
Employee record created: uuid-here
```

---

## 🐛 Troubleshooting

### Error: "SUPABASE_SERVICE_ROLE_KEY is still the default value!"

- You didn't replace the placeholder in `.env`
- Get the actual SERVICE_ROLE key from Supabase Studio
- Make sure to save the `.env` file after editing

### Error: "ERR_CONNECTION_REFUSED"

- Admin API is not running
- Make sure you ran `npm run dev` in the `admin-api/` directory
- Check that it's running on port 3001

### Error: "CORS policy" in browser

- Frontend is running on a different port than expected
- Add your frontend URL to `ALLOWED_ORIGINS` in `admin-api/.env`
- Example: `ALLOWED_ORIGINS=http://localhost:8094,http://localhost:5173,http://localhost:3000`

### Error: "User does not have admin privileges"

- Your logged-in user doesn't have admin role
- Run this SQL in Supabase Studio:
  ```sql
  SELECT * FROM user_roles WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'your-email@here.com'
  );
  ```
- If no admin role exists, run:
  ```sql
  INSERT INTO user_roles (user_id, role) VALUES (
    (SELECT id FROM auth.users WHERE email = 'your-email@here.com'),
    'admin'
  );
  ```

### Error: "Missing or invalid authorization header"

- You're not logged in
- Session expired - logout and login again

---

## ✅ Success Checklist

- [ ] SERVICE_ROLE key copied from Supabase Studio
- [ ] `admin-api/.env` file created with actual SERVICE_ROLE key
- [ ] Admin API running on `http://localhost:3001`
- [ ] Health check returns: `{"status":"ok"}`
- [ ] Frontend running on `http://localhost:8094`
- [ ] Logged in with admin account
- [ ] Successfully created an employee through the UI
- [ ] New employee appears in employee list

---

## 🎯 What's Next?

### For Development:
- Keep admin API running whenever you're developing
- Admin API will auto-reload when you edit `admin-api/index.js`

### For Production Deployment:
- Deploy admin API to your server (same or separate)
- Use environment variables in your hosting platform
- Set up HTTPS
- Configure proper CORS origins
- Consider adding rate limiting

### Production Security:
- Generate a strong ADMIN_API_SECRET
- Use HTTPS everywhere
- Regularly rotate SERVICE_ROLE key
- Monitor API logs for suspicious activity
- Add rate limiting (e.g., express-rate-limit)

---

## 📚 Documentation

- **Admin API README**: `admin-api/README.md`
- **Database Setup**: `DATABASE_MIGRATION_GUIDE.md`
- **Supabase Setup**: `SUPABASE_SELFHOSTED_SETUP.md`

---

## 🔐 Security Reminder

**The SERVICE_ROLE key in `admin-api/.env` has FULL DATABASE ACCESS!**

- ❌ Never commit `.env` to git
- ❌ Never share SERVICE_ROLE key
- ❌ Never expose it in browser/frontend code
- ✅ Only use it server-side
- ✅ Keep admin API behind authentication
- ✅ Use HTTPS in production

