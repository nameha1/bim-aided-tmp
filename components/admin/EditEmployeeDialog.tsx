import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getDocuments } from "@/lib/firebase/firestore";
import { where } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  eid: string | null;
  gender: string | null;
  date_of_birth: string | null;
  national_id: string | null;
  tin: string | null;
  phone: string | null;
  address: string | null;
  hire_date: string;
  department: string | null;
  sub_department: string | null;
  designation: string | null;
  supervisor_id: string | null;
  status: string;
  gross_salary: number | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_branch: string | null;
  bank_routing_number: string | null;
  emergency_person_name: string | null;
  emergency_person_contact: string | null;
  emergency_person_address: string | null;
  profileImageUrl?: string | null;
  profile_picture?: string | null;
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
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    eid: "",
    gender: "",
    dateOfBirth: "",
    nationalId: "",
    tin: "",
    phone: "",
    address: "",
    joiningDate: "",
    department: "",
    subDepartment: "",
    designation: "",
    supervisorId: "",
    employmentStatus: "active",
    basicSalary: "",
    bankName: "",
    bankAccountNumber: "",
    bankBranch: "",
    bankRoutingNumber: "",
    emergencyPersonName: "",
    emergencyPersonContact: "",
    emergencyPersonAddress: "",
  });

  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open]);

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        email: employee.email || "",
        eid: employee.eid || "",
        gender: employee.gender || "",
        dateOfBirth: employee.date_of_birth || "",
        nationalId: employee.national_id || "",
        tin: employee.tin || "",
        phone: employee.phone || "",
        address: employee.address || "",
        joiningDate: employee.hire_date || "",
        department: employee.department || "",
        subDepartment: employee.sub_department || "",
        designation: employee.designation || "",
        supervisorId: employee.supervisor_id || "",
        employmentStatus: employee.status || "active",
        basicSalary: employee.gross_salary?.toString() || "",
        bankName: employee.bank_name || "",
        bankAccountNumber: employee.bank_account_number || "",
        bankBranch: employee.bank_branch || "",
        bankRoutingNumber: employee.bank_routing_number || "",
        emergencyPersonName: employee.emergency_person_name || "",
        emergencyPersonContact: employee.emergency_person_contact || "",
        emergencyPersonAddress: employee.emergency_person_address || "",
      });
      setProfileImagePreview(employee.profileImageUrl || employee.profile_picture || "");
      setProfileImage(null);
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
    const { data, error } = await getDocuments("departments");
    if (error) throw error;
    if (!data) {
      setDepartments([]);
      return;
    }
    // De-duplicate departments by name - cast to any[] to work with reduce
    const dataArray = data as any[];
    const uniqueDepts = dataArray.reduce((acc: any[], dept: any) => {
      if (!acc.some(d => d.name === dept.name)) {
        acc.push(dept);
      }
      return acc;
    }, [] as any[]);
    setDepartments(uniqueDepts);
  };

  const fetchDesignations = async () => {
    const { data, error } = await getDocuments("designations");
    if (error) throw error;
    if (!data) {
      setDesignations([]);
      return;
    }
    // De-duplicate designations by title - cast to any[] to work with reduce
    const dataArray = data as any[];
    const uniqueDesigs = dataArray.reduce((acc: any[], desig: any) => {
      if (!acc.some(d => d.title === desig.title)) {
        acc.push(desig);
      }
      return acc;
    }, [] as any[]);
    setDesignations(uniqueDesigs);
  };

  const fetchEmployees = async () => {
    const { data, error } = await getDocuments("employees", [
      where("status", "==", "active")
    ]);
    if (error) throw error;
    
    // Filter out current employee from supervisor list
    const filteredEmployees = (data || []).filter(emp => emp.id !== employee?.id);
    
    setEmployees(filteredEmployees);
  };

  const compressImage = async (file: File, maxSizeKB: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          const maxDimension = 800;
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress with reducing quality until under maxSizeKB
          let quality = 0.9;
          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const sizeKB = blob.size / 1024;
                  if (sizeKB <= maxSizeKB || quality <= 0.1) {
                    const compressedFile = new File([blob], file.name, {
                      type: 'image/jpeg',
                      lastModified: Date.now(),
                    });
                    resolve(compressedFile);
                  } else {
                    quality -= 0.1;
                    tryCompress();
                  }
                }
              },
              'image/jpeg',
              quality
            );
          };
          tryCompress();
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      try {
        // Compress to max 100KB
        const compressed = await compressImage(file, 100);
        setProfileImage(compressed);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfileImagePreview(reader.result as string);
        };
        reader.readAsDataURL(compressed);

        toast({
          title: "Image compressed",
          description: `Original: ${(file.size / 1024).toFixed(0)}KB → Compressed: ${(compressed.size / 1024).toFixed(0)}KB`,
        });
      } catch (error) {
        toast({
          title: "Error compressing image",
          description: "Failed to compress the profile picture",
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveProfileImage = () => {
    setProfileImage(null);
    setProfileImagePreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employee) return;
    
    setLoading(true);

    try {
      let profileImageUrl = profileImagePreview;

      // Upload profile image if changed
      if (profileImage) {
        setUploadingImage(true);
        const imageFormData = new FormData();
        imageFormData.append('file', profileImage);
        imageFormData.append('folder', `employees/profiles/${employee.id}`);

        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: imageFormData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadResult.success) {
          throw new Error(uploadResult.message || uploadResult.error || "Failed to upload profile image");
        }

        profileImageUrl = uploadResult.url || uploadResult.data?.url;
        setUploadingImage(false);
      }

      const response = await fetch(`/api/update-employee/${employee.id}`, {
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
          tin: formData.tin || null,
          phoneNumber: formData.phone || null,
          address: formData.address || null,
          joiningDate: formData.joiningDate,
          department: formData.department || null,
          subDepartment: formData.subDepartment || null,
          designation: formData.designation || null,
          supervisor_id: formData.supervisorId || null,
          employmentStatus: formData.employmentStatus,
          basicSalary: formData.basicSalary || null,
          bankName: formData.bankName || null,
          bankAccountNumber: formData.bankAccountNumber || null,
          bankBranch: formData.bankBranch || null,
          bankRoutingNumber: formData.bankRoutingNumber || null,
          emergencyPersonName: formData.emergencyPersonName || null,
          emergencyPersonContact: formData.emergencyPersonContact || null,
          emergencyPersonAddress: formData.emergencyPersonAddress || null,
          profileImageUrl: profileImageUrl || null,
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
      setUploadingImage(false);
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4 pb-4 border-b">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              {profileImagePreview ? (
                <AvatarImage src={profileImagePreview} alt="Profile" />
              ) : (
                <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary/80 to-primary text-white">
                  {formData.firstName?.[0]}{formData.lastName?.[0]}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex gap-2">
              <Label htmlFor="profile-image-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {profileImagePreview ? "Change Photo" : "Upload Photo"}
                  </span>
                </div>
                <Input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
              </Label>
              
              {profileImagePreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveProfileImage}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              Recommended: Square image, max 5MB
            </p>
          </div>

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
                <SelectTrigger id="edit-gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
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
              <Label htmlFor="edit-tin">TIN</Label>
              <Input
                id="edit-tin"
                value={formData.tin}
                onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
                placeholder="Tax Identification Number"
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
              <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                <SelectTrigger id="edit-department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="z-[100] max-h-[300px]">
                  {departments.map((dept, index) => (
                    <SelectItem key={dept.id || `dept-${index}-${dept.name}`} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-designation">Designation</Label>
              <Select value={formData.designation} onValueChange={(value) => setFormData({ ...formData, designation: value })}>
                <SelectTrigger id="edit-designation">
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent className="z-[100] max-h-[300px]">
                  {designations.map((desig, index) => (
                    <SelectItem key={desig.id || `desig-${index}-${desig.title}`} value={desig.title}>
                      {desig.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-supervisor">Reporting Manager</Label>
              <Select value={formData.supervisorId} onValueChange={(value) => setFormData({ ...formData, supervisorId: value === "none" ? "" : value })}>
                <SelectTrigger id="edit-supervisor">
                  <SelectValue placeholder="Select reporting manager" />
                </SelectTrigger>
                <SelectContent className="z-[100] max-h-[300px]">
                  <SelectItem value="none">None</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()} {emp.designation ? `- ${emp.designation}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-employmentStatus">Employment Status</Label>
              <Select value={formData.employmentStatus} onValueChange={(value) => setFormData({ ...formData, employmentStatus: value })}>
                <SelectTrigger id="edit-employmentStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
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

            <div className="space-y-2">
              <Label htmlFor="edit-basicSalary">
                Gross Salary <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-basicSalary"
                type="number"
                value={formData.basicSalary}
                onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-bankName">Bank Name</Label>
              <Input
                id="edit-bankName"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-bankAccountNumber">Bank Account Number</Label>
              <Input
                id="edit-bankAccountNumber"
                value={formData.bankAccountNumber}
                onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-bankBranch">Bank Branch</Label>
              <Input
                id="edit-bankBranch"
                value={formData.bankBranch}
                onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-bankRoutingNumber">Bank Routing Number</Label>
              <Input
                id="edit-bankRoutingNumber"
                value={formData.bankRoutingNumber}
                onChange={(e) => setFormData({ ...formData, bankRoutingNumber: e.target.value })}
                placeholder="9-digit routing number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-subDepartment">Sub-Department</Label>
              <Input
                id="edit-subDepartment"
                value={formData.subDepartment}
                onChange={(e) => setFormData({ ...formData, subDepartment: e.target.value })}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-emergencyPersonName">Emergency Contact Name</Label>
              <Input
                id="edit-emergencyPersonName"
                value={formData.emergencyPersonName}
                onChange={(e) => setFormData({ ...formData, emergencyPersonName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-emergencyPersonContact">Emergency Contact Phone</Label>
              <Input
                id="edit-emergencyPersonContact"
                type="tel"
                value={formData.emergencyPersonContact}
                onChange={(e) => setFormData({ ...formData, emergencyPersonContact: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-emergencyPersonAddress">Emergency Contact Address</Label>
              <Input
                id="edit-emergencyPersonAddress"
                value={formData.emergencyPersonAddress}
                onChange={(e) => setFormData({ ...formData, emergencyPersonAddress: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading || uploadingImage}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploadingImage}>
              {(loading || uploadingImage) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {uploadingImage ? "Uploading Image..." : loading ? "Updating..." : "Update Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeDialog;
