// API Service Layer for Supabase operations
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Type aliases for cleaner code
type Tables = Database['public']['Tables'];
type Employee = Tables['employees']['Row'];
type EmployeeInsert = Tables['employees']['Insert'];
type Project = Tables['projects']['Row'];
type ProjectInsert = Tables['projects']['Insert'];
type ProjectAssignment = Tables['project_assignments']['Row'];
type ProjectAssignmentInsert = Tables['project_assignments']['Insert'];
type Attendance = Tables['attendance']['Row'];
type AttendanceInsert = Tables['attendance']['Insert'];
type LeaveBalance = Tables['leave_balances']['Row'];
type CareerPosting = Tables['career_postings']['Row'];
type ContactInquiry = Tables['contact_inquiries']['Row'];

// Generic error handler
const handleError = (error: any, operation: string): never => {
  console.error(`${operation} error:`, error);
  throw new Error(error.message || `Failed to ${operation}`);
};

// Authentication Services
export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) handleError(error, 'sign in');
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) handleError(error, 'sign out');
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) handleError(error, 'get session');
    return data.session;
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) handleError(error, 'get user');
    return data.user;
  },
};

// Employee Services
export const employeeService = {
  async getAll() {
    const { data, error } = await supabase
      .from('employees')
      .select('*, departments(name)')
      .order('created_at', { ascending: false });
    if (error) handleError(error, 'fetch employees');
    return data as Employee[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*, departments(name)')
      .eq('id', id)
      .single();
    if (error) handleError(error, 'fetch employee');
    return data as Employee;
  },

  async getByAuthUserId(authUserId: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*, departments(name)')
      .eq('auth_user_id', authUserId)
      .single();
    if (error) handleError(error, 'fetch employee profile');
    return data as Employee;
  },

  async create(employee: EmployeeInsert) {
    const { data, error} = await supabase
      .from('employees')
      .insert(employee)
      .select()
      .single();
    if (error) handleError(error, 'create employee');
    return data as Employee;
  },

  async update(id: string, updates: Partial<Employee>) {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) handleError(error, 'update employee');
    return data as Employee;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    if (error) handleError(error, 'delete employee');
  },
};

// Project Services
export const projectService = {
  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) handleError(error, 'fetch projects');
    return data as Project[];
  },

  async getPublished() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    if (error) handleError(error, 'fetch published projects');
    return data as Project[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    if (error) handleError(error, 'fetch project');
    return data as Project;
  },

  async create(project: ProjectInsert) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    if (error) handleError(error, 'create project');
    return data as Project;
  },

  async update(id: string, updates: Partial<Project>) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) handleError(error, 'update project');
    return data as Project;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    if (error) handleError(error, 'delete project');
  },
};

// Attendance Services
export const attendanceService = {
  async checkIn(employeeId: string) {
    const { data, error } = await supabase
      .from('attendance')
      .insert({
        employee_id: employeeId,
        check_in_time: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        status: 'Present',
      })
      .select()
      .single();
    if (error) handleError(error, 'check in');
    return data as Attendance;
  },

  async checkOut(id: string) {
    const { data, error } = await supabase
      .from('attendance')
      .update({ check_out_time: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) handleError(error, 'check out');
    return data as Attendance;
  },

  async getByEmployeeId(employeeId: string) {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .order('date', { ascending: false });
    if (error) handleError(error, 'fetch attendance');
    return data as Attendance[];
  },

  async getTodayAttendance(employeeId: string) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('date', today)
      .maybeSingle();
    if (error) handleError(error, 'fetch today attendance');
    return data as Attendance | null;
  },
};

// Export all services
export const api = {
  auth: authService,
  employees: employeeService,
  projects: projectService,
  attendance: attendanceService,
};
