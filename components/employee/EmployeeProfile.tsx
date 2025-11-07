import { Label } from "@/components/ui/label";

interface EmployeeProfileProps {
  employee: any;
}

const EmployeeProfile = ({ employee }: EmployeeProfileProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-muted-foreground">Full Name</Label>
          <p className="text-base font-medium">
            {employee.first_name} {employee.last_name}
          </p>
        </div>

        <div>
          <Label className="text-sm text-muted-foreground">Email</Label>
          <p className="text-base font-medium">{employee.email}</p>
        </div>

        <div>
          <Label className="text-sm text-muted-foreground">Department</Label>
          <p className="text-base font-medium">{employee.departments?.name || "N/A"}</p>
        </div>

        <div>
          <Label className="text-sm text-muted-foreground">Designation</Label>
          <p className="text-base font-medium">{employee.designations?.name || "N/A"}</p>
        </div>

        <div>
          <Label className="text-sm text-muted-foreground">Phone Number</Label>
          <p className="text-base font-medium">{employee.phone_number || "N/A"}</p>
        </div>

        <div>
          <Label className="text-sm text-muted-foreground">Gender</Label>
          <p className="text-base font-medium">{employee.gender || "N/A"}</p>
        </div>

        <div>
          <Label className="text-sm text-muted-foreground">Date of Birth</Label>
          <p className="text-base font-medium">
            {employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : "N/A"}
          </p>
        </div>

        <div>
          <Label className="text-sm text-muted-foreground">Joining Date</Label>
          <p className="text-base font-medium">
            {new Date(employee.joining_date).toLocaleDateString()}
          </p>
        </div>

        <div>
          <Label className="text-sm text-muted-foreground">Employment Status</Label>
          <p className="text-base font-medium">{employee.employment_status}</p>
        </div>

        <div>
          <Label className="text-sm text-muted-foreground">National ID</Label>
          <p className="text-base font-medium">{employee.national_id || "N/A"}</p>
        </div>

        <div className="md:col-span-2">
          <Label className="text-sm text-muted-foreground">Address</Label>
          <p className="text-base font-medium">{employee.address || "N/A"}</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
