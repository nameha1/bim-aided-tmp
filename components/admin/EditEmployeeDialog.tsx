import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  eid: string | null;
  gender: string | null;
  date_of_birth: string | null;
  national_id: string | null;
  phone_number: string | null;
  address: string | null;
  joining_date: string;
  department_id: string | null;
  designation_id: string | null;
  supervisor_id: string | null;
  employment_status: string;
}

interface EditEmployeeDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditEmployeeDialog = ({ employee, open, onOpenChange, onSuccess }: EditEmployeeDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    eid: "",
    gender: "",
    dateOfBirth: "",
    nationalId: "",
    phone: "",
    address: "",
    joiningDate: "",
    departmentId: "",
    designationId: "",
    supervisorId: "",
    employmentStatus: "Active",
  });

  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open]);

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.first_name || "",
        lastName: employee.last_name || "",
        email: employee.email || "",
        eid: employee.eid || "",
        gender: employee.gender || "",
        dateOfBirth: employee.date_of_birth || "",
        nationalId: employee.national_id || "",
        phone: employee.phone_number || "",
        address: employee.address || "",
        joiningDate: employee.joining_date || "",
        departmentId: employee.department_id || "",
        designationId: employee.designation_id || "",
        supervisorId: employee.supervisor_id || "",
        employmentStatus: employee.employment_status || "Active",
      });
    }
  }, [employee]);

  const loadInitialData = async () => {
    try {
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
    }
  };

  const fetchDepartments = async () => {
    const { data, error } = await supabase.from("departments").select("*");
    if (error) throw error;
    setDepartments(data || []);
  };

  const fetchDesignations = async () => {
    const { data, error } = await supabase.from("designations").select("*");
    if (error) throw error;
    setDesignations(data || []);
  };

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("employees")
      .select("id, first_name, last_name, designations(name)")
      .eq("employment_status", "Active")
      .neq("id", employee?.id || ""); // Exclude current employee from supervisor list
    if (error) throw error;
    setEmployees(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employee) return;
    
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:3001/api/update-employee/${employee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          eid: formData.eid || null,
          gender: formData.gender || null,
          dateOfBirth: formData.dateOfBirth || null,
          nationalId: formData.nationalId || null,
          phoneNumber: formData.phone || null,
          address: formData.address || null,
          joiningDate: formData.joiningDate,
          departmentId: formData.departmentId || null,
          designationId: formData.designationId || null,
          supervisorId: formData.supervisorId || null,
          employmentStatus: formData.employmentStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || "Failed to update employee");
      }

      toast({
        title: "Employee updated successfully",
        description: "The employee information has been updated.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error updating employee",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>
            Update employee information. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-firstName">First Name*</Label>
              <Input
                id="edit-firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-lastName">Last Name*</Label>
              <Input
                id="edit-lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email*</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-eid">Employee ID (EID)</Label>
              <Input
                id="edit-eid"
                value={formData.eid}
                onChange={(e) => setFormData({ ...formData, eid: e.target.value })}
                placeholder="e.g., EMP001, BIM-2024-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-gender">Gender</Label>
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
              <Label htmlFor="edit-dateOfBirth">Date of Birth</Label>
              <Input
                id="edit-dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-nationalId">National ID</Label>
              <Input
                id="edit-nationalId"
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-joiningDate">Joining Date</Label>
              <Input
                id="edit-joiningDate"
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-department">Department</Label>
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
              <Label htmlFor="edit-designation">Designation</Label>
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
              <Label htmlFor="edit-supervisor">Reporting Manager</Label>
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

            <div className="space-y-2">
              <Label htmlFor="edit-employmentStatus">Employment Status</Label>
              <Select value={formData.employmentStatus} onValueChange={(value) => setFormData({ ...formData, employmentStatus: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Terminated">Terminated</SelectItem>
                  <SelectItem value="Resigned">Resigned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Updating..." : "Update Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeDialog;
