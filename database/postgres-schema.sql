-- BIMaided Database Schema for PostgreSQL
-- Run this after setting up PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users/Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee', -- 'admin', 'employee'
    designation VARCHAR(255),
    department VARCHAR(255),
    phone VARCHAR(50),
    hire_date DATE,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    client VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'residential', 'commercial', 'industrial', etc.
    location VARCHAR(255),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'planning', -- 'planning', 'in_progress', 'completed', 'on_hold'
    budget DECIMAL(15, 2),
    image_url TEXT,
    gallery_image_1 TEXT,
    gallery_image_2 TEXT,
    gallery_image_3 TEXT,
    gallery_image_4 TEXT,
    gallery_image_5 TEXT,
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Assignments (Many-to-Many between Employees and Projects)
CREATE TABLE IF NOT EXISTS project_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    role VARCHAR(255), -- 'Project Manager', 'Engineer', 'Designer', etc.
    assigned_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, employee_id)
);

-- Transactions/Expenses Table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'expense', 'income', 'salary'
    category VARCHAR(100), -- 'materials', 'labor', 'equipment', etc.
    date DATE DEFAULT CURRENT_DATE,
    payment_method VARCHAR(100), -- 'cash', 'bank_transfer', 'check', etc.
    receipt_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    tax DECIMAL(15, 2) DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'cancelled'
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    paid_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job Applications Table (for career page)
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    resume_url TEXT,
    cover_letter TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'reviewing', 'interviewed', 'accepted', 'rejected'
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_client ON projects(client);
CREATE INDEX idx_project_assignments_project ON project_assignments(project_id);
CREATE INDEX idx_project_assignments_employee ON project_assignments(employee_id);
CREATE INDEX idx_transactions_project ON transactions(project_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_invoices_project ON invoices(project_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create default admin user (password: admin123 - CHANGE THIS!)
-- Password hash is bcrypt of 'admin123'
INSERT INTO employees (email, password_hash, full_name, role, designation, status)
VALUES (
    'admin@bimaided.com',
    '$2a$10$rKZJkJkjKJKjkJKjkJKjk.KjkJKjkJKjkJKjkJKjkJKjkJKjkJKjk', -- You'll need to generate this
    'System Administrator',
    'admin',
    'System Administrator',
    'active'
)
ON CONFLICT (email) DO NOTHING;

-- Sample project (optional)
INSERT INTO projects (name, client, description, category, location, status, published)
VALUES (
    'Sample BIM Project',
    'Sample Client',
    'This is a sample project to demonstrate the system',
    'commercial',
    'Dhaka, Bangladesh',
    'in_progress',
    true
)
ON CONFLICT DO NOTHING;
