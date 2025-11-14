import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Users, CreditCard, AlertCircle } from "lucide-react";

interface ViewEmployeeDialogProps {
  employee: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ViewEmployeeDialog = ({ employee, open, onOpenChange }: ViewEmployeeDialogProps) => {
  if (!employee) return null;

  const initials = employee.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'NA';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="flex flex-col items-center space-y-3 pb-4 border-b">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage 
                src={employee.profileImageUrl || employee.profile_picture || employee.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=3b82f6&color=fff&size=200`} 
                alt={employee.name}
              />
              <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary/80 to-primary text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">{employee.name}</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {employee.eid && (
                  <Badge variant="secondary" className="font-mono">
                    EID: {employee.eid}
                  </Badge>
                )}
                <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                  {employee.status}
                </Badge>
                {employee.roles?.includes('admin') && (
                  <Badge variant="default">Admin</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </h4>
            <Separator className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <p className="text-base font-medium">{employee.email || "N/A"}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <p className="text-base font-medium">{employee.phone || employee.phone_number || "N/A"}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Gender
                </Label>
                <p className="text-base font-medium">{employee.gender || "N/A"}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date of Birth
                </Label>
                <p className="text-base font-medium">
                  {employee.date_of_birth || employee.dateOfBirth ? new Date(employee.date_of_birth || employee.dateOfBirth).toLocaleDateString() : "N/A"}
                </p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  National ID
                </Label>
                <p className="text-base font-medium">{employee.national_id || employee.nationalId || "N/A"}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  TIN
                </Label>
                <p className="text-base font-medium">{employee.tin || "N/A"}</p>
              </div>

              <div className="md:col-span-2">
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <p className="text-base font-medium">{employee.address || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div>
            <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Employment Information
            </h4>
            <Separator className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Department
                </Label>
                <p className="text-base font-medium">{employee.department || "N/A"}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Sub-Department
                </Label>
                <p className="text-base font-medium">{employee.sub_department || employee.subDepartment || "N/A"}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Designation
                </Label>
                <p className="text-base font-medium">{employee.designation || "N/A"}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Joining Date
                </Label>
                <p className="text-base font-medium">
                  {employee.joining_date || employee.hire_date || employee.joiningDate 
                    ? new Date(employee.joining_date || employee.hire_date || employee.joiningDate).toLocaleDateString() 
                    : "N/A"}
                </p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Gross Salary</Label>
                <p className="text-base font-medium">
                  {employee.gross_salary || employee.grossSalary || employee.basicSalary 
                    ? `৳${Number(employee.gross_salary || employee.grossSalary || employee.basicSalary).toLocaleString()}` 
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Bank Information */}
          <div>
            <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Bank Information
            </h4>
            <Separator className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Bank Name</Label>
                <p className="text-base font-medium">{employee.bank_name || employee.bankName || "N/A"}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Account Number</Label>
                <p className="text-base font-medium">{employee.bank_account_number || employee.bankAccountNumber || "N/A"}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Branch</Label>
                <p className="text-base font-medium">{employee.bank_branch || employee.bankBranch || "N/A"}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Routing Number</Label>
                <p className="text-base font-medium">{employee.bank_routing_number || employee.bankRoutingNumber || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Emergency Contact
            </h4>
            <Separator className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Contact Person Name</Label>
                <p className="text-base font-medium">
                  {employee.emergency_person_name || employee.emergencyPersonName || "N/A"}
                </p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Contact Number</Label>
                <p className="text-base font-medium">
                  {employee.emergency_person_contact || employee.emergencyPersonContact || "N/A"}
                </p>
              </div>

              <div className="md:col-span-2">
                <Label className="text-sm text-muted-foreground">Contact Address</Label>
                <p className="text-base font-medium">
                  {employee.emergency_person_address || employee.emergencyPersonAddress || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewEmployeeDialog;
