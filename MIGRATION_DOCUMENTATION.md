# BIM-AIDED Firebase Migration - Complete Documentation

**Last Updated:** November 10, 2025  
**Migration Status:** ✅ Supabase Removal Complete | 🟡 Components Partially Migrated

---

## 📋 Table of Contents

1. [Migration Overview](#migration-overview)
2. [Current Status](#current-status)
3. [Quick Start Guide](#quick-start-guide)
4. [Firebase Setup](#firebase-setup)
5. [MinIO Storage Setup](#minio-storage-setup)
6. [Component Migration Guide](#component-migration-guide)
7. [API Reference](#api-reference)
8. [Conversion Examples](#conversion-examples)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Migration Overview

This application has been migrated from:
- **Supabase** (PostgreSQL database + auth) → **Firebase** (Firestore + Authentication)
- **Supabase Storage** → **MinIO** (Self-hosted S3-compatible storage)

### What Was Changed

- ✅ All Supabase imports removed
- ✅ Firebase SDK integrated (client + admin)
- ✅ MinIO SDK integrated for file storage
- ✅ Authentication layer fully migrated
- ✅ Core API routes migrated (login, session, user roles)
- ✅ Build successfully compiles with no errors
- 🟡 22 components using temporary stub (ready for migration)

### Technology Stack

```json
{
  "firebase": "^12.5.0",
  "firebase-admin": "^13.6.0",
  "minio": "^8.0.6",
  "next": "^14.2.4"
}
```

---

## 📊 Current Status

### ✅ Fully Migrated (Working)

**Authentication:**
- `/app/api/auth/login/route.ts` - Firebase email/password login
- `/app/api/auth/logout/route.ts` - Firebase sign out
- `/app/api/auth/session/route.ts` - Session management (GET/POST/DELETE)
- `/components/ProtectedRoute.tsx` - Route guard with Firebase auth

**Database Operations:**
- `/app/api/user-roles/[userId]/route.ts` - Firestore user roles
- `/app/api/employees/by-eid/[eid]/route.ts` - Employee lookup by EID
- `/app/api/create-project/route.ts` - Create project in Firestore
- `/app/api/create-many-projects/route.ts` - Batch create projects

**Pages:**
- `/app/page.tsx` - Home page (projects + contact form)
- `/app/contact/page.tsx` - Contact form submissions
- `/app/login/page.tsx` - Login page

### 🟡 Stubbed (Shows "Migrating" Message)

**Admin Components (15):**
- AddEmployeeForm, ApplicationManager, AssignmentManager
- AttendanceRecords, CareerManager, ContactInquiriesManager
- EditEmployeeDialog, EmployeeList, InvoiceManager
- IPWhitelistManager, LeaveRequests, ManualAttendanceEntry
- PayrollManager, ProjectManager, SupervisorLeaveRequests
- TransactionManager

**Employee Components (5):**
- AttendanceCheckIn, AttendanceHistory, LeaveRequestForm
- MyAssignments, SupervisorAssignmentTeams

**Other (2):**
- JobApplicationDialog, career page

**API Routes (8):**
- create-employee, reset-employee-password, update-employee
- update-project, update-project-status, upload-image
- payroll/approve, payroll/generate

### 🗂️ Project Structure

```
/lib/firebase/
  ├── index.ts          # Main exports
  ├── config.ts         # Firebase configuration
  ├── auth.ts           # Authentication helpers
  ├── admin.ts          # Firebase Admin SDK
  └── db.ts             # Firestore database helpers

/lib/storage/
  ├── index.ts          # Storage exports
  ├── minio-client.ts   # MinIO client setup
  └── minio-helpers.ts  # Upload/download helpers

/lib/supabase-stub.ts   # Temporary stub for 22 components
```

---

## 🚀 Quick Start Guide

### 1. Firebase Console Setup (15 minutes)

1. **Go to Firebase Console:** https://console.firebase.google.com
2. **Select Project:** `bimaided-b4447`

#### Enable Authentication
```
1. Click "Authentication" in left sidebar
2. Click "Get Started"
3. Click "Email/Password" provider
4. Toggle "Enable" switch
5. Click "Save"
```

#### Enable Firestore Database
```
1. Click "Firestore Database" in left sidebar
2. Click "Create database"
3. Choose "Start in production mode"
4. Select location: us-central (or nearest)
5. Click "Enable"
```

#### Set Up Security Rules
```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User roles readable by authenticated users
    match /user_roles/{userId} {
      allow read: if request.auth != null;
      allow write: if false; // Only via admin SDK
    }
    
    // Public read for projects
    match /projects/{projectId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Contact inquiries - anyone can create
    match /contact_inquiries/{inquiryId} {
      allow read: if request.auth != null;
      allow create: if true;
    }
    
    // Default: deny all
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 2. Create Test Admin User

#### Option A: Firebase Console
```
1. Go to Authentication > Users
2. Click "Add user"
3. Email: admin@bimaided.com
4. Password: (set a secure password)
5. Click "Add user"
6. Copy the User UID
```

#### Option B: Firebase CLI
```bash
npm install -g firebase-tools
firebase login
firebase auth:import users.json --project bimaided-b4447
```

### 3. Set Admin Role in Firestore

```
1. Go to Firestore Database
2. Click "Start collection"
3. Collection ID: user_roles
4. Document ID: (paste User UID from step 2)
5. Add field:
   - Field: role
   - Type: string
   - Value: admin
6. Click "Save"
```

### 4. Test Login

```bash
# Start dev server
npm run dev

# Visit http://localhost:3003
# Login with: admin@bimaided.com
```

### 5. Set Up Firestore Database

Run the automated setup script:

```bash
npm run setup-firestore
```

This will:
- ✅ Create 14 Firestore collections
- ✅ Add sample data (departments, projects, job postings, etc.)
- ✅ Create admin user: admin@bimaided.com
- ✅ Set admin role in user_roles collection
- ✅ Create user document

**Admin Login:**
- Email: admin@bimaided.com
- Password: Admin@123456 (Change this immediately!)

See `FIRESTORE_DATABASE_STRUCTURE.md` for complete database schema.

### 6. Environment Variables

Your `.env.local` should have:

```bash
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBJO...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bimaided-b4447.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bimaided-b4447
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bimaided-b4447.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=596474269421
NEXT_PUBLIC_FIREBASE_APP_ID=1:596474269421:web:...

# Firebase Admin SDK (Service Account Key)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'

# MinIO Configuration
MINIO_ENDPOINT=your-minio-endpoint
MINIO_PORT=9000
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_USE_SSL=false

# Email Configuration
SMTP_ADMIN_EMAIL=your-email@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 🔥 Firebase Setup

### Authentication Methods

#### Sign In
```typescript
import { signIn } from '@/lib/firebase';

const handleLogin = async () => {
  try {
    const user = await signIn(email, password);
    console.log('Logged in:', user.uid);
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};
```

#### Sign Out
```typescript
import { signOut } from '@/lib/firebase';

await signOut();
```

#### Get Current User
```typescript
import { getCurrentUser } from '@/lib/firebase';

const user = await getCurrentUser();
if (user) {
  console.log('User ID:', user.uid);
  console.log('Email:', user.email);
}
```

#### Auth State Listener
```typescript
import { onAuthStateChanged } from '@/lib/firebase';

const unsubscribe = onAuthStateChanged((user) => {
  if (user) {
    console.log('User logged in:', user.email);
  } else {
    console.log('User logged out');
  }
});

// Cleanup
return () => unsubscribe();
```

### Firestore Database Operations

#### Read Single Document
```typescript
import { getDocument } from '@/lib/firebase';

const employee = await getDocument('employees', employeeId);
console.log(employee); // { id, ...data }
```

#### Read Multiple Documents
```typescript
import { getDocuments, where, orderBy, limit } from '@/lib/firebase';

const employees = await getDocuments('employees', [
  where('department', '==', 'Engineering'),
  orderBy('name', 'asc'),
  limit(10)
]);
```

#### Create Document
```typescript
import { createDocument } from '@/lib/firebase';

const newEmployee = await createDocument('employees', {
  name: 'John Doe',
  email: 'john@example.com',
  department: 'Engineering',
  created_at: new Date().toISOString()
});

console.log('Created with ID:', newEmployee.id);
```

#### Update Document
```typescript
import { updateDocument } from '@/lib/firebase';

await updateDocument('employees', employeeId, {
  department: 'Sales',
  updated_at: new Date().toISOString()
});
```

#### Delete Document
```typescript
import { deleteDocument } from '@/lib/firebase';

await deleteDocument('employees', employeeId);
```

### Available Query Constraints

```typescript
// Filtering
where('field', '==', value)
where('field', '!=', value)
where('field', '<', value)
where('field', '<=', value)
where('field', '>', value)
where('field', '>=', value)
where('field', 'in', [value1, value2])
where('field', 'not-in', [value1, value2])
where('field', 'array-contains', value)

// Sorting
orderBy('field', 'asc')
orderBy('field', 'desc')

// Limiting
limit(10)
```

---

## 💾 MinIO Storage Setup

### Server Setup

```bash
# Install MinIO
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin/

# Create data directory
sudo mkdir -p /data/minio

# Create systemd service
sudo nano /etc/systemd/system/minio.service
```

**Service Configuration:**
```ini
[Unit]
Description=MinIO
Documentation=https://min.io/docs/minio/linux/index.html
Wants=network-online.target
After=network-online.target

[Service]
User=minio
Group=minio
Environment="MINIO_ROOT_USER=admin"
Environment="MINIO_ROOT_PASSWORD=your-secure-password"
ExecStart=/usr/local/bin/minio server /data/minio --console-address ":9001"
Restart=always
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

**Start MinIO:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable minio
sudo systemctl start minio
sudo systemctl status minio
```

**Access MinIO Console:**
```
http://your-minio-ip:9001
Username: admin
Password: (your-secure-password)
```

### Create Access Keys

1. Login to MinIO Console
2. Go to "Access Keys"
3. Click "Create access key"
4. Copy the Access Key and Secret Key
5. Add to `.env.local`:
   ```bash
   MINIO_ACCESS_KEY=your-access-key
   MINIO_SECRET_KEY=your-secret-key
   ```

### Create Buckets

```bash
# Using MinIO Client (mc)
mc alias set bimaided http://your-minio-ip:9000 admin your-password
mc mb bimaided/documents
mc mb bimaided/images
mc mb bimaided/cvs
```

### Usage in Code

#### Upload File
```typescript
import { uploadFile } from '@/lib/storage';

const file = event.target.files[0];
const url = await uploadFile('images', `projects/${fileName}`, file);
console.log('File URL:', url);
```

#### Download File
```typescript
import { downloadFile } from '@/lib/storage';

const fileBuffer = await downloadFile('documents', 'path/to/file.pdf');
// Convert to blob for browser download
const blob = new Blob([fileBuffer]);
```

#### Delete File
```typescript
import { deleteFile } from '@/lib/storage';

await deleteFile('images', 'path/to/image.jpg');
```

#### List Files
```typescript
import { listFiles } from '@/lib/storage';

const files = await listFiles('documents', 'projects/');
console.log(files); // Array of file objects
```

### Test MinIO Connection

```bash
npm run test-minio
```

---

## 🔄 Component Migration Guide

### Migration Priority

**High Priority (Core Functionality):**
1. EmployeeList - View and manage employees
2. ProjectManager - Manage projects
3. ContactInquiriesManager - View contact submissions

**Medium Priority:**
4. AddEmployeeForm - Add new employees
5. EditEmployeeDialog - Edit employee details
6. AttendanceRecords - View attendance

**Lower Priority:**
7-22. Other admin and employee features

### Step-by-Step Migration Process

#### Step 1: Replace Imports

**Before:**
```typescript
import { supabase } from "@/lib/supabase-stub";
```

**After:**
```typescript
import { 
  getDocuments, 
  getDocument, 
  createDocument, 
  updateDocument, 
  deleteDocument,
  where, 
  orderBy, 
  limit 
} from "@/lib/firebase";
```

#### Step 2: Convert Database Queries

**Example: EmployeeList.tsx**

**Before (Supabase):**
```typescript
const fetchEmployees = async () => {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("name", { ascending: true });
    
  if (error) {
    console.error(error);
    return;
  }
  
  setEmployees(data);
};
```

**After (Firebase):**
```typescript
const fetchEmployees = async () => {
  try {
    const employees = await getDocuments("employees", [
      orderBy("name", "asc")
    ]);
    setEmployees(employees);
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    toast.error("Failed to load employees");
  }
};
```

#### Step 3: Convert CRUD Operations

**Create:**
```typescript
// Before
const { data, error } = await supabase
  .from("employees")
  .insert({ name, email })
  .select()
  .single();

// After
const newEmployee = await createDocument("employees", {
  name,
  email,
  created_at: new Date().toISOString()
});
```

**Update:**
```typescript
// Before
const { error } = await supabase
  .from("employees")
  .update({ department })
  .eq("id", employeeId);

// After
await updateDocument("employees", employeeId, {
  department,
  updated_at: new Date().toISOString()
});
```

**Delete:**
```typescript
// Before
const { error } = await supabase
  .from("employees")
  .delete()
  .eq("id", employeeId);

// After
await deleteDocument("employees", employeeId);
```

#### Step 4: Convert Auth Calls

```typescript
// Before
const { data: { user } } = await supabase.auth.getUser();

// After
import { getCurrentUser } from "@/lib/firebase";
const user = await getCurrentUser();
```

#### Step 5: Convert Storage Calls

```typescript
// Before
const { data, error } = await supabase.storage
  .from("documents")
  .upload(`path/${fileName}`, file);

// After
import { uploadFile } from "@/lib/storage";
const url = await uploadFile("documents", `path/${fileName}`, file);
```

### Common Patterns

#### Pattern 1: Filtered List
```typescript
// Fetch employees by department
const employees = await getDocuments("employees", [
  where("department", "==", "Engineering"),
  orderBy("name", "asc")
]);
```

#### Pattern 2: Search by Field
```typescript
// Find employee by email
const employees = await getDocuments("employees", [
  where("email", "==", searchEmail),
  limit(1)
]);
const employee = employees[0];
```

#### Pattern 3: Join Alternative (Denormalization)
```typescript
// Store department info with employee
await createDocument("employees", {
  name: "John",
  email: "john@example.com",
  department: {
    id: "dept123",
    name: "Engineering"
  }
});
```

#### Pattern 4: Real-time Updates
```typescript
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, 'employees'),
    (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmployees(data);
    }
  );
  
  return () => unsubscribe();
}, []);
```

---

## 📚 API Reference

### Authentication

```typescript
// Sign in with email/password
signIn(email: string, password: string): Promise<User>

// Sign out current user
signOut(): Promise<void>

// Get current user
getCurrentUser(): Promise<User | null>

// Listen to auth state changes
onAuthStateChanged(callback: (user: User | null) => void): () => void

// Refresh ID token
refreshToken(): Promise<string>
```

### Firestore Database

```typescript
// Get single document by ID
getDocument(collection: string, id: string): Promise<T>

// Get multiple documents with constraints
getDocuments(
  collection: string, 
  constraints?: QueryConstraint[]
): Promise<T[]>

// Create document (auto-generate ID)
createDocument(collection: string, data: any): Promise<T>

// Update document
updateDocument(
  collection: string, 
  id: string, 
  data: Partial<T>
): Promise<void>

// Delete document
deleteDocument(collection: string, id: string): Promise<void>

// Query constraints
where(field: string, operator: string, value: any): QueryConstraint
orderBy(field: string, direction: 'asc' | 'desc'): QueryConstraint
limit(count: number): QueryConstraint
```

### Storage (MinIO)

```typescript
// Upload file
uploadFile(
  bucket: string, 
  path: string, 
  file: File | Buffer
): Promise<string>

// Download file
downloadFile(bucket: string, path: string): Promise<Buffer>

// Delete file
deleteFile(bucket: string, path: string): Promise<void>

// List files
listFiles(bucket: string, prefix?: string): Promise<FileInfo[]>

// Get file URL
getFileUrl(bucket: string, path: string): string
```

---

## 🔧 Conversion Examples

### Example 1: Contact Form Submission

**Before (Supabase):**
```typescript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const { error } = await supabase
    .from('contact_inquiries')
    .insert({
      name: formData.name,
      email: formData.email,
      message: formData.message,
      created_at: new Date().toISOString()
    });
    
  if (error) {
    toast.error('Failed to submit');
    return;
  }
  
  toast.success('Message sent!');
};
```

**After (Firebase):**
```typescript
import { createDocument } from '@/lib/firebase';

const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    await createDocument('contact_inquiries', {
      name: formData.name,
      email: formData.email,
      message: formData.message,
      created_at: new Date().toISOString()
    });
    
    toast.success('Message sent!');
  } catch (error) {
    console.error(error);
    toast.error('Failed to submit');
  }
};
```

### Example 2: Employee Management

**Before (Supabase):**
```typescript
// Fetch with filter
const { data: employees } = await supabase
  .from('employees')
  .select('*')
  .eq('status', 'active')
  .order('name', { ascending: true });

// Update employee
const { error } = await supabase
  .from('employees')
  .update({ status: 'inactive' })
  .eq('id', employeeId);
```

**After (Firebase):**
```typescript
import { getDocuments, updateDocument, where, orderBy } from '@/lib/firebase';

// Fetch with filter
const employees = await getDocuments('employees', [
  where('status', '==', 'active'),
  orderBy('name', 'asc')
]);

// Update employee
await updateDocument('employees', employeeId, {
  status: 'inactive',
  updated_at: new Date().toISOString()
});
```

### Example 3: File Upload

**Before (Supabase):**
```typescript
const handleFileUpload = async (file) => {
  const fileName = `${Date.now()}-${file.name}`;
  
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(`uploads/${fileName}`, file);
    
  if (uploadError) throw uploadError;
  
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(`uploads/${fileName}`);
    
  return data.publicUrl;
};
```

**After (MinIO):**
```typescript
import { uploadFile } from '@/lib/storage';

const handleFileUpload = async (file) => {
  const fileName = `${Date.now()}-${file.name}`;
  const url = await uploadFile('documents', `uploads/${fileName}`, file);
  return url;
};
```

---

## 🐛 Troubleshooting

### Firebase Authentication Issues

**Problem:** "Auth token expired"
```typescript
// Solution: Refresh token
import { refreshToken } from '@/lib/firebase';
const newToken = await refreshToken();
```

**Problem:** "User not found"
```typescript
// Ensure user exists in Firebase Authentication
// Check Firebase Console > Authentication > Users
```

**Problem:** "Invalid credentials"
```typescript
// Verify email/password are correct
// Check if email confirmation is required
```

### Firestore Issues

**Problem:** "Missing or insufficient permissions"
```typescript
// Update Firestore Security Rules
// Ensure user is authenticated
// Check user has correct role in user_roles collection
```

**Problem:** "Document not found"
```typescript
// Verify document ID is correct
// Check if document was deleted
// Use try-catch for error handling
```

**Problem:** "Query requires an index"
```typescript
// Click the link in error message to create index
// Or manually create composite index in Firebase Console
```

### MinIO Storage Issues

**Problem:** "Connection refused"
```bash
# Check MinIO server is running
sudo systemctl status minio

# Check firewall allows port 9000
sudo ufw allow 9000
```

**Problem:** "Access denied"
```bash
# Verify access keys in .env.local
# Check bucket permissions in MinIO Console
```

**Problem:** "File not found"
```typescript
// Verify bucket name and file path
// Check if file was deleted
// Ensure file was uploaded successfully
```

### Build Issues

**Problem:** "Cannot find module '@/lib/firebase'"
```bash
# Restart dev server
npm run dev
```

**Problem:** "Stub error at runtime"
```typescript
// Component still using stub
// Migrate component to use Firebase directly
// See Component Migration Guide section
```

---

## 📝 Important Notes

### Security Considerations

1. **Never commit** `.env.local` to git
2. **Rotate credentials** regularly
3. **Use security rules** in Firestore
4. **Validate input** on server side
5. **Use HTTPS** in production

### Performance Tips

1. **Use indexes** for complex queries
2. **Limit query results** to reduce costs
3. **Cache frequently accessed data**
4. **Use pagination** for large datasets
5. **Optimize security rules** to avoid excessive reads

### Data Migration

To migrate data from Supabase to Firestore:

1. **Export from Supabase:**
   ```bash
   # Use Supabase dashboard or CLI
   supabase db dump > backup.sql
   ```

2. **Convert to Firestore format:**
   ```javascript
   // Transform SQL data to JSON documents
   // Add IDs and timestamps
   // Remove SQL-specific fields
   ```

3. **Import to Firestore:**
   ```javascript
   const admin = require('firebase-admin');
   const db = admin.firestore();
   
   // Batch write (max 500 per batch)
   const batch = db.batch();
   data.forEach(doc => {
     const ref = db.collection('employees').doc();
     batch.set(ref, doc);
   });
   await batch.commit();
   ```

### Next Steps

1. ✅ Firebase and MinIO are set up
2. ✅ Authentication layer working
3. 🔄 Migrate remaining 22 components
4. 🔄 Set up production deployment
5. 🔄 Configure custom domain
6. 🔄 Set up monitoring and analytics

---

## 🆘 Getting Help

**File Issues:**
- Create detailed bug reports
- Include error messages
- Provide reproduction steps

**Ask Questions:**
- Check this documentation first
- Review Firebase docs: https://firebase.google.com/docs
- Review MinIO docs: https://min.io/docs/minio/linux/index.html

**Useful Commands:**
```bash
# Test Firebase connection
npm run test-firebase

# Test MinIO connection
npm run test-minio

# Build for production
npm run build

# Start dev server
npm run dev
```

---

**End of Documentation**
