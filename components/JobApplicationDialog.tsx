import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, FileText } from "lucide-react";
import { createDocument } from "@/lib/firebase/firestore";

interface JobApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  jobId?: string;
}

const JobApplicationDialog = ({ isOpen, onClose, jobTitle, jobId }: JobApplicationDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: "Please upload a CV smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document.",
          variant: "destructive",
        });
        return;
      }

      setCvFile(file);
    }
  };

  const handleRemoveFile = () => {
    setCvFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cvFile) {
      toast({
        title: "CV Required",
        description: "Please attach your CV to submit the application.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload CV to Cloudflare R2
      const fileExt = cvFile.name.split(".").pop();
      const fileName = `${Date.now()}_${formData.name.replace(/\s+/g, "_")}.${fileExt}`;
      
      // Convert file to base64 for upload
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]); // Remove data:mime;base64, prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(cvFile);
      });

      // Upload to R2 via API route
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: fileData,
          fileName: `applications/${fileName}`,
          contentType: cvFile.type,
        }),
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload CV');
      }

      const { url: cvUrl } = await uploadResponse.json();

      // Save application to Firestore
      const { error: dbError } = await createDocument('job_applications', {
        job_posting_id: jobId || null,
        job_title: jobTitle,
        applicant_name: formData.name,
        applicant_email: formData.email,
        applicant_phone: formData.phone,
        cv_url: cvUrl,
        status: 'pending',
        created_at: new Date(),
      });

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you soon.",
      });

      // Reset form
      setFormData({ name: "", email: "", phone: "" });
      setCvFile(null);
      onClose();
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for {jobTitle}</DialogTitle>
          <DialogDescription>
            Fill in your details and attach your CV to apply for this position.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 234 567 8900"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cv">Upload CV * (PDF or Word, max 5MB)</Label>
            
            {!cvFile ? (
              <label
                htmlFor="cv"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
              >
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Click to upload CV</span>
                <span className="text-xs text-muted-foreground mt-1">PDF or Word (max 5MB)</span>
                <input
                  id="cv"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-secondary">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{cvFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobApplicationDialog;
