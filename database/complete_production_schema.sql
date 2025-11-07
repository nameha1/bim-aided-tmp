-- Complete Database Schema Export for Production Deployment
-- This contains all tables, functions, policies, and data needed for the BIM Portal

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE user_role AS ENUM ('admin', 'employee');

-- =============================================
-- CORE TABLES
-- =============================================

-- User Roles Table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Designations Table
CREATE TABLE IF NOT EXISTS designations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    designation_id UUID REFERENCES designations(id) ON DELETE SET NULL,
    hire_date DATE,
    salary DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    user_id UUID UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    image_url TEXT,
    preview_image TEXT,
    gallery_image_1 TEXT,
    gallery_image_2 TEXT,
    gallery_image_3 TEXT,
    gallery_image_4 TEXT,
    gallery_image_5 TEXT,
    client_name VARCHAR(255),
    completion_date VARCHAR(50),
    lod VARCHAR(50),
    location VARCHAR(255),
    scope TEXT,
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Assignments Table (for portfolio projects)
CREATE TABLE IF NOT EXISTS project_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    role VARCHAR(100),
    assigned_date DATE DEFAULT CURRENT_DATE,
    completion_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, employee_id)
);

-- Assignments Table (for internal tasks)
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    assigned_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignment Members Table
CREATE TABLE IF NOT EXISTS assignment_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    role VARCHAR(100) DEFAULT 'member',
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(assignment_id, employee_id)
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    break_start_time TIMESTAMPTZ,
    break_end_time TIMESTAMPTZ,
    total_hours DECIMAL(4,2),
    status VARCHAR(50) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'half_day', 'late', 'leave')),
    leave_type VARCHAR(50) CHECK (leave_type IN ('sick', 'casual', 'annual', 'maternity', 'paternity', 'emergency')),
    reason TEXT,
    approved_by UUID REFERENCES employees(id),
    supervisor_approved_by UUID REFERENCES employees(id),
    admin_approved_by UUID REFERENCES employees(id),
    approval_status VARCHAR(50) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'supervisor_approved', 'admin_approved', 'rejected')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, date)
);

-- Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    experience VARCHAR(50) NOT NULL,
    resume_url TEXT,
    cover_letter TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    job_posting_id UUID,
    applicant_name VARCHAR(255),
    applicant_email VARCHAR(255),
    applicant_phone VARCHAR(50),
    cv_url TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'shortlisted', 'rejected', 'hired')),
    notes TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES employees(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- VIEWS
-- =============================================

-- Assignment Details View
CREATE OR REPLACE VIEW assignment_details AS
SELECT 
    a.id,
    a.title,
    a.description,
    a.priority,
    a.status,
    a.due_date,
    a.created_at,
    a.updated_at,
    ab.first_name as assigned_by_first_name,
    ab.last_name as assigned_by_last_name,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'employee_id', am.employee_id,
                'first_name', e.first_name,
                'last_name', e.last_name,
                'email', e.email,
                'role', am.role,
                'assigned_at', am.assigned_at,
                'completed_at', am.completed_at
            )
        ) FILTER (WHERE am.employee_id IS NOT NULL),
        '[]'::json
    ) as members
FROM assignments a
LEFT JOIN employees ab ON a.assigned_by = ab.id
LEFT JOIN assignment_members am ON a.id = am.assignment_id
LEFT JOIN employees e ON am.employee_id = e.id
GROUP BY a.id, ab.first_name, ab.last_name;

-- =============================================
-- INDEXES
-- =============================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_designation ON employees(designation_id);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_priority ON assignments(priority);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON job_applications(applied_at DESC);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Employee account creation function
CREATE OR REPLACE FUNCTION create_employee_account(
    p_employee_id VARCHAR(50),
    p_first_name VARCHAR(255),
    p_last_name VARCHAR(255),
    p_email VARCHAR(255),
    p_phone VARCHAR(50) DEFAULT NULL,
    p_department_id UUID DEFAULT NULL,
    p_designation_id UUID DEFAULT NULL,
    p_hire_date DATE DEFAULT CURRENT_DATE,
    p_salary DECIMAL(10,2) DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_employee_uuid UUID;
    v_temp_password VARCHAR(12);
    v_result JSON;
BEGIN
    -- Generate temporary password
    v_temp_password := SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 12);
    
    -- Insert employee
    INSERT INTO employees (
        employee_id, first_name, last_name, email, phone,
        department_id, designation_id, hire_date, salary
    ) VALUES (
        p_employee_id, p_first_name, p_last_name, p_email, p_phone,
        p_department_id, p_designation_id, p_hire_date, p_salary
    ) RETURNING id INTO v_employee_uuid;
    
    -- Return result
    SELECT JSON_BUILD_OBJECT(
        'success', true,
        'employee_id', v_employee_uuid,
        'temp_password', v_temp_password,
        'message', 'Employee account created successfully'
    ) INTO v_result;
    
    RETURN v_result;
EXCEPTION
    WHEN unique_violation THEN
        RETURN JSON_BUILD_OBJECT(
            'success', false,
            'message', 'Employee ID or email already exists'
        );
    WHEN OTHERS THEN
        RETURN JSON_BUILD_OBJECT(
            'success', false,
            'message', SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS
-- =============================================

-- Updated at triggers
DROP TRIGGER IF EXISTS trigger_update_user_roles_updated_at ON user_roles;
CREATE TRIGGER trigger_update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_departments_updated_at ON departments;
CREATE TRIGGER trigger_update_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_designations_updated_at ON designations;
CREATE TRIGGER trigger_update_designations_updated_at
    BEFORE UPDATE ON designations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_employees_updated_at ON employees;
CREATE TRIGGER trigger_update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_projects_updated_at ON projects;
CREATE TRIGGER trigger_update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_assignments_updated_at ON assignments;
CREATE TRIGGER trigger_update_assignments_updated_at
    BEFORE UPDATE ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_attendance_updated_at ON attendance;
CREATE TRIGGER trigger_update_attendance_updated_at
    BEFORE UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_job_applications_updated_at ON job_applications;
CREATE TRIGGER trigger_update_job_applications_updated_at
    BEFORE UPDATE ON job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- User Roles Policies
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
CREATE POLICY "Admins can manage user roles" ON user_roles
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Departments Policies
DROP POLICY IF EXISTS "Everyone can view departments" ON departments;
CREATE POLICY "Everyone can view departments" ON departments
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage departments" ON departments;
CREATE POLICY "Admins can manage departments" ON departments
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
        )
    );

-- Designations Policies
DROP POLICY IF EXISTS "Everyone can view designations" ON designations;
CREATE POLICY "Everyone can view designations" ON designations
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage designations" ON designations;
CREATE POLICY "Admins can manage designations" ON designations
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
        )
    );

-- Employees Policies
DROP POLICY IF EXISTS "Admins can manage all employees" ON employees;
CREATE POLICY "Admins can manage all employees" ON employees
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Employees can view their own data" ON employees;
CREATE POLICY "Employees can view their own data" ON employees
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Projects Policies
DROP POLICY IF EXISTS "Published projects are viewable by all" ON projects;
CREATE POLICY "Published projects are viewable by all" ON projects
    FOR SELECT TO authenticated
    USING (published = true);

DROP POLICY IF EXISTS "Admins can manage projects" ON projects;
CREATE POLICY "Admins can manage projects" ON projects
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
        )
    );

-- Assignments Policies
DROP POLICY IF EXISTS "Users can view assignments they're part of" ON assignments;
CREATE POLICY "Users can view assignments they're part of" ON assignments
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
        ) OR
        EXISTS (
            SELECT 1 FROM assignment_members am
            JOIN employees e ON am.employee_id = e.id
            WHERE am.assignment_id = assignments.id AND e.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can manage assignments" ON assignments;
CREATE POLICY "Admins can manage assignments" ON assignments
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
        )
    );

-- Assignment Members Policies
DROP POLICY IF EXISTS "Users can view assignment members for their assignments" ON assignment_members;
CREATE POLICY "Users can view assignment members for their assignments" ON assignment_members
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
        ) OR
        EXISTS (
            SELECT 1 FROM employees e
            WHERE e.id = assignment_members.employee_id AND e.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can manage assignment members" ON assignment_members;
CREATE POLICY "Admins can manage assignment members" ON assignment_members
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
        )
    );

-- Attendance Policies
DROP POLICY IF EXISTS "Employees can manage their own attendance" ON attendance;
CREATE POLICY "Employees can manage their own attendance" ON attendance
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE employees.id = attendance.employee_id AND employees.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
        )
    );

-- Job Applications Policies
DROP POLICY IF EXISTS "Anyone can submit job applications" ON job_applications;
CREATE POLICY "Anyone can submit job applications" ON job_applications
    FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all applications" ON job_applications;
CREATE POLICY "Admins can view all applications" ON job_applications
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update applications" ON job_applications;
CREATE POLICY "Admins can update applications" ON job_applications
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
        )
    );

-- =============================================
-- STORAGE POLICIES (For Supabase Storage)
-- =============================================

-- Project Images Storage Policies
DROP POLICY IF EXISTS "Public can view project images" ON storage.objects;
CREATE POLICY "Public can view project images" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Authenticated users can upload project images" ON storage.objects;
CREATE POLICY "Authenticated users can upload project images" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Authenticated users can update project images" ON storage.objects;
CREATE POLICY "Authenticated users can update project images" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Authenticated users can delete project images" ON storage.objects;
CREATE POLICY "Authenticated users can delete project images" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'project-images');

-- CVs Storage Policies
DROP POLICY IF EXISTS "Anyone can upload CVs" ON storage.objects;
CREATE POLICY "Anyone can upload CVs" ON storage.objects
    FOR INSERT TO public
    WITH CHECK (bucket_id = 'cvs');

DROP POLICY IF EXISTS "Admins can view CVs" ON storage.objects;
CREATE POLICY "Admins can view CVs" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'cvs' AND
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can delete CVs" ON storage.objects;
CREATE POLICY "Admins can delete CVs" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'cvs' AND
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
        )
    );

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Insert sample departments
INSERT INTO departments (id, name, description) VALUES
    (uuid_generate_v4(), 'Engineering', 'BIM Engineering and Modeling'),
    (uuid_generate_v4(), 'Architecture', 'Architectural Design and Planning'),
    (uuid_generate_v4(), 'Project Management', 'Project Coordination and Management'),
    (uuid_generate_v4(), 'Quality Assurance', 'Quality Control and Testing')
ON CONFLICT (name) DO NOTHING;

-- Insert sample designations
INSERT INTO designations (name, description) VALUES
    ('BIM Manager', 'Manages BIM processes and standards'),
    ('BIM Coordinator', 'Coordinates BIM activities across disciplines'),
    ('BIM Modeler', 'Creates and maintains BIM models'),
    ('Project Manager', 'Manages project delivery and client relationships'),
    ('Senior Architect', 'Senior level architectural design'),
    ('Architect', 'Architectural design and documentation'),
    ('QA Engineer', 'Quality assurance and testing')
ON CONFLICT (name) DO NOTHING;

-- Verify installation
SELECT 'Database schema created successfully!' as message;
SELECT COUNT(*) as total_tables FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';