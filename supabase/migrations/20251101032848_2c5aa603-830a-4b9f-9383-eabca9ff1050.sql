-- Create enum for project categories
CREATE TYPE project_category AS ENUM (
  'Commercial',
  'Education & Healthcare',
  'Cultural & Sports',
  'Residential',
  'Infrastructure & Municipal',
  'Industrial & Park'
);

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category project_category NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  client_name TEXT,
  completion_date DATE,
  project_value DECIMAL(15, 2),
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create career postings table
CREATE TABLE career_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  location TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  responsibilities TEXT,
  published BOOLEAN DEFAULT true,
  posted_date DATE DEFAULT CURRENT_DATE,
  closing_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add supervisor approval fields to attendance table
ALTER TABLE attendance ADD COLUMN supervisor_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE attendance ADD COLUMN supervisor_approved_at TIMESTAMPTZ;
ALTER TABLE attendance ADD COLUMN supervisor_approved_by UUID REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE attendance ADD COLUMN admin_approved_at TIMESTAMPTZ;
ALTER TABLE attendance ADD COLUMN admin_approved_by UUID REFERENCES employees(id) ON DELETE SET NULL;

-- Rename leave_approved to track final approval
ALTER TABLE attendance RENAME COLUMN leave_approved TO admin_approved;

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_postings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Anyone can view published projects"
  ON projects FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can manage all projects"
  ON projects FOR ALL
  USING (public.has_role(auth.uid(), 'Admin'));

-- RLS Policies for career_postings
CREATE POLICY "Anyone can view published career postings"
  ON career_postings FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can manage all career postings"
  ON career_postings FOR ALL
  USING (public.has_role(auth.uid(), 'Admin'));

-- Add triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_career_postings_updated_at BEFORE UPDATE ON career_postings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();