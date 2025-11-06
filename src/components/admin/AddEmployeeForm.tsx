import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddEmployeeFormProps {
  onSuccess: () => void;
}

const AddEmployeeForm = ({ onSuccess }: AddEmployeeFormProps) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    dateOfBirth: "",
    nationalId: "",
    phone: "",
    address: "",
    joiningDate: "",
    departmentId: "",
    designationId: "",
    supervisorId: "",
    password: "",
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      await Promise.all([
        fetchDepartments(),
        fetchDesignations(),
        fetchEmployees(),
      ]);
    } catch (error: any) {
      console.error("Error loading initial data:", error);
      toast({
        title: "Error loading form data",
        description: error.message || "Failed to load departments, designations, or employees",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchDepartments = async () => {
    const { data, error } = await supabase.from("departments").select("*");
    if (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
    setDepartments(data || []);
  };

  const fetchDesignations = async () => {
    const { data, error } = await supabase.from("designations").select("*");
    if (error) {
      console.error("Error fetching designations:", error);
      throw error;
    }
    setDesignations(data || []);
  };

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("employees")
      .select("id, first_name, last_name, designations(name)")
      .eq("employment_status", "Active");
    if (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }
    setEmployees(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use the custom function to create employee account (bypasses email confirmation)
      const { data, error } = await supabase.rpc('create_employee_account' as any, {
        p_email: formData.email,
        p_password: formData.password,
        p_first_name: formData.firstName,
        p_last_name: formData.lastName,
        p_gender: formData.gender || null,
        p_date_of_birth: formData.dateOfBirth || null,
        p_national_id: formData.nationalId || null,
        p_phone_number: formData.phone || null,
        p_address: formData.address || null,
        p_joining_date: formData.joiningDate || new Date().toISOString().split('T')[0],
        p_department_id: formData.departmentId || null,
        p_designation_id: formData.designationId || null,
        p_supervisor_id: formData.supervisorId || null,
      });

      console.log("RPC Response - data:", JSON.stringify(data, null, 2));
      console.log("RPC Response - error:", JSON.stringify(error, null, 2));

      if (error) {
        console.error("Error creating employee:", error);
        toast({
          title: "Error creating employee",
          description: error.message || "Failed to create employee account",
          variant: "destructive",
        });
        throw new Error(error.message || "Failed to create employee account");
      }

      // Check if the function returned an error
      const result = data as any;
      console.log("Function result:", JSON.stringify(result, null, 2));
      
      if (result && !result.success) {
        toast({
          title: "Error creating employee",
          description: result.message || result.error || "Failed to create employee account",
          variant: "destructive",
        });
        throw new Error(result.message || result.error || "Failed to create employee account");
      }

      toast({
        title: "Employee added successfully",
        description: "The employee account has been created successfully.",
      });

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        gender: "",
        dateOfBirth: "",
        nationalId: "",
        phone: "",
        address: "",
        joiningDate: "",
        departmentId: "",
        designationId: "",
        supervisorId: "",
        password: "",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error adding employee",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading form data...</p>
        </div>
      </div>
    );
  }

  // Show warning if departments or designations are missing
  if (departments.length === 0 || designations.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Setup Required</h3>
          <p className="text-yellow-700 mb-4">
            Before adding employees, you need to set up departments and designations in your database.
          </p>
          <div className="bg-white rounded p-3 text-sm">
            <p className="font-medium mb-2">Run this SQL in your Supabase SQL Editor:</p>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`-- Add Departments
INSERT INTO departments (name, description) VALUES 
  ('Architecture', 'Architectural design and BIM modeling'),
  ('Engineering', 'Structural and MEP engineering'),
  ('VDC', 'Virtual Design and Construction'),
  ('Human Resources', 'HR and administration'),
  ('Management', 'Project and business management');

-- Add Designations (get department_id from departments table)
INSERT INTO designations (name, level, department_id) VALUES 
  ('BIM Manager', 'Senior', (SELECT id FROM departments WHERE name = 'Architecture' LIMIT 1)),
  ('Senior Architect', 'Senior', (SELECT id FROM departments WHERE name = 'Architecture' LIMIT 1)),
  ('BIM Modeler', 'Mid', (SELECT id FROM departments WHERE name = 'Architecture' LIMIT 1)),
  ('Revit Technician', 'Junior', (SELECT id FROM departments WHERE name = 'Architecture' LIMIT 1));`}
            </pre>
          </div>
          <Button
            type="button"
            onClick={loadInitialData}
            className="mt-4"
          >
            Refresh After Setup
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name*</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name*</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email*</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password*</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationalId">National ID</Label>
          <Input
            id="nationalId"
            value={formData.nationalId}
            onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="joiningDate">Joining Date</Label>
          <Input
            id="joiningDate"
            type="date"
            value={formData.joiningDate}
            onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select value={formData.departmentId} onValueChange={(value) => setFormData({ ...formData, departmentId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="designation">Designation</Label>
          <Select value={formData.designationId} onValueChange={(value) => setFormData({ ...formData, designationId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select designation" />
            </SelectTrigger>
            <SelectContent>
              {designations.map((desig) => (
                <SelectItem key={desig.id} value={desig.id}>
                  {desig.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supervisor">Reporting Manager</Label>
          <Select value={formData.supervisorId} onValueChange={(value) => setFormData({ ...formData, supervisorId: value === "none" ? "" : value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select reporting manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} - {emp.designations?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Adding Employee..." : "Add Employee"}
      </Button>
    </form>
  );
};

export default AddEmployeeForm;
