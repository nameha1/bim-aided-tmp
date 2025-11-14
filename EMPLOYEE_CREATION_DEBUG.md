# Employee Creation Debug Guide

## Issue
Getting "Failed to create authentication account" error (400 Bad Request) when trying to add a new employee.

## Changes Made

### 1. Enhanced Error Handling

#### `/lib/firebase/admin.ts`
- Added better logging for Firebase Admin initialization
- Added validation to ensure `NEXT_PUBLIC_FIREBASE_PROJECT_ID` is set
- Improved error messages for initialization failures

#### `/app/api/create-employee/route.ts`
- Added comprehensive logging throughout the employee creation process
- Added validation for required fields (department, designation, joiningDate)
- Added email format validation
- Added password length validation
- Added specific error messages for different Firebase Auth errors:
  - `auth/email-already-exists` - Email already in use
  - `auth/invalid-email` - Invalid email format
  - `auth/invalid-password` - Weak password
  - `auth/operation-not-allowed` - Email/password auth not enabled
- Added checks to ensure adminAuth and adminDb are initialized

#### `/components/admin/AddEmployeeForm.tsx`
- Added client-side validation before form submission
- Added detailed console logging of submitted data (password hidden)
- Improved error display with more details including error codes

### 2. Debug Endpoint

Created `/app/api/debug/firebase-admin/route.ts` to check Firebase Admin SDK status.

## Debugging Steps

### Step 1: Check Firebase Admin Initialization

1. Open your browser and navigate to:
   ```
   http://localhost:3001/api/debug/firebase-admin
   ```

2. Check the response. It should show:
   - `adminAuthInitialized: true`
   - `adminDbInitialized: true`
   - `auth.works: true`
   - `firestore.works: true`

If any of these are `false` or have errors, see the "Common Issues" section below.

### Step 2: Check Environment Variables

Verify your `.env.local` file has these variables set:

```bash
# Required Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# CRITICAL: Firebase Admin Service Account
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

### Step 3: Check Server Console

When you try to create an employee, check your terminal/server console for logs:

1. Look for "Creating employee with data:" - confirms the API endpoint was called
2. Look for "Creating Firebase Auth user for:" - confirms auth creation started
3. Look for "Firebase Auth user created successfully:" - confirms auth user created
4. Look for "Creating employee document in Firestore..." - confirms Firestore write started
5. Look for "Employee document created with ID:" - confirms success

If any step fails, the logs will show the exact error.

### Step 4: Check Browser Console

In the browser console (F12), you should see:
1. "Submitting employee data:" with the form data
2. Any API errors with details

## Common Issues and Solutions

### Issue 1: Firebase Admin Not Initialized

**Symptoms:**
- Debug endpoint shows `adminAuthInitialized: false` or `adminDbInitialized: false`
- Error: "Firebase Admin is not properly configured"

**Solution:**
1. Ensure `FIREBASE_SERVICE_ACCOUNT_KEY` is set in `.env.local`
2. Get the service account key from Firebase Console:
   - Go to Firebase Console > Project Settings
   - Click on "Service Accounts" tab
   - Click "Generate New Private Key"
   - Copy the entire JSON content
   - Paste it as the value for `FIREBASE_SERVICE_ACCOUNT_KEY` in `.env.local`
3. Restart your Next.js development server

### Issue 2: Email Already Exists

**Symptoms:**
- Error: "An account with this email already exists"
- Error code: `auth/email-already-exists`

**Solution:**
1. Go to Firebase Console > Authentication > Users
2. Check if the email already exists
3. Either delete the existing user or use a different email

### Issue 3: Email/Password Auth Not Enabled

**Symptoms:**
- Error: "Email/password authentication is not enabled"
- Error code: `auth/operation-not-allowed`

**Solution:**
1. Go to Firebase Console > Authentication
2. Click on "Sign-in method" tab
3. Enable "Email/Password" provider

### Issue 4: Invalid Service Account

**Symptoms:**
- Auth or Firestore operations fail
- Error mentions credentials or permissions

**Solution:**
1. Verify the service account JSON is valid (use a JSON validator)
2. Ensure the service account has the correct permissions:
   - Firebase Admin SDK Administrator Service Agent
3. Regenerate the service account key if needed

### Issue 5: CORS or Network Errors

**Symptoms:**
- Network errors in browser console
- Failed to fetch

**Solution:**
1. Ensure the Next.js dev server is running on port 3001
2. Check if any firewall or antivirus is blocking the request
3. Try clearing browser cache

### Issue 6: Missing Required Fields

**Symptoms:**
- Error: "Missing required fields" or "Department is required" or "Designation is required"

**Solution:**
1. Check the form - ensure all required fields are filled:
   - First Name
   - Last Name
   - Email
   - Password (min 6 characters)
   - Joining Date
   - Department
   - Designation
2. The form should now show validation errors before submission

## Testing the Fix

1. **Restart the development server:**
   ```bash
   # Stop the current server (Ctrl+C)
   # Start again
   npm run dev
   ```

2. **Check the debug endpoint:**
   ```
   http://localhost:3001/api/debug/firebase-admin
   ```
   All checks should pass.

3. **Try creating an employee:**
   - Fill in all required fields
   - Use a valid email that doesn't exist yet
   - Use a password with at least 6 characters
   - Select a department and designation
   - Submit the form

4. **Check the logs:**
   - Browser console (F12) for client-side logs
   - Terminal for server-side logs

## Next Steps If Still Not Working

If the issue persists after following all steps:

1. **Capture the complete error:**
   - Browser console errors (screenshot)
   - Server terminal logs (copy all relevant lines)
   - Debug endpoint response (copy the JSON)

2. **Verify Firebase Console:**
   - Check if the user was created in Authentication
   - Check if the employee document was created in Firestore

3. **Check Firestore Rules:**
   - Ensure your Firestore rules allow the admin to write to the collections:
     - `employees`
     - `users`
     - `user_roles`

4. **Check Network Tab:**
   - Open browser DevTools > Network tab
   - Try creating an employee again
   - Find the `/api/create-employee` request
   - Check the request payload and response

## Additional Notes

- The password must be at least 6 characters (Firebase requirement)
- Email must be a valid format
- Department and Designation are now required fields
- The system will automatically generate an Employee ID (EID) based on joining date
- Profile images are compressed to max 100KB
- Documents are limited to 3 files, each max 2MB
