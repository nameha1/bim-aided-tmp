import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDocuments, createDocument } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Plus } from "lucide-react";
import Image from "next/image";

interface AddEmployeeFormProps {
  onSuccess: () => void;
}

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

const AddEmployeeForm = ({ onSuccess }: AddEmployeeFormProps) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [departments, setDepartments] = useState<string[]>(DEFAULT_DEPARTMENTS);
  const [subDepartments, setSubDepartments] = useState<string[]>([]);
  const [designations, setDesignations] = useState<string[]>(DEFAULT_DESIGNATIONS);
  const [employees, setEmployees] = useState<any[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [documents, setDocuments] = useState<File[]>([]);
  const [showNewDepartment, setShowNewDepartment] = useState(false);
  const [showNewSubDepartment, setShowNewSubDepartment] = useState(false);
  const [showNewDesignation, setShowNewDesignation] = useState(false);
  const [newDepartmentInput, setNewDepartmentInput] = useState("");
  const [newSubDepartmentInput, setNewSubDepartmentInput] = useState("");
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
    joiningDate: new Date().toISOString().split('T')[0],
    department: "",
    subDepartment: "",
    designation: "",
    supervisorId: "",
    password: "",
    grossSalary: "",
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
    const timer = setTimeout(() => {
      loadInitialData();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Generate Employee ID based on joining date
  useEffect(() => {
    if (formData.joiningDate) {
      generateEmployeeId(formData.joiningDate);
    }
  }, [formData.joiningDate]);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      await fetchEmployees();
      await loadCustomOptions();
    } catch (error: any) {
      console.error("Error loading initial data:", error);
      toast({
        title: "Error loading form data",
        description: error.message || "Failed to load employee data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const loadCustomOptions = async () => {
    try {
      // Load custom departments, sub-departments, and designations from Firestore
      const { data: customDepts } = await getDocuments("custom_departments");
      const { data: customSubDepts } = await getDocuments("custom_sub_departments");
      const { data: customDesigs } = await getDocuments("custom_designations");

      if (customDepts && customDepts.length > 0) {
        const deptNames = customDepts.map((d: any) => d.name).filter((name: string) => !DEFAULT_DEPARTMENTS.includes(name));
        setDepartments([...DEFAULT_DEPARTMENTS, ...deptNames]);
      }

      if (customSubDepts && customSubDepts.length > 0) {
        const subDeptNames = customSubDepts.map((d: any) => d.name);
        setSubDepartments(subDeptNames);
      }

      if (customDesigs && customDesigs.length > 0) {
        const desigNames = customDesigs.map((d: any) => d.name).filter((name: string) => !DEFAULT_DESIGNATIONS.includes(name));
        setDesignations([...DEFAULT_DESIGNATIONS, ...desigNames]);
      }
    } catch (error) {
      console.error("Error loading custom options:", error);
    }
  };

  const generateEmployeeId = async (joiningDate: string) => {
    try {
      const date = new Date(joiningDate);
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const prefix = `${year}${month}`;

      // Get employees with the same prefix
      const { data: employeesData } = await getDocuments("employees");
      const employeesWithPrefix = (employeesData || []).filter((emp: any) => 
        emp.eid && emp.eid.startsWith(prefix)
      );

      // Find the highest number
      let maxNumber = 0;
      employeesWithPrefix.forEach((emp: any) => {
        const numPart = parseInt(emp.eid.slice(4));
        if (!isNaN(numPart) && numPart > maxNumber) {
          maxNumber = numPart;
        }
      });

      const newNumber = (maxNumber + 1).toString().padStart(3, '0');
      const newEid = `${prefix}${newNumber}`;
      
      setFormData(prev => ({ ...prev, eid: newEid }));
    } catch (error) {
      console.error("Error generating employee ID:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await getDocuments("employees");
      if (error) throw error;
      const activeEmployees = (data || [])
        .filter((emp: any) => emp.status === "active")
        .sort((a: any, b: any) => {
          const nameA = `${a.firstName || ''} ${a.lastName || ''}`;
          const nameB = `${b.firstName || ''} ${b.lastName || ''}`;
          return nameA.localeCompare(nameB);
        });
      setEmployees(activeEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }
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

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > 2) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 2MB limit`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (documents.length + validFiles.length > 3) {
      toast({
        title: "Too many files",
        description: "Maximum 3 documents allowed",
        variant: "destructive",
      });
      return;
    }

    setDocuments([...documents, ...validFiles]);
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const addNewDepartment = async () => {
    const name = newDepartmentInput.trim();
    if (!name) return;
    
    try {
      await createDocument("custom_departments", { name, createdAt: new Date() });
      setDepartments([...departments, name]);
      setFormData({ ...formData, department: name });
      setShowNewDepartment(false);
      setNewDepartmentInput("");
      toast({ title: "Department added", description: `${name} is now available` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add department", variant: "destructive" });
    }
  };

  const addNewSubDepartment = async () => {
    const name = newSubDepartmentInput.trim();
    if (!name) return;
    
    try {
      await createDocument("custom_sub_departments", { name, createdAt: new Date() });
      setSubDepartments([...subDepartments, name]);
      setFormData({ ...formData, subDepartment: name });
      setShowNewSubDepartment(false);
      setNewSubDepartmentInput("");
      toast({ title: "Sub-department added", description: `${name} is now available` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add sub-department", variant: "destructive" });
    }
  };

  const addNewDesignation = async () => {
    const name = newDesignationInput.trim();
    if (!name) return;
    
    try {
      await createDocument("custom_designations", { name, createdAt: new Date() });
      setDesignations([...designations, name]);
      setFormData({ ...formData, designation: name });
      setShowNewDesignation(false);
      setNewDesignationInput("");
      toast({ title: "Designation added", description: `${name} is now available` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add designation", variant: "destructive" });
    }
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
    setLoading(true);

    try {
      // Validate required fields on client side
      if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
        throw new Error('Please fill in all required fields (First Name, Last Name, Email, Password)');
      }

      if (!formData.joiningDate) {
        throw new Error('Joining date is required');
      }

      if (!formData.department) {
        throw new Error('Please select a department');
      }

      if (!formData.designation) {
        throw new Error('Please select a designation');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      let profileImageUrl = "";
      const documentUrls: string[] = [];

      // Upload profile image
      if (profileImage) {
        profileImageUrl = await uploadFile(profileImage, `employees/profiles/${formData.eid}`);
      }

      // Upload documents
      for (let i = 0; i < documents.length; i++) {
        const url = await uploadFile(documents[i], `employees/documents/${formData.eid}-${i}`);
        documentUrls.push(url);
      }

      // Prepare employee data
      const employeePayload = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        eid: formData.eid,
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
        supervisorId: formData.supervisorId || null,
        grossSalary: formData.grossSalary || null,
        bankName: formData.bankName || null,
        bankAccountNumber: formData.bankAccountNumber || null,
        bankBranch: formData.bankBranch || null,
        bankRoutingNumber: formData.bankRoutingNumber || null,
        emergencyPersonName: formData.emergencyPersonName || null,
        emergencyPersonContact: formData.emergencyPersonContact || null,
        emergencyPersonAddress: formData.emergencyPersonAddress || null,
        canViewFinancials: formData.canViewFinancials || false,
        profileImageUrl: profileImageUrl || null,
        documentUrls: documentUrls,
      };

      console.log('Submitting employee data:', {
        ...employeePayload,
        password: '***HIDDEN***' // Don't log the password
      });

      // Call API to create employee
      const response = await fetch(`/api/create-employee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeePayload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('API Error:', result);
        let errorMessage = result.error || 'Failed to create employee';
        
        // Add more details if available
        if (result.details) {
          errorMessage += `\n${result.details}`;
        }
        if (result.code) {
          errorMessage += `\nError code: ${result.code}`;
        }
        
        throw new Error(errorMessage);
      }

      toast({
        title: "Employee added successfully",
        description: `${formData.firstName} ${formData.lastName} (${formData.eid}) has been added to the system.`,
      });

      // Reset form
      setFormData({
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
        joiningDate: new Date().toISOString().split('T')[0],
        department: "",
        subDepartment: "",
        designation: "",
        supervisorId: "",
        password: "",
        grossSalary: "",
        bankName: "",
        bankAccountNumber: "",
        bankBranch: "",
        bankRoutingNumber: "",
        emergencyPersonName: "",
        emergencyPersonContact: "",
        emergencyPersonAddress: "",
        canViewFinancials: false,
      });
      setProfileImage(null);
      setProfileImagePreview("");
      setDocuments([]);

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture Upload */}
      <div className="space-y-2">
        <Label>Profile Picture (max 100KB)</Label>
        <div className="flex items-center gap-4">
          {profileImagePreview ? (
            <div className="relative w-24 h-24">
              <Image
                src={profileImagePreview}
                alt="Profile preview"
                width={96}
                height={96}
                className="rounded-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setProfileImage(null);
                  setProfileImagePreview("");
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="w-24 h-24 border-2 border-dashed rounded-full flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
              <Upload size={24} className="text-muted-foreground" />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="hidden"
              />
            </label>
          )}
          <div className="text-sm text-muted-foreground">
            Upload a profile picture. <br />
            Image will be compressed to max 100KB.
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
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
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
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
            <Label htmlFor="tin">TIN</Label>
            <Input
              id="tin"
              value={formData.tin}
              onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
              placeholder="Tax Identification Number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
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
      </div>

      {/* Employment Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Employment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="joiningDate">Joining Date*</Label>
            <Input
              id="joiningDate"
              type="date"
              value={formData.joiningDate}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eid">Employee ID (EID)*</Label>
            <Input
              id="eid"
              value={formData.eid}
              onChange={(e) => setFormData({ ...formData, eid: e.target.value })}
              placeholder="YYMMXXX (e.g., 2511001)"
              required
            />
            <p className="text-xs text-muted-foreground">Format: YYMMXXX (Year Month Sequence)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department*</Label>
            <div className="flex gap-2">
              <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })} required>
                <SelectTrigger className="flex-1" id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="z-50 max-h-[300px]">
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subDepartment">Sub-Department</Label>
            <div className="flex gap-2">
              <Select value={formData.subDepartment} onValueChange={(value) => setFormData({ ...formData, subDepartment: value })}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select sub-department" />
                </SelectTrigger>
                <SelectContent>
                  {subDepartments.length > 0 ? (
                    subDepartments.map((subDept) => (
                      <SelectItem key={subDept} value={subDept}>{subDept}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>Add a sub-department</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowNewSubDepartment(!showNewSubDepartment)}
              >
                <Plus size={16} />
              </Button>
            </div>
            {showNewSubDepartment && (
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="New sub-department name"
                  value={newSubDepartmentInput}
                  onChange={(e) => setNewSubDepartmentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addNewSubDepartment();
                    }
                  }}
                />
                <Button type="button" onClick={addNewSubDepartment} size="sm">Add</Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="designation">Designation*</Label>
            <div className="flex gap-2">
              <Select value={formData.designation} onValueChange={(value) => setFormData({ ...formData, designation: value })}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  {designations.map((desig) => (
                    <SelectItem key={desig} value={desig}>{desig}</SelectItem>
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
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="supervisorId">Supervisor</Label>
            <Select value={formData.supervisorId} onValueChange={(value) => setFormData({ ...formData, supervisorId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select supervisor" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Financial Information</h3>
        
        {/* Financial Visibility Toggle */}
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <input
            type="checkbox"
            id="canViewFinancials"
            checked={formData.canViewFinancials}
            onChange={(e) => setFormData({ ...formData, canViewFinancials: e.target.checked })}
            className="h-4 w-4"
          />
          <Label htmlFor="canViewFinancials" className="text-sm font-medium cursor-pointer flex-1">
            Allow employee to view their financial information (salary, payroll, deductions)
          </Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="grossSalary">Gross Salary</Label>
            <Input
              id="grossSalary"
              type="number"
              value={formData.grossSalary}
              onChange={(e) => setFormData({ ...formData, grossSalary: e.target.value })}
              placeholder="0.00"
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

          <div className="space-y-2">
            <Label htmlFor="bankRoutingNumber">Bank Routing Number</Label>
            <Input
              id="bankRoutingNumber"
              value={formData.bankRoutingNumber}
              onChange={(e) => setFormData({ ...formData, bankRoutingNumber: e.target.value })}
              placeholder="9-digit routing number"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyPersonName">Emergency Person Name</Label>
            <Input
              id="emergencyPersonName"
              value={formData.emergencyPersonName}
              onChange={(e) => setFormData({ ...formData, emergencyPersonName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyPersonContact">Emergency Person Contact</Label>
            <Input
              id="emergencyPersonContact"
              type="tel"
              value={formData.emergencyPersonContact}
              onChange={(e) => setFormData({ ...formData, emergencyPersonContact: e.target.value })}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="emergencyPersonAddress">Emergency Person Address</Label>
            <Input
              id="emergencyPersonAddress"
              value={formData.emergencyPersonAddress}
              onChange={(e) => setFormData({ ...formData, emergencyPersonAddress: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Document Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Documents (max 3, each max 2MB)</h3>
        <div className="space-y-2">
          <Label htmlFor="documents">Upload Documents</Label>
          <Input
            id="documents"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleDocumentChange}
            disabled={documents.length >= 3}
          />
          {documents.length > 0 && (
            <div className="space-y-2 mt-2">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm truncate flex-1">{doc.name}</span>
                  <span className="text-xs text-muted-foreground mx-2">
                    {(doc.size / (1024 * 1024)).toFixed(2)}MB
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(index)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Adding Employee..." : "Add Employee"}
      </Button>
    </form>
  );
};

export default AddEmployeeForm;
