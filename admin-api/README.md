# BIMSync Admin API

Secure backend API for privileged operations that require SERVICE_ROLE access.

## 🚨 Security Notice

This API uses the Supabase **SERVICE_ROLE** key which has **FULL DATABASE ACCESS**. 

- **NEVER** commit the `.env` file
- **NEVER** expose this API to the public internet without proper authentication
- **ALWAYS** use HTTPS in production
- **ALWAYS** verify admin privileges before executing operations

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd admin-api
npm install
```

### 2. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your SERVICE_ROLE key
nano .env
```

You need to get the **SERVICE_ROLE** key from your Supabase instance:

1. Open Supabase Studio: `http://bimaided-website-pre0225supabase-ec4f00-72-60-222-97.traefik.me:3000`
2. Go to **Settings** → **API**
3. Find `service_role` key in the "Project API keys" section
4. Copy and paste it into `.env`:

```env
SUPABASE_URL=http://bimaided-website-pre0225supabase-ec4f00-72-60-222-97.traefik.me
SUPABASE_SERVICE_ROLE_KEY=eyJh...your_actual_service_role_key_here...
PORT=3001
ALLOWED_ORIGINS=http://localhost:8094,http://localhost:5173
```

### 3. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3001`

---

## API Endpoints

### Health Check

```http
GET /health
```

Response:
```json
{
  "status": "ok",
  "message": "BIMSync Admin API is running"
}
```

### Create Employee (Admin Only)

```http
POST /api/admin/create-employee
Authorization: Bearer <user_session_token>
Content-Type: application/json
```

Request body:
```json
{
  "email": "john.doe@bimaided.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "eid": "EMP001",
  "gender": "Male",
  "dateOfBirth": "1990-01-15",
  "nationalId": "123456789",
  "phoneNumber": "+971-50-123-4567",
  "address": "Dubai, UAE",
  "joiningDate": "2024-01-01",
  "departmentId": "uuid-here",
  "designationId": "uuid-here",
  "supervisorId": "uuid-here"
}
```

Response:
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "userId": "uuid",
    "employeeId": "uuid",
    "email": "john.doe@bimaided.com"
  }
}
```

### Delete Employee (Admin Only)

```http
DELETE /api/admin/delete-employee/:userId
Authorization: Bearer <user_session_token>
```

### Update Employee Password (Admin Only)

```http
POST /api/admin/update-employee-password
Authorization: Bearer <user_session_token>
Content-Type: application/json
```

Request body:
```json
{
  "userId": "uuid-here",
  "newPassword": "NewSecurePassword123"
}
```

---

## Authentication

All `/api/admin/*` endpoints require:

1. **Authorization header** with Bearer token from logged-in admin user
2. **Admin role** verified in the database

The frontend automatically sends the session token when making requests:

```typescript
const { data: { session } } = await supabase.auth.getSession();

fetch('http://localhost:3001/api/admin/create-employee', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`
  },
  // ...
});
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here",
  "details": "Additional details (dev mode only)"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (not an admin)
- `500` - Internal Server Error

---

## Production Deployment

### Option 1: Deploy to Same Server as Main App

1. Copy `admin-api/` directory to your server
2. Install dependencies: `npm install --production`
3. Set environment variables (use your hosting platform's env var settings)
4. Use a process manager like PM2:
   ```bash
   pm2 start index.js --name bimsync-admin-api
   ```
5. Configure reverse proxy (Nginx/Apache) to route `/api/admin/*` to port 3001

### Option 2: Deploy as Separate Service

1. Deploy to a cloud function service (Vercel, Netlify, AWS Lambda)
2. Update `ALLOWED_ORIGINS` to include your production frontend URL
3. Use HTTPS everywhere
4. Consider adding rate limiting and additional security measures

---

## Security Checklist

- [ ] SERVICE_ROLE key is set and not the default example value
- [ ] `.env` is in `.gitignore` and not committed
- [ ] CORS is configured with specific allowed origins (not `*`)
- [ ] All endpoints verify admin role before executing
- [ ] HTTPS is used in production
- [ ] Rate limiting is implemented (consider adding express-rate-limit)
- [ ] Logging is configured for audit trail
- [ ] Error messages don't expose sensitive information

---

## Troubleshooting

### "SUPABASE_SERVICE_ROLE_KEY is not set!"

- Check that `.env` file exists in `admin-api/` directory
- Verify the file contains the correct key from Supabase Studio

### "User not allowed" error

- You're still using ANON key instead of SERVICE_ROLE key
- Check that SERVICE_ROLE key is correct

### CORS errors

- Add your frontend URL to `ALLOWED_ORIGINS` in `.env`
- Restart the server after changing `.env`

### "User does not have admin privileges"

- Verify the logged-in user has `admin` role in `user_roles` table:
  ```sql
  SELECT * FROM user_roles WHERE user_id = 'your-user-id';
  ```

---

## Development vs Production

**Development:**
- Uses HTTP (localhost)
- Detailed error messages
- Auto-reload with `--watch` flag

**Production:**
- Must use HTTPS
- Generic error messages
- Process manager (PM2, systemd)
- Proper logging and monitoring
- Rate limiting and security headers
