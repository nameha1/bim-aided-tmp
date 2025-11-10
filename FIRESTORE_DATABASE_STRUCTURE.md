# Firestore Database Structure

## Collections Overview

### 1. **departments**
Stores company departments.

**Fields:**
- `name` (string) - Department name
- `description` (string) - Department description
- `active` (boolean) - Whether department is active

**Sample Data:**
- Engineering, Architecture, Project Management, BIM Services, Administration

---

### 2. **designations**
Job titles and positions.

**Fields:**
- `title` (string) - Job title
- `level` (string) - Seniority level (Junior/Mid/Senior)
- `department_id` (string) - Reference to department

**Sample Data:**
- BIM Manager, Senior Architect, Project Manager, BIM Modeler, etc.

---

### 3. **projects**
Client projects and their details.

**Fields:**
- `title` (string) - Project name
- `description` (string) - Project description
- `client` (string) - Client name
- `location` (string) - Project location
- `status` (string) - planning | in_progress | completed | on_hold
- `start_date` (string) - ISO date
- `end_date` (string) - ISO date
- `project_type` (string) - Commercial | Residential | Healthcare | etc.
- `budget` (number) - Project budget
- `image_url` (string) - Project image path
- `featured` (boolean) - Show on homepage
- `created_at` (string) - ISO timestamp

---

### 4. **employees**
Employee records.

**Fields:**
- `eid` (string) - Employee ID (e.g., BIM001)
- `name` (string) - Full name
- `email` (string) - Email address
- `phone` (string) - Phone number
- `department` (string) - Department name
- `designation` (string) - Job title
- `hire_date` (string) - ISO date
- `status` (string) - active | inactive | on_leave
- `salary` (number) - Monthly salary
- `supervisor_id` (string) - Reference to supervisor employee
- `created_at` (string) - ISO timestamp

---

### 5. **users**
User accounts (linked to Firebase Auth).

**Fields:**
- `email` (string) - Email address
- `displayName` (string) - Display name
- `role` (string) - admin | employee
- `created_at` (string) - ISO timestamp

**Note:** Document ID matches Firebase Auth UID

---

### 6. **user_roles**
User role assignments (for authorization).

**Fields:**
- `role` (string) - admin | employee | supervisor
- `email` (string) - User email
- `created_at` (string) - ISO timestamp

**Note:** Document ID matches Firebase Auth UID

---

### 7. **contact_inquiries**
Contact form submissions.

**Fields:**
- `name` (string) - Contact name
- `email` (string) - Contact email
- `phone` (string) - Contact phone
- `subject` (string) - Inquiry subject
- `message` (string) - Inquiry message
- `status` (string) - new | in_progress | resolved | closed
- `created_at` (string) - ISO timestamp

---

### 8. **job_postings**
Job openings and career opportunities.

**Fields:**
- `title` (string) - Job title
- `department` (string) - Department name
- `location` (string) - Job location
- `employment_type` (string) - full_time | part_time | contract
- `description` (string) - Job description
- `requirements` (array) - Array of requirement strings
- `responsibilities` (array) - Array of responsibility strings
- `salary_range` (string) - Salary range (e.g., "15000-25000 AED")
- `status` (string) - active | closed | filled
- `posted_date` (string) - ISO timestamp
- `created_at` (string) - ISO timestamp

---

### 9. **job_applications**
Applications for job postings.

**Fields:**
- `job_id` (string) - Reference to job_postings
- `applicant_name` (string) - Applicant name
- `email` (string) - Applicant email
- `phone` (string) - Phone number
- `cv_url` (string) - CV file URL
- `cover_letter` (string) - Cover letter text
- `status` (string) - pending | under_review | shortlisted | rejected | hired
- `applied_date` (string) - ISO timestamp
- `created_at` (string) - ISO timestamp

---

### 10. **attendance**
Employee attendance records.

**Fields:**
- `employee_id` (string) - Reference to employees
- `date` (string) - ISO date (YYYY-MM-DD)
- `check_in` (string) - Check-in time (ISO timestamp)
- `check_out` (string) - Check-out time (ISO timestamp)
- `status` (string) - present | absent | late | half_day | leave
- `notes` (string) - Additional notes
- `created_at` (string) - ISO timestamp

---

### 11. **leave_requests**
Employee leave/time-off requests.

**Fields:**
- `employee_id` (string) - Reference to employees
- `leave_type` (string) - annual | sick | emergency | unpaid
- `start_date` (string) - ISO date
- `end_date` (string) - ISO date
- `days` (number) - Number of days
- `reason` (string) - Leave reason
- `status` (string) - pending | approved | rejected
- `approved_by` (string) - Approver employee_id
- `approved_at` (string) - ISO timestamp
- `document_url` (string) - Supporting document URL (optional)
- `created_at` (string) - ISO timestamp

---

### 12. **assignments**
Project assignments and teams.

**Fields:**
- `project_id` (string) - Reference to projects
- `title` (string) - Assignment title
- `description` (string) - Assignment description
- `start_date` (string) - ISO date
- `end_date` (string) - ISO date
- `status` (string) - active | completed | cancelled
- `supervisor_id` (string) - Reference to employees (supervisor)
- `created_by` (string) - User ID who created
- `created_at` (string) - ISO timestamp

---

### 13. **assignment_members**
Team members for assignments.

**Fields:**
- `assignment_id` (string) - Reference to assignments
- `employee_id` (string) - Reference to employees
- `role` (string) - Team member role
- `joined_date` (string) - ISO date
- `status` (string) - active | completed | removed
- `created_at` (string) - ISO timestamp

---

### 14. **invoices**
Project invoices and billing.

**Fields:**
- `invoice_number` (string) - Unique invoice number
- `project_id` (string) - Reference to projects
- `client_name` (string) - Client name
- `amount` (number) - Invoice amount
- `currency` (string) - Currency code (AED, USD, etc.)
- `issue_date` (string) - ISO date
- `due_date` (string) - ISO date
- `status` (string) - draft | sent | paid | overdue | cancelled
- `paid_date` (string) - ISO date (when paid)
- `notes` (string) - Additional notes
- `created_at` (string) - ISO timestamp

---

### 15. **transactions**
Financial transactions.

**Fields:**
- `transaction_type` (string) - income | expense
- `category` (string) - Transaction category
- `amount` (number) - Transaction amount
- `currency` (string) - Currency code
- `description` (string) - Transaction description
- `date` (string) - ISO date
- `invoice_id` (string) - Reference to invoices (optional)
- `project_id` (string) - Reference to projects (optional)
- `created_by` (string) - User ID
- `created_at` (string) - ISO timestamp

---

### 16. **holidays**
Company holidays and public holidays.

**Fields:**
- `name` (string) - Holiday name
- `date` (string) - ISO date
- `type` (string) - public | company | religious
- `created_at` (string) - ISO timestamp

---

### 17. **ip_whitelist**
IP addresses allowed to access certain features.

**Fields:**
- `ip_address` (string) - IP address
- `description` (string) - Description/label
- `employee_id` (string) - Reference to employees
- `active` (boolean) - Whether whitelist entry is active
- `added_by` (string) - User ID who added
- `created_at` (string) - ISO timestamp

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/user_roles/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isEmployee() {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/user_roles/$(request.auth.uid));
    }
    
    // Public read collections
    match /projects/{projectId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /job_postings/{postingId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Contact inquiries - anyone can create
    match /contact_inquiries/{inquiryId} {
      allow read: if isAdmin();
      allow create: if true;
      allow update, delete: if isAdmin();
    }
    
    // Job applications - anyone can create
    match /job_applications/{applicationId} {
      allow read: if isAdmin();
      allow create: if true;
      allow update, delete: if isAdmin();
    }
    
    // Admin-only collections
    match /departments/{departmentId} {
      allow read: if isEmployee();
      allow write: if isAdmin();
    }
    
    match /designations/{designationId} {
      allow read: if isEmployee();
      allow write: if isAdmin();
    }
    
    match /employees/{employeeId} {
      allow read: if isEmployee();
      allow write: if isAdmin();
    }
    
    match /invoices/{invoiceId} {
      allow read, write: if isAdmin();
    }
    
    match /transactions/{transactionId} {
      allow read, write: if isAdmin();
    }
    
    match /ip_whitelist/{entryId} {
      allow read, write: if isAdmin();
    }
    
    // Employee access to their own data
    match /attendance/{attendanceId} {
      allow read: if isEmployee();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }
    
    match /leave_requests/{requestId} {
      allow read: if isEmployee();
      allow create: if isAuthenticated();
      allow update: if isAdmin() || 
        resource.data.employee_id == request.auth.uid;
      allow delete: if isAdmin();
    }
    
    match /assignments/{assignmentId} {
      allow read: if isEmployee();
      allow write: if isAdmin();
    }
    
    match /assignment_members/{memberId} {
      allow read: if isEmployee();
      allow write: if isAdmin();
    }
    
    match /holidays/{holidayId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // User data
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || request.auth.uid == userId;
    }
    
    match /user_roles/{userId} {
      allow read: if isAuthenticated();
      allow write: if false; // Only via admin SDK
    }
    
    // Default: deny all
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Query Examples

### Get all active employees
```typescript
const employees = await getDocuments('employees', [
  where('status', '==', 'active'),
  orderBy('name', 'asc')
]);
```

### Get projects by status
```typescript
const projects = await getDocuments('projects', [
  where('status', '==', 'in_progress'),
  orderBy('start_date', 'desc')
]);
```

### Get employee attendance for date range
```typescript
const attendance = await getDocuments('attendance', [
  where('employee_id', '==', employeeId),
  where('date', '>=', startDate),
  where('date', '<=', endDate),
  orderBy('date', 'asc')
]);
```

### Get pending leave requests
```typescript
const requests = await getDocuments('leave_requests', [
  where('status', '==', 'pending'),
  orderBy('created_at', 'desc')
]);
```

## Setup Script

The database was automatically set up with:
```bash
npm run setup-firestore
```

This script:
- ✅ Created 14 collections
- ✅ Added 21 sample documents
- ✅ Created admin user (admin@bimaided.com)
- ✅ Set admin role in user_roles
- ✅ Created user document

## Admin Credentials

**Email:** admin@bimaided.com  
**Password:** Admin@123456 (Please change immediately!)

To change password:
1. Login to the application
2. Go to profile settings
3. Update password

Or via Firebase Console:
1. Go to Authentication → Users
2. Find admin@bimaided.com
3. Click three dots → Reset password

## Adding More Data

You can run the setup script multiple times. It will skip existing documents and only create new ones.

To reset everything:
1. Go to Firebase Console
2. Delete all collections
3. Run `npm run setup-firestore` again
