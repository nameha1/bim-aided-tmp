import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDocuments, createDocument, orderBy } from "@/lib/firebase";
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
    password: "",
    basicSalary: "",
    bankName: "",
    bankAccountNumber: "",
    bankBranch: "",
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
    try {
      const { data, error } = await getDocuments("departments", [orderBy("name", "asc")]);
      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
  };

  const fetchDesignations = async () => {
    try {
      const { data, error } = await getDocuments("designations", [orderBy("title", "asc")]);
      if (error) throw error;
      setDesignations(data || []);
    } catch (error) {
      console.error("Error fetching designations:", error);
      throw error;
    }
  };

  const fetchEmployees = async () => {
    try {
      // Fetch all employees without ordering to avoid index requirement
      const { data, error } = await getDocuments("employees");
      if (error) throw error;
      // Filter active employees and sort in JavaScript
      const activeEmployees = (data || [])
        .filter((emp: any) => emp.status === "active")
        .sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
      setEmployees(activeEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // No longer need session for this, the new API route is self-contained
      // const { data: { session } } = await supabase.auth.getSession();
      
      // if (!session) {
      //   throw new Error('No active session. Please login again.');
      // }

      // Call the new relative API endpoint to create employee
      const response = await fetch(`/api/create-employee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization is no longer needed as the API route uses the admin client
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          eid: formData.eid || null,
          gender: formData.gender || null,
          dateOfBirth: formData.dateOfBirth || null,
          nationalId: formData.nationalId || null,
          phoneNumber: formData.phone || null,
          address: formData.address || null,
          joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0],
          departmentId: formData.departmentId || null,
          designationId: formData.designationId || null,
          supervisorId: formData.supervisorId || null,
          basicSalary: formData.basicSalary || null,
          bankName: formData.bankName || null,
          bankAccountNumber: formData.bankAccountNumber || null,
          bankBranch: formData.bankBranch || null,
        }),
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (!response.ok || !result.success) {
        console.error("Error creating employee:", result);
        throw new Error(result.error || 'Failed to create employee');
      }

      toast({
        title: "Employee added successfully",
        description: `${formData.firstName} ${formData.lastName} has been added to the system.`,
      });

      setFormData({
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
        password: "",
        basicSalary: "",
        bankName: "",
        bankAccountNumber: "",
        bankBranch: "",
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error adding employee",
        description: error.message || "An unexpected error occurred",
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
            Departments or designations are missing. Please run the setup script.
          </p>
          <div className="bg-white rounded p-3 text-sm">
            <p className="font-medium mb-2">Run this command in your terminal:</p>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">npm run setup-firestore</pre>
            <p className="text-sm text-gray-600 mt-2">
              This will create all necessary Firestore collections with sample data.
            </p>
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
          <Label htmlFor="eid">Employee ID (EID)</Label>
          <Input
            id="eid"
            value={formData.eid}
            onChange={(e) => setFormData({ ...formData, eid: e.target.value })}
            placeholder="e.g., EMP001, BIM-2024-001"
          />
          <p className="text-xs text-muted-foreground">
            Unique identifier for employee login. Employee can use EID or email to login.
          </p>
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
                  {desig.title}
                  {desig.level && ` (${desig.level})`}
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
                  {emp.name} - {emp.designation}
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

        <div className="space-y-2">
          <Label htmlFor="basicSalary">
            Basic Salary <span className="text-red-500">*</span>
          </Label>
          <Input
            id="basicSalary"
            type="number"
            value={formData.basicSalary}
            onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bankName">Bank Name</Label>
          <Input
            id="bankName"
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
          <Input
            id="bankAccountNumber"
            value={formData.bankAccountNumber}
            onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bankBranch">Bank Branch</Label>
          <Input
            id="bankBranch"
            value={formData.bankBranch}
            onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
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
