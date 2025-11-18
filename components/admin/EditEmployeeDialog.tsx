import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { getDocuments, createDocument } from "@/lib/firebase/firestore";
import { where } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X, FileText, Download, ExternalLink, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DEFAULT_DEPARTMENTS = [
  "Executive & Management Level",
  "Technical & Production Divisions",
  "Support & Innovation Divisions",
  "Business & Administrative Division"
];

const DEFAULT_DESIGNATIONS = [
  "BIM Modeler",
  "Sr. BIM Modeler",
  "BIM Engineer",
  "Sr. BIM Engineer",
  "BIM Coordinator",
  "Sr. BIM Coordinator",
  "BIM Manager",
  "Admin"
];

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
  document_urls?: string[] | null;
  documentUrls?: string[] | null;
  can_view_financials?: boolean | null;
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
  const [existingDocuments, setExistingDocuments] = useState<string[]>([]);
  const [newDocuments, setNewDocuments] = useState<File[]>([]);
  const [showNewDepartment, setShowNewDepartment] = useState(false);
  const [showNewDesignation, setShowNewDesignation] = useState(false);
  const [newDepartmentInput, setNewDepartmentInput] = useState("");
  const [newDesignationInput, setNewDesignationInput] = useState("");
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
    canViewFinancials: false,
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
        canViewFinancials: employee.can_view_financials || false,
      });
      setProfileImagePreview(employee.profileImageUrl || employee.profile_picture || "");
      setProfileImage(null);
      setExistingDocuments(employee.document_urls || employee.documentUrls || []);
      setNewDocuments([]);
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
    try {
      // Load custom departments from Firestore (matching AddEmployeeForm)
      const { data: customDepts, error } = await getDocuments("custom_departments");
      if (error) throw error;

      const allDepts: any[] = [];
      
      // Add default departments as objects with name property
      DEFAULT_DEPARTMENTS.forEach(deptName => {
        allDepts.push({ id: `default-${deptName}`, name: deptName });
      });

      // Add custom departments
      if (customDepts && customDepts.length > 0) {
        customDepts.forEach((dept: any) => {
          // Only add if not already in defaults
          if (!DEFAULT_DEPARTMENTS.includes(dept.name)) {
            allDepts.push(dept);
          }
        });
      }

      setDepartments(allDepts);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments([]);
    }
  };

  const fetchDesignations = async () => {
    try {
      // Load custom designations from Firestore (matching AddEmployeeForm)
      const { data: customDesigs, error } = await getDocuments("custom_designations");
      if (error) throw error;

      const allDesigs: any[] = [];
      
      // Add default designations as objects with name/title property
      DEFAULT_DESIGNATIONS.forEach(desigName => {
        allDesigs.push({ id: `default-${desigName}`, name: desigName, title: desigName });
      });

      // Add custom designations
      if (customDesigs && customDesigs.length > 0) {
        customDesigs.forEach((desig: any) => {
          // Only add if not already in defaults
          if (!DEFAULT_DESIGNATIONS.includes(desig.name)) {
            allDesigs.push({ ...desig, title: desig.name });
          }
        });
      }

      setDesignations(allDesigs);
    } catch (error) {
      console.error("Error fetching designations:", error);
      setDesignations([]);
    }
  };

  const addNewDepartment = async () => {
    if (!newDepartmentInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a department name",
        variant: "destructive",
      });
      return;
    }

    if (departments.some(d => d.name === newDepartmentInput.trim())) {
      toast({
        title: "Error",
        description: "This department already exists",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createDocument("custom_departments", {
        name: newDepartmentInput.trim(),
        created_at: new Date().toISOString(),
      });

      setDepartments([...departments, { id: result.data || `custom-${Date.now()}`, name: newDepartmentInput.trim() }]);
      setFormData({ ...formData, department: newDepartmentInput.trim() });
      setNewDepartmentInput("");
      setShowNewDepartment(false);

      toast({
        title: "Success",
        description: `Department "${newDepartmentInput.trim()}" added successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add department",
        variant: "destructive",
      });
    }
  };

  const addNewDesignation = async () => {
    if (!newDesignationInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a designation",
        variant: "destructive",
      });
      return;
    }

    if (designations.some(d => d.name === newDesignationInput.trim())) {
      toast({
        title: "Error",
        description: "This designation already exists",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createDocument("custom_designations", {
        name: newDesignationInput.trim(),
        created_at: new Date().toISOString(),
      });

      const newDesignation = { id: result.data || `custom-${Date.now()}`, name: newDesignationInput.trim(), title: newDesignationInput.trim() };
      setDesignations([...designations, newDesignation]);
      setFormData({ ...formData, designation: newDesignationInput.trim() });
      setNewDesignationInput("");
      setShowNewDesignation(false);

      toast({
        title: "Success",
        description: `Designation "${newDesignationInput.trim()}" added successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add designation",
        variant: "destructive",
      });
    }
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

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];

    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 2MB limit`,
          variant: "destructive",
        });
        continue;
      }
      validFiles.push(file);
    }

    const totalDocs = existingDocuments.length + newDocuments.length + validFiles.length;
    if (totalDocs > 3) {
      toast({
        title: "Too many documents",
        description: "Maximum 3 documents allowed",
        variant: "destructive",
      });
      return;
    }

    setNewDocuments([...newDocuments, ...validFiles]);
  };

  const removeNewDocument = (index: number) => {
    setNewDocuments(newDocuments.filter((_, i) => i !== index));
  };

  const removeExistingDocument = (index: number) => {
    setExistingDocuments(existingDocuments.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('path', path);

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formDataUpload,
    });

    if (!response.ok) throw new Error('File upload failed');
    
    const result = await response.json();
    return result.url;
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

      // Upload new documents
      const allDocumentUrls = [...existingDocuments];
      for (let i = 0; i < newDocuments.length; i++) {
        const url = await uploadFile(newDocuments[i], `employees/documents/${employee.id}-${Date.now()}-${i}`);
        allDocumentUrls.push(url);
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
          documentUrls: allDocumentUrls,
          canViewFinancials: formData.canViewFinancials || false,
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
              <div className="flex gap-2">
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger className="flex-1" id="edit-department">
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
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowNewDepartment(!showNewDepartment)}
                >
                  <Plus size={16} />
                </Button>
              </div>
              {showNewDepartment && (
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="New department name"
                    value={newDepartmentInput}
                    onChange={(e) => setNewDepartmentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addNewDepartment();
                      }
                    }}
                  />
                  <Button type="button" onClick={addNewDepartment} size="sm">Add</Button>
                  <Button type="button" onClick={() => {
                    setShowNewDepartment(false);
                    setNewDepartmentInput("");
                  }} variant="ghost" size="sm">
                    <X size={16} />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-designation">Designation</Label>
              <div className="flex gap-2">
                <Select value={formData.designation} onValueChange={(value) => setFormData({ ...formData, designation: value })}>
                  <SelectTrigger className="flex-1" id="edit-designation">
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent className="z-[100] max-h-[300px]">
                    {designations.map((desig, index) => (
                      <SelectItem key={desig.id || `desig-${index}-${desig.name}`} value={desig.name}>
                        {desig.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowNewDesignation(!showNewDesignation)}
                >
                  <Plus size={16} />
                </Button>
              </div>
              {showNewDesignation && (
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="New designation name"
                    value={newDesignationInput}
                    onChange={(e) => setNewDesignationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addNewDesignation();
                      }
                    }}
                  />
                  <Button type="button" onClick={addNewDesignation} size="sm">Add</Button>
                  <Button type="button" onClick={() => {
                    setShowNewDesignation(false);
                    setNewDesignationInput("");
                  }} variant="ghost" size="sm">
                    <X size={16} />
                  </Button>
                </div>
              )}
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

            {/* Financial Information Visibility */}
            <div className="space-y-2 p-4 bg-blue-50 rounded-md">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-canViewFinancials"
                  checked={formData.canViewFinancials}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, canViewFinancials: checked as boolean })
                  }
                />
                <Label htmlFor="edit-canViewFinancials" className="cursor-pointer font-medium">
                  Allow employee to view their financial information (salary, payroll)
                </Label>
              </div>
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

            {/* Document Upload Section */}
            <div className="space-y-4 md:col-span-2 pt-4 border-t">
              <h3 className="text-lg font-semibold">Documents (max 3, each max 2MB)</h3>
              
              {/* Existing Documents */}
              {existingDocuments.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Documents</Label>
                  {existingDocuments.map((url, index) => {
                    const fileName = url.split('/').pop() || `Document ${index + 1}`;
                    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
                    const isPDF = fileExtension === 'pdf';
                    const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm truncate">{decodeURIComponent(fileName)}</span>
                        </div>
                        <div className="flex gap-1 ml-2">
                          {(isPDF || isImage) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(url, '_blank')}
                              title="View"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = fileName;
                              a.target = '_blank';
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                            }}
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExistingDocument(index)}
                            title="Remove"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* New Documents */}
              {newDocuments.length > 0 && (
                <div className="space-y-2">
                  <Label>New Documents (to be uploaded)</Label>
                  {newDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <span className="text-sm truncate">{doc.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {(doc.size / (1024 * 1024)).toFixed(2)}MB
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNewDocument(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload New Documents */}
              {(existingDocuments.length + newDocuments.length) < 3 && (
                <div>
                  <Label htmlFor="edit-documents">Add New Documents</Label>
                  <Input
                    id="edit-documents"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleDocumentChange}
                    disabled={(existingDocuments.length + newDocuments.length) >= 3}
                    className="mt-2"
                  />
                </div>
              )}
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
