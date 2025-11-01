# BIMaided Setup Guide

## Initial Setup

Your BIMaided website and employee management system is ready! Follow these steps to get started:

### 1. Create the First Admin User

To create your first admin account, run this SQL query in your Supabase SQL Editor:

```sql
-- Replace with your actual email and secure password
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  'admin@bimaided.com',
  crypt('YourSecurePassword123!', gen_salt('bf')),
  now(),
  '{"role": "admin"}'::jsonb
);

-- Get the user_id from the auth.users table
-- Replace USER_ID_HERE with the actual UUID from the query above
INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'Admin');
```

Or create your admin user through the Supabase dashboard:
1. Go to Authentication → Users
2. Create a new user
3. Copy their user_id
4. Run: `INSERT INTO user_roles (user_id, role) VALUES ('USER_ID_HERE', 'Admin');`

### 2. Add Departments and Designations

Before adding employees, set up your organizational structure:

```sql
-- Add Departments
INSERT INTO departments (name, description) VALUES 
  ('Architecture', 'Architectural design and BIM modeling'),
  ('Engineering', 'Structural and MEP engineering'),
  ('VDC', 'Virtual Design and Construction'),
  ('Human Resources', 'HR and administration'),
  ('Management', 'Project and business management');

-- Add Designations (get department_id from departments table)
INSERT INTO designations (name, level, department_id) VALUES 
  ('BIM Manager', 'Senior', 'DEPT_ID_HERE'),
  ('Senior Architect', 'Senior', 'DEPT_ID_HERE'),
  ('BIM Modeler', 'Mid', 'DEPT_ID_HERE'),
  ('Revit Technician', 'Junior', 'DEPT_ID_HERE');
```

### 3. Access the System

**Public Website:** Visit your homepage to see the beautiful BIMaided corporate website

**Admin Portal:** 
- Navigate to `/login`
- Sign in with your admin credentials
- Access admin dashboard to:
  - Add new employees (with reporting manager assignment)
  - Manage leave requests (two-tier approval)
  - Add and manage projects
  - Create and manage career postings
  - View employee data

**Employee Portal:**
- Employees receive their login credentials from admin
- Navigate to `/login`
- Access employee dashboard to:
  - View profile
  - Request leave (routed to reporting manager first)
  - Check attendance history
  - **Supervisors**: Approve team leave requests

## Features

### Public Website
- Landing page with hero section and company overview
- Services page (BIM Modeling, Advanced BIM, VDC, Global BIM)
- **Projects portfolio** - Dynamically loaded from database with category filtering
- About Us page
- **Career opportunities** - Dynamically loaded from database
- ~~Blog section~~ (removed)

### Employee Management System

#### **Leave Management (Core Feature with Two-Tier Approval)**
- **Annual Leave**: 20 days
- **Sick Leave**: 10 days
- **Casual Leave**: 10 days
- Multiple leave types supported
- **Two-tier approval workflow:**
  1. Employee submits leave request
  2. **Reporting Manager** (Supervisor) reviews and approves/rejects
  3. After supervisor approval, request goes to **Admin** for final approval
  4. Both approvals required for leave to be granted

#### **Admin Capabilities**
- Add/manage employees with reporting manager assignment
- Two-stage leave approval (final approval after supervisor)
- View all employee data
- Manage departments and designations
- **Add and manage projects** for website portfolio
- **Create and manage career postings**

#### **Reporting Manager / Supervisor Capabilities**
- View and approve leave requests from team members
- First level of approval in two-tier system
- Automatic supervisor detection (employees assigned to them)

#### **Employee Self-Service**
- View personal profile
- Submit leave requests (automatically routed to supervisor)
- View attendance history with approval status
- Check leave balances

#### **Project Management**
- Admin can add projects under categories:
  - Commercial
  - Education & Healthcare
  - Cultural & Sports
  - Residential
  - Infrastructure & Municipal
  - Industrial & Park
- Projects appear on public website automatically
- Publish/unpublish projects

#### **Career Postings Management**
- Admin can create job postings
- Link to departments
- Set location, employment type, requirements
- Publish/unpublish postings
- Postings appear on public website automatically

## Security Notes

- RLS (Row Level Security) is enabled on all tables
- Admin role is stored separately for security
- Employees can only view/edit their own data
- Supervisors can only view their team's leave requests
- Admin has full access to all employee data
- Two-tier approval prevents unauthorized leave

## Database Schema

The system includes these main tables:
- `employees` - Employee information (with supervisor_id for reporting manager)
- `departments` - Organizational departments
- `designations` - Job roles and positions
- `user_roles` - Role assignments (Admin/Employee)
- `salaries` - Compensation records
- `attendance` - Attendance and leave records (with supervisor & admin approval fields)
- `leave_balances` - Annual leave tracking
- `documents` - Employee documents
- `project_assignments` - Project allocations
- `emergency_contacts` - Emergency contact information
- **`projects`** - Portfolio projects with categories
- **`career_postings`** - Job openings

## Two-Tier Leave Approval Workflow

1. **Employee submits leave request** → Status: "Pending Supervisor"
2. **Reporting Manager reviews** → Can approve or reject
   - If rejected: Request deleted
   - If approved: `supervisor_approved = true`, Status: "Pending Admin"
3. **Admin reviews** → Final approval
   - If rejected: Request deleted
   - If approved: `admin_approved = true`, Status: "Fully Approved"

## Support

For issues or questions, refer to the Supabase dashboard for:
- Database management
- User authentication
- Logs and monitoring
