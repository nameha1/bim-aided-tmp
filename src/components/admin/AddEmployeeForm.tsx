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
    fetchDepartments();
    fetchDesignations();
    fetchEmployees();
  }, []);

  const fetchDepartments = async () => {
    const { data } = await supabase.from("departments").select("*");
    setDepartments(data || []);
  };

  const fetchDesignations = async () => {
    const { data } = await supabase.from("designations").select("*");
    setDesignations(data || []);
  };

  const fetchEmployees = async () => {
    const { data } = await supabase
      .from("employees")
      .select("id, first_name, last_name, designations(name)")
      .eq("employment_status", "Active");
    setEmployees(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (authError) throw authError;

      if (!authData.user) throw new Error("Failed to create user");

      // Create employee record
      const { error: employeeError } = await supabase.from("employees").insert({
        user_id: authData.user.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        gender: formData.gender as any,
        date_of_birth: formData.dateOfBirth || null,
        national_id: formData.nationalId || null,
        phone_number: formData.phone || null,
        address: formData.address || null,
        joining_date: formData.joiningDate || new Date().toISOString().split("T")[0],
        department_id: formData.departmentId || null,
        designation_id: formData.designationId || null,
        supervisor_id: formData.supervisorId || null,
      } as any);

      if (employeeError) throw employeeError;

      // Assign Employee role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: authData.user.id,
        role: "Employee",
      });

      if (roleError) throw roleError;

      // Create leave balance for current year
      const { data: employeeData } = await supabase
        .from("employees")
        .select("id")
        .eq("user_id", authData.user.id)
        .single();

      if (employeeData) {
        await supabase.from("leave_balances").insert({
          employee_id: employeeData.id,
          year: new Date().getFullYear(),
          annual_leave_total: 20,
          annual_leave_used: 0,
          sick_leave_total: 10,
          sick_leave_used: 0,
          casual_leave_total: 10,
          casual_leave_used: 0,
        });
      }

      toast({
        title: "Employee added successfully",
        description: "The employee account has been created and credentials sent.",
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
          <Select value={formData.supervisorId} onValueChange={(value) => setFormData({ ...formData, supervisorId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select reporting manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
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
