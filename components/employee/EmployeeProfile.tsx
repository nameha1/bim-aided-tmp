import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User } from "lucide-react";

interface EmployeeProfileProps {
  employee: any;
}

const EmployeeProfile = ({ employee }: EmployeeProfileProps) => {
  return (
    <div className="space-y-8">
      {/* Profile Picture Section */}
      <div className="flex justify-center">
        {employee.profileImageUrl ? (
          <img 
            src={employee.profileImageUrl} 
            alt={`${employee.firstName || employee.first_name} ${employee.lastName || employee.last_name}`}
            className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
            <User size={64} className="text-primary" />
          </div>
        )}
      </div>

      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <Separator className="mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-muted-foreground">Employee ID</Label>
            <p className="text-base font-medium">{employee.eid || "N/A"}</p>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Full Name</Label>
            <p className="text-base font-medium">
              {employee.firstName || employee.first_name} {employee.lastName || employee.last_name}
            </p>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Email</Label>
            <p className="text-base font-medium">{employee.email || "N/A"}</p>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Phone Number</Label>
            <p className="text-base font-medium">{employee.phone || employee.phone_number || "N/A"}</p>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Gender</Label>
            <p className="text-base font-medium">{employee.gender || "N/A"}</p>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Date of Birth</Label>
            <p className="text-base font-medium">
              {employee.dateOfBirth || employee.date_of_birth ? new Date(employee.dateOfBirth || employee.date_of_birth).toLocaleDateString() : "N/A"}
            </p>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">National ID</Label>
            <p className="text-base font-medium">{employee.nationalId || employee.national_id || "N/A"}</p>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">TIN</Label>
            <p className="text-base font-medium">{employee.tin || "N/A"}</p>
          </div>

          <div className="md:col-span-2">
            <Label className="text-sm text-muted-foreground">Address</Label>
            <p className="text-base font-medium">{employee.address || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Employment Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Employment Information</h3>
        <Separator className="mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-muted-foreground">Department</Label>
            <p className="text-base font-medium">{employee.department || employee.departments?.name || "N/A"}</p>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Sub-Department</Label>
            <p className="text-base font-medium">{employee.subDepartment || employee.sub_department || "N/A"}</p>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Designation</Label>
            <p className="text-base font-medium">{employee.designation || employee.designations?.name || "N/A"}</p>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Joining Date</Label>
            <p className="text-base font-medium">
              {employee.joiningDate || employee.hire_date || employee.joining_date ? new Date(employee.joiningDate || employee.hire_date || employee.joining_date).toLocaleDateString() : "N/A"}
            </p>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Employment Status</Label>
            <p className="text-base font-medium">{employee.status || employee.employment_status || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Financial Information - Only show if employee has permission */}
      {(employee.can_view_financials || employee.canViewFinancials) && (
        <>
          {/* Employment Salary */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
            <Separator className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Gross Salary</Label>
                <p className="text-base font-medium">
                  {employee.grossSalary || employee.gross_salary ? `৳${Number(employee.grossSalary || employee.gross_salary).toLocaleString()}` : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Bank Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Bank Information</h3>
            <Separator className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Bank Name</Label>
                <p className="text-base font-medium">{employee.bankName || employee.bank_name || "N/A"}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Account Number</Label>
                <p className="text-base font-medium">{employee.bankAccountNumber || employee.bank_account_number || "N/A"}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Branch</Label>
                <p className="text-base font-medium">{employee.bankBranch || employee.bank_branch || "N/A"}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Routing Number</Label>
                <p className="text-base font-medium">{employee.bankRoutingNumber || employee.bank_routing_number || "N/A"}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Emergency Contact */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
        <Separator className="mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-muted-foreground">Contact Person Name</Label>
            <p className="text-base font-medium">{employee.emergencyPersonName || employee.emergency_person_name || "N/A"}</p>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Contact Number</Label>
            <p className="text-base font-medium">{employee.emergencyPersonContact || employee.emergency_person_contact || "N/A"}</p>
          </div>

          <div className="md:col-span-2">
            <Label className="text-sm text-muted-foreground">Contact Address</Label>
            <p className="text-base font-medium">{employee.emergencyPersonAddress || employee.emergency_person_address || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Documents */}
      {(employee.documentUrls && employee.documentUrls.length > 0) && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Documents</h3>
          <Separator className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {employee.documentUrls.map((doc: any, index: number) => (
              <div key={index}>
                <Label className="text-sm text-muted-foreground">Document {index + 1}</Label>
                <a 
                  href={doc.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-base font-medium text-primary hover:underline"
                >
                  View Document
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeProfile;
