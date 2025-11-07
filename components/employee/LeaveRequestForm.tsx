import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

interface LeaveRequestFormProps {
  employeeId: string;
  onSuccess: () => void;
}

const LeaveRequestForm = ({ employeeId, onSuccess }: LeaveRequestFormProps) => {
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    leaveType: "",
    reason: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get employee details for folder name
      const { data: employeeData } = await supabase
        .from("employees")
        .select("first_name, last_name")
        .eq("id", employeeId)
        .single();

      const employeeName = `${employeeData?.first_name} ${employeeData?.last_name}`;
      
      let fileUrl = null;
      let fileId = null;

      // Upload file to Supabase Storage if selected
      if (selectedFile) {
        setUploadingFile(true);
        try {
          // Generate file path with employee name and timestamp
          const timestamp = Date.now();
          const fileExt = selectedFile.name.split('.').pop();
          const filePath = `${employeeName.replace(/\s+/g, '_')}/${timestamp}.${fileExt}`;

          // Create storage bucket if it doesn't exist (will fail silently if exists)
          const { data: buckets } = await supabase.storage.listBuckets();
          const leaveDocsExists = buckets?.some(b => b.name === 'leave-documents');
          
          if (!leaveDocsExists) {
            await supabase.storage.createBucket('leave-documents', {
              public: false,
              fileSizeLimit: 10485760, // 10MB
            });
          }

          // Upload file to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('leave-documents')
            .upload(filePath, selectedFile, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('leave-documents')
            .getPublicUrl(filePath);

          fileUrl = publicUrl;
          fileId = uploadData.path;
        } catch (fileError: any) {
          console.error('File upload error:', fileError);
          toast({
            title: "Warning",
            description: "Leave request submitted but file upload failed. You can resubmit the document later.",
            variant: "destructive",
          });
        } finally {
          setUploadingFile(false);
        }
      }

      // Insert leave request with file info
      const { error } = await supabase.from("attendance").insert({
        employee_id: employeeId,
        date: formData.startDate,
        leave_start_date: formData.startDate,
        leave_end_date: formData.endDate,
        status: "Leave" as any,
        leave_type: formData.leaveType as any,
        leave_reason: formData.reason,
        supervisor_approved: false,
        admin_approved: false,
        supporting_document_url: fileUrl,
      } as any);

      if (error) throw error;

      toast({
        title: "Leave request submitted",
        description: selectedFile 
          ? "Your leave request and supporting document have been submitted for approval."
          : "Your leave request has been submitted for approval.",
      });

      setFormData({
        startDate: "",
        endDate: "",
        leaveType: "",
        reason: "",
      });
      setSelectedFile(null);

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error submitting leave request",
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
          <Label htmlFor="startDate">Start Date*</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => {
              setFormData({ ...formData, startDate: e.target.value });
              // Auto-set end date to start date if not set
              if (!formData.endDate || formData.endDate < e.target.value) {
                setFormData(prev => ({ ...prev, startDate: e.target.value, endDate: e.target.value }));
              }
            }}
            required
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date*</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
            min={formData.startDate || new Date().toISOString().split("T")[0]}
          />
          <p className="text-xs text-muted-foreground">
            Select the same date for single-day leave
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="leaveType">Leave Type*</Label>
        <Select
          value={formData.leaveType}
          onValueChange={(value) => setFormData({ ...formData, leaveType: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select leave type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Sick Leave">Sick Leave</SelectItem>
            <SelectItem value="Casual Leave">Casual Leave</SelectItem>
            <SelectItem value="Hourly Leave">Hourly Leave</SelectItem>
            <SelectItem value="Half Day Leave">Half Day Leave</SelectItem>
            <SelectItem value="Full Day Leave">Full Day Leave</SelectItem>
            <SelectItem value="Earned Leave">Earned Leave</SelectItem>
            <SelectItem value="Paid Leave">Paid Leave</SelectItem>
            <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
            <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
            <SelectItem value="Other Leave">Other Leave</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder="Please provide a reason for your leave..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Supporting Document (Optional)</Label>
        <p className="text-sm text-gray-500 mb-2">
          Upload medical certificate, appointment letter, or other supporting documents (Max 10MB)
        </p>
        
        {!selectedFile ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              id="file"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <label htmlFor="file" className="cursor-pointer flex flex-col items-center">
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                Click to upload or drag and drop
              </span>
              <span className="text-xs text-gray-500 mt-1">
                PDF, DOC, DOCX, JPG, or PNG
              </span>
            </label>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <Upload className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFile(null)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Button type="submit" disabled={loading || uploadingFile} className="w-full">
        {uploadingFile ? "Uploading document..." : loading ? "Submitting..." : "Submit Leave Request"}
      </Button>
    </form>
  );
};

export default LeaveRequestForm;
