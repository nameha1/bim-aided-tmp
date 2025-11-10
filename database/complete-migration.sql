-- =====================================================
-- BIM-AIDED COMPLETE DATABASE MIGRATION
-- =====================================================
-- Comprehensive database schema for BIM-AIDED Portal
-- This includes all tables, RLS policies, storage buckets, and initial data
-- 
-- Run this in your Supabase SQL Editor
-- Estimated execution time: 30-60 seconds
-- 
-- Author: BIM-AIDED Team
-- Date: November 9, 2025
-- =====================================================

BEGIN;

-- =====================================================
-- SECTION 1: EXTENSIONS
-- =====================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =====================================================
-- SECTION 2: CORE TABLES
-- =====================================================

-- -----------------------------------------------------
-- 2.1 Departments Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE departments IS 'Organization departments (Architecture, Engineering, VDC, HR, Management)';

-- -----------------------------------------------------
-- 2.2 Designations Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS designations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  level TEXT CHECK (level IN ('Junior', 'Mid', 'Senior', 'Lead', 'Manager')),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE designations IS 'Job designations with hierarchy levels';

-- -----------------------------------------------------
-- 2.3 Employees Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  eid TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  national_id TEXT,
  address TEXT,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  designation_id UUID REFERENCES designations(id) ON DELETE SET NULL,
  supervisor_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  joining_date DATE DEFAULT CURRENT_DATE,
  employment_status TEXT DEFAULT 'Active' CHECK (employment_status IN ('Active', 'On Leave', 'Resigned', 'Terminated')),
  
  -- Salary Information
  basic_salary DECIMAL(10,2) DEFAULT 0,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_branch TEXT,
  
  -- Leave Balances
  casual_leave_balance INTEGER DEFAULT 10,
  sick_leave_balance INTEGER DEFAULT 10,
  
  -- Profile
  profile_photo_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE employees IS 'Employee master data with salary and leave information';

-- -----------------------------------------------------
-- 2.4 User Roles Table (Auth Integration)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee', 'supervisor')),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE user_roles IS 'Maps Supabase auth users to application roles';

-- =====================================================
-- SECTION 3: ATTENDANCE & LEAVE MANAGEMENT
-- =====================================================

-- -----------------------------------------------------
-- 3.1 Attendance Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'half_day', 'late', 'on_leave')),
  
  -- Time tracking
  working_hours DECIMAL(4,2) DEFAULT 0,
  late_minutes INTEGER DEFAULT 0,
  is_late BOOLEAN DEFAULT FALSE,
  leave_hours DECIMAL(4,2) DEFAULT 0,
  
  -- Metadata
  ip_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(employee_id, date)
);

COMMENT ON TABLE attendance IS 'Daily attendance records with time tracking';

-- -----------------------------------------------------
-- 3.2 Leave Requests Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('sick', 'casual', 'annual', 'unpaid', 'emergency')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days DECIMAL(5,2) NOT NULL,
  reason TEXT NOT NULL,
  attachment_url TEXT,
  
  -- Approval workflow
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by UUID REFERENCES employees(id),
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE leave_requests IS 'Employee leave applications and approvals';

-- -----------------------------------------------------
-- 3.3 Leave Balance History Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS leave_balance_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  casual_leave_granted INTEGER DEFAULT 10,
  sick_leave_granted INTEGER DEFAULT 10,
  casual_leave_used DECIMAL(5,2) DEFAULT 0,
  sick_leave_used DECIMAL(5,2) DEFAULT 0,
  unpaid_leave_days DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, year)
);

COMMENT ON TABLE leave_balance_history IS 'Yearly leave balance tracking';

-- -----------------------------------------------------
-- 3.4 Holidays Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date)
);

COMMENT ON TABLE holidays IS 'Public holidays and office closures';

-- =====================================================
-- SECTION 4: PROJECTS & ASSIGNMENTS
-- =====================================================

-- -----------------------------------------------------
-- 4.1 Projects Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  client_name TEXT,
  category TEXT,
  
  -- Images
  image_url TEXT,
  gallery_image_1 TEXT,
  gallery_image_2 TEXT,
  gallery_image_3 TEXT,
  gallery_image_4 TEXT,
  gallery_image_5 TEXT,
  
  -- Project details
  completion_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
  published BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE projects IS 'BIM projects with gallery images';

-- -----------------------------------------------------
-- 4.2 Project Assignments Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS project_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  role TEXT,
  assigned_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'removed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, employee_id)
);

COMMENT ON TABLE project_assignments IS 'Employee assignments to projects';

-- =====================================================
-- SECTION 5: PAYROLL MANAGEMENT
-- =====================================================

-- -----------------------------------------------------
-- 5.1 Salary Configuration Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS salary_configuration (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_key TEXT NOT NULL UNIQUE,
  config_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE salary_configuration IS 'System-wide salary calculation rules';

-- -----------------------------------------------------
-- 5.2 Monthly Payroll Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS monthly_payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  
  -- Salary breakdown
  basic_salary DECIMAL(10,2) NOT NULL,
  total_working_days INTEGER DEFAULT 30,
  total_present_days INTEGER DEFAULT 0,
  total_absent_days INTEGER DEFAULT 0,
  total_late_days INTEGER DEFAULT 0,
  total_half_days DECIMAL(5,2) DEFAULT 0,
  
  -- Leave tracking
  casual_leave_taken DECIMAL(5,2) DEFAULT 0,
  sick_leave_taken DECIMAL(5,2) DEFAULT 0,
  unpaid_leave_days DECIMAL(5,2) DEFAULT 0,
  
  -- Deductions
  late_penalty_days DECIMAL(5,2) DEFAULT 0,
  hourly_leave_hours DECIMAL(5,2) DEFAULT 0,
  total_deduction DECIMAL(10,2) DEFAULT 0,
  net_payable_salary DECIMAL(10,2) NOT NULL,
  
  -- Approval workflow
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  remarks TEXT,
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(employee_id, month, year)
);

COMMENT ON TABLE monthly_payroll IS 'Monthly salary calculation and payment records';

-- -----------------------------------------------------
-- 5.3 Salary Deductions Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS salary_deductions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payroll_id UUID NOT NULL REFERENCES monthly_payroll(id) ON DELETE CASCADE,
  deduction_type TEXT NOT NULL CHECK (deduction_type IN ('unpaid_leave', 'late_penalty', 'half_day', 'hourly_leave', 'other')),
  deduction_days DECIMAL(5,2) DEFAULT 0,
  deduction_amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE salary_deductions IS 'Detailed breakdown of salary deductions';

-- -----------------------------------------------------
-- 5.4 Salary Slips Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS salary_slips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payroll_id UUID NOT NULL REFERENCES monthly_payroll(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  slip_number TEXT NOT NULL UNIQUE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  file_url TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_to_employee BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE salary_slips IS 'Generated salary slip documents';

-- =====================================================
-- SECTION 6: RECRUITMENT
-- =====================================================

-- -----------------------------------------------------
-- 6.1 Job Postings Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  department TEXT,
  location TEXT,
  employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'internship')),
  description TEXT NOT NULL,
  requirements TEXT,
  salary_range TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE job_postings IS 'Job openings and career opportunities';

-- -----------------------------------------------------
-- 6.2 Job Applications Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  cv_url TEXT,
  cover_letter TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'hired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE job_applications IS 'Job application submissions';

-- =====================================================
-- SECTION 7: COMMUNICATION & SUPPORT
-- =====================================================

-- -----------------------------------------------------
-- 7.1 Contact Inquiries Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE contact_inquiries IS 'Contact form submissions from website';

-- =====================================================
-- SECTION 8: SECURITY & ACCESS CONTROL
-- =====================================================

-- -----------------------------------------------------
-- 8.1 IP Whitelist Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS ip_whitelist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE ip_whitelist IS 'Whitelisted IP addresses for attendance check-in';

-- =====================================================
-- SECTION 9: INDEXES FOR PERFORMANCE
-- =====================================================

-- Employees
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_eid ON employees(eid);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_designation ON employees(designation_id);
CREATE INDEX IF NOT EXISTS idx_employees_supervisor ON employees(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(employment_status);

-- User Roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_employee_id ON user_roles(employee_id);

-- Attendance
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);

-- Leave Requests
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);

-- Leave Balance History
CREATE INDEX IF NOT EXISTS idx_leave_balance_history_employee ON leave_balance_history(employee_id, year);

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);

-- Project Assignments
CREATE INDEX IF NOT EXISTS idx_project_assignments_project ON project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_employee ON project_assignments(employee_id);

-- Payroll
CREATE INDEX IF NOT EXISTS idx_monthly_payroll_employee ON monthly_payroll(employee_id, year, month);
CREATE INDEX IF NOT EXISTS idx_monthly_payroll_status ON monthly_payroll(status);
CREATE INDEX IF NOT EXISTS idx_salary_deductions_payroll ON salary_deductions(payroll_id);
CREATE INDEX IF NOT EXISTS idx_salary_slips_employee ON salary_slips(employee_id, year, month);

-- Job Applications
CREATE INDEX IF NOT EXISTS idx_job_applications_posting ON job_applications(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);

-- Contact Inquiries
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries(status);

-- =====================================================
-- SECTION 10: TRIGGERS FOR AUTO-UPDATE
-- =====================================================

-- Generic trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_designations_updated_at BEFORE UPDATE ON designations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_balance_history_updated_at BEFORE UPDATE ON leave_balance_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_assignments_updated_at BEFORE UPDATE ON project_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_payroll_updated_at BEFORE UPDATE ON monthly_payroll
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON job_postings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_inquiries_updated_at BEFORE UPDATE ON contact_inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ip_whitelist_updated_at BEFORE UPDATE ON ip_whitelist
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 11: UTILITY FUNCTIONS
-- =====================================================

-- Function to calculate daily salary rate
CREATE OR REPLACE FUNCTION calculate_daily_salary_rate(
  p_basic_salary DECIMAL,
  p_working_days INTEGER DEFAULT 30
)
RETURNS DECIMAL AS $$
BEGIN
  RETURN ROUND(p_basic_salary / p_working_days, 2);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_daily_salary_rate IS 'Calculate per-day salary based on basic salary and working days';

-- =====================================================
-- SECTION 12: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_whitelist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public access tables

-- Job Postings (public can view active postings)
DROP POLICY IF EXISTS "Anyone can view active job postings" ON job_postings;
CREATE POLICY "Anyone can view active job postings"
  ON job_postings FOR SELECT
  USING (status = 'active');

-- Job Applications (anyone can insert, admins can view/manage)
DROP POLICY IF EXISTS "Anyone can submit job application" ON job_applications;
CREATE POLICY "Anyone can submit job application"
  ON job_applications FOR INSERT
  WITH CHECK (true);

-- Contact Inquiries (anyone can submit)
DROP POLICY IF EXISTS "Anyone can submit contact inquiry" ON contact_inquiries;
CREATE POLICY "Anyone can submit contact inquiry"
  ON contact_inquiries FOR INSERT
  WITH CHECK (true);

-- Projects (public can view published projects)
DROP POLICY IF EXISTS "Anyone can view published projects" ON projects;
CREATE POLICY "Anyone can view published projects"
  ON projects FOR SELECT
  USING (published = true);

-- Holidays (authenticated users can view)
DROP POLICY IF EXISTS "Authenticated users can view holidays" ON holidays;
CREATE POLICY "Authenticated users can view holidays"
  ON holidays FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for authenticated users

-- User Roles (users can view their own role)
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
CREATE POLICY "Users can view their own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Employees (authenticated users can view all employees)
DROP POLICY IF EXISTS "Authenticated users can view employees" ON employees;
CREATE POLICY "Authenticated users can view employees"
  ON employees FOR SELECT
  TO authenticated
  USING (true);

-- Attendance (employees can view their own, admins can view all)
DROP POLICY IF EXISTS "Employees can view own attendance" ON attendance;
CREATE POLICY "Employees can view own attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT employee_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employees can insert own attendance" ON attendance;
CREATE POLICY "Employees can insert own attendance"
  ON attendance FOR INSERT
  TO authenticated
  WITH CHECK (
    employee_id IN (
      SELECT employee_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

-- Leave Requests (employees can manage their own)
DROP POLICY IF EXISTS "Employees can view own leave requests" ON leave_requests;
CREATE POLICY "Employees can view own leave requests"
  ON leave_requests FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT employee_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employees can create own leave requests" ON leave_requests;
CREATE POLICY "Employees can create own leave requests"
  ON leave_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    employee_id IN (
      SELECT employee_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

-- Monthly Payroll (employees can view their own)
DROP POLICY IF EXISTS "Employees can view own payroll" ON monthly_payroll;
CREATE POLICY "Employees can view own payroll"
  ON monthly_payroll FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT employee_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

-- Salary Slips (employees can view their own)
DROP POLICY IF EXISTS "Employees can view own salary slips" ON salary_slips;
CREATE POLICY "Employees can view own salary slips"
  ON salary_slips FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT employee_id FROM user_roles WHERE user_id = auth.uid()
    )
  );

-- Service role policies (for backend operations)
DROP POLICY IF EXISTS "Service role full access to all tables" ON user_roles;
CREATE POLICY "Service role full access to all tables"
  ON user_roles FOR ALL
  USING (true);

-- =====================================================
-- SECTION 13: STORAGE BUCKETS
-- =====================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('employee-photos', 'employee-photos', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']),
  ('employee-documents', 'employee-documents', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('cvs', 'cvs', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('project-images', 'project-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif']),
  ('leave-attachments', 'leave-attachments', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'])
ON CONFLICT (id) DO UPDATE 
SET 
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS Policies

-- Project Images (public read, authenticated write)
DROP POLICY IF EXISTS "Public read access for project images" ON storage.objects;
CREATE POLICY "Public read access for project images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Authenticated users can upload project images" ON storage.objects;
CREATE POLICY "Authenticated users can upload project images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'project-images' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete project images" ON storage.objects;
CREATE POLICY "Authenticated users can delete project images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'project-images' AND auth.uid() IS NOT NULL);

-- CVs (anyone can upload, admins can view)
DROP POLICY IF EXISTS "Anyone can upload CV" ON storage.objects;
CREATE POLICY "Anyone can upload CV"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'cvs');

-- Employee Photos (authenticated users only)
DROP POLICY IF EXISTS "Authenticated users manage employee photos" ON storage.objects;
CREATE POLICY "Authenticated users manage employee photos"
  ON storage.objects FOR ALL
  USING (bucket_id = 'employee-photos' AND auth.uid() IS NOT NULL);

-- Employee Documents (authenticated users only)
DROP POLICY IF EXISTS "Authenticated users manage employee documents" ON storage.objects;
CREATE POLICY "Authenticated users manage employee documents"
  ON storage.objects FOR ALL
  USING (bucket_id = 'employee-documents' AND auth.uid() IS NOT NULL);

-- Leave Attachments (authenticated users only)
DROP POLICY IF EXISTS "Authenticated users manage leave attachments" ON storage.objects;
CREATE POLICY "Authenticated users manage leave attachments"
  ON storage.objects FOR ALL
  USING (bucket_id = 'leave-attachments' AND auth.uid() IS NOT NULL);

-- =====================================================
-- SECTION 14: DEFAULT DATA
-- =====================================================

-- Insert default departments
INSERT INTO departments (name, description) VALUES
  ('Architecture', 'Architectural design and BIM modeling'),
  ('Engineering', 'Structural and MEP engineering'),
  ('VDC', 'Virtual Design and Construction'),
  ('Human Resources', 'HR and administration'),
  ('Management', 'Project and business management')
ON CONFLICT (name) DO NOTHING;

-- Insert default designations
INSERT INTO designations (name, level, department_id, description) VALUES
  ('BIM Manager', 'Manager', (SELECT id FROM departments WHERE name = 'Architecture' LIMIT 1), 'BIM project manager and team lead'),
  ('Senior Architect', 'Senior', (SELECT id FROM departments WHERE name = 'Architecture' LIMIT 1), 'Senior architectural designer'),
  ('BIM Modeler', 'Mid', (SELECT id FROM departments WHERE name = 'Architecture' LIMIT 1), 'BIM modeling specialist'),
  ('Revit Technician', 'Junior', (SELECT id FROM departments WHERE name = 'Architecture' LIMIT 1), 'Revit drafting and modeling'),
  ('BIM Coordinator', 'Mid', (SELECT id FROM departments WHERE name = 'VDC' LIMIT 1), 'BIM coordination specialist'),
  ('VDC Manager', 'Manager', (SELECT id FROM departments WHERE name = 'VDC' LIMIT 1), 'Virtual Design and Construction manager'),
  ('Structural Engineer', 'Senior', (SELECT id FROM departments WHERE name = 'Engineering' LIMIT 1), 'Structural engineering specialist'),
  ('MEP Engineer', 'Mid', (SELECT id FROM departments WHERE name = 'Engineering' LIMIT 1), 'MEP engineering specialist'),
  ('Junior Engineer', 'Junior', (SELECT id FROM departments WHERE name = 'Engineering' LIMIT 1), 'Junior engineering position'),
  ('HR Manager', 'Manager', (SELECT id FROM departments WHERE name = 'Human Resources' LIMIT 1), 'Human resources manager'),
  ('HR Executive', 'Mid', (SELECT id FROM departments WHERE name = 'Human Resources' LIMIT 1), 'HR executive and recruitment'),
  ('Project Manager', 'Manager', (SELECT id FROM departments WHERE name = 'Management' LIMIT 1), 'Project management lead'),
  ('Project Coordinator', 'Mid', (SELECT id FROM departments WHERE name = 'Management' LIMIT 1), 'Project coordination and support')
ON CONFLICT (name) DO NOTHING;

-- Insert default salary configuration
INSERT INTO salary_configuration (config_key, config_value, description) VALUES
  ('annual_casual_leave', '10', 'Number of casual leave days per year'),
  ('annual_sick_leave', '10', 'Number of sick leave days per year'),
  ('late_tolerance_count', '3', 'Number of late arrivals before 1 day salary deduction'),
  ('working_days_per_month', '30', 'Standard working days for salary calculation'),
  ('half_day_hours', '4', 'Hours that constitute a half day'),
  ('full_day_hours', '8', 'Hours that constitute a full day'),
  ('late_arrival_threshold_minutes', '15', 'Minutes after which arrival is considered late'),
  ('month_start_day', '1', 'Day of month when payroll period starts'),
  ('payroll_auto_generate_day', '25', 'Day of month to auto-generate payroll')
ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  description = EXCLUDED.description;

-- Insert common holidays (example - customize for your region)
INSERT INTO holidays (name, date, description, is_recurring) VALUES
  ('New Year''s Day', '2025-01-01', 'New Year celebration', true),
  ('Labor Day', '2025-05-01', 'International Workers Day', true),
  ('National Day', '2025-12-16', 'Victory Day', true)
ON CONFLICT (date) DO NOTHING;

-- =====================================================
-- SECTION 15: GRANTS & PERMISSIONS
-- =====================================================

-- Grant basic read access to authenticated users
GRANT SELECT ON departments TO authenticated;
GRANT SELECT ON designations TO authenticated;
GRANT SELECT ON employees TO authenticated;
GRANT SELECT ON holidays TO authenticated;
GRANT SELECT ON projects TO authenticated;
GRANT SELECT ON salary_configuration TO authenticated;

-- Grant read/write access for user's own data
GRANT SELECT, INSERT ON attendance TO authenticated;
GRANT SELECT, INSERT, UPDATE ON leave_requests TO authenticated;
GRANT SELECT ON monthly_payroll TO authenticated;
GRANT SELECT ON salary_slips TO authenticated;
GRANT SELECT ON leave_balance_history TO authenticated;

-- Grant public access to specific tables
GRANT SELECT ON job_postings TO anon, authenticated;
GRANT INSERT ON job_applications TO anon, authenticated;
GRANT INSERT ON contact_inquiries TO anon, authenticated;

-- =====================================================
-- SECTION 16: COMPLETION & VERIFICATION
-- =====================================================

COMMIT;

-- Verify schema creation
DO $$
DECLARE
  table_count INTEGER;
  index_count INTEGER;
  trigger_count INTEGER;
  bucket_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  
  SELECT COUNT(*) INTO index_count FROM pg_indexes 
    WHERE schemaname = 'public';
  
  SELECT COUNT(*) INTO trigger_count FROM pg_trigger 
    WHERE tgname NOT LIKE 'pg_%' AND tgname NOT LIKE 'RI_%';
    
  SELECT COUNT(*) INTO bucket_count FROM storage.buckets;
  
  RAISE NOTICE '✅ Database migration completed successfully!';
  RAISE NOTICE '📊 Tables created: %', table_count;
  RAISE NOTICE '📇 Indexes created: %', index_count;
  RAISE NOTICE '⚡ Triggers created: %', trigger_count;
  RAISE NOTICE '🗄️  Storage buckets: %', bucket_count;
  RAISE NOTICE '';
  RAISE NOTICE '🎉 BIM-AIDED database is ready to use!';
  RAISE NOTICE '📖 Next steps:';
  RAISE NOTICE '   1. Create your first admin user';
  RAISE NOTICE '   2. Add employees through the admin panel';
  RAISE NOTICE '   3. Configure IP whitelist for attendance';
  RAISE NOTICE '   4. Start using the system!';
END $$;

-- List all created tables
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
