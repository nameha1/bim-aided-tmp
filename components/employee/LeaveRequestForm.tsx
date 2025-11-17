import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { createDocument, getDocuments, getDocument } from "@/lib/firebase/firestore";
import { where } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Calendar, AlertCircle, Info, TrendingDown } from "lucide-react";

interface LeaveRequestFormProps {
  employeeId: string;
  onSuccess: () => void;
}

const LeaveRequestForm = ({ employeeId, onSuccess }: LeaveRequestFormProps) => {
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [leaveBalance, setLeaveBalance] = useState<any>(null);
  const [leaveImpact, setLeaveImpact] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    leaveType: "",
    reason: "",
  });

  useEffect(() => {
    fetchLeaveBalance();
  }, [employeeId]);

  useEffect(() => {
    calculateLeaveImpact();
  }, [formData.startDate, formData.endDate, formData.leaveType, leaveBalance]);

  const fetchLeaveBalance = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const { data: balanceData } = await getDocuments('leave_balances', [
        where('employee_id', '==', employeeId),
        where('year', '==', currentYear)
      ]);

      if (balanceData && balanceData.length > 0) {
        setLeaveBalance(balanceData[0]);
      }
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    }
  };

  const calculateLeaveDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const calculateLeaveImpact = () => {
    if (!formData.startDate || !formData.endDate || !formData.leaveType || !leaveBalance) {
      setLeaveImpact(null);
      return;
    }

    const totalDays = calculateLeaveDays(formData.startDate, formData.endDate);
    const leaveType = formData.leaveType.toLowerCase();

    let impact = {
      totalDays,
      deductedFrom: '',
      paidDays: 0,
      unpaidDays: 0,
      remainingBalance: 0,
      balanceAfter: 0,
      willImpactSalary: false,
      message: ''
    };

    if (leaveType.includes('casual')) {
      const casualRemaining = leaveBalance.casual_leave_remaining || 0;
      if (totalDays <= casualRemaining) {
        impact.deductedFrom = 'Casual Leave';
        impact.paidDays = totalDays;
        impact.unpaidDays = 0;
        impact.remainingBalance = casualRemaining;
        impact.balanceAfter = casualRemaining - totalDays;
        impact.willImpactSalary = false;
        impact.message = `${totalDays} day(s) will be deducted from your Casual Leave balance. No salary deduction.`;
      } else {
        impact.deductedFrom = 'Casual Leave + Unpaid';
        impact.paidDays = casualRemaining;
        impact.unpaidDays = totalDays - casualRemaining;
        impact.remainingBalance = casualRemaining;
        impact.balanceAfter = 0;
        impact.willImpactSalary = true;
        impact.message = `${casualRemaining} day(s) from Casual Leave (paid) + ${impact.unpaidDays} day(s) as Unpaid Leave. ${impact.unpaidDays} day(s) will be deducted from salary.`;
      }
    } else if (leaveType.includes('sick')) {
      const sickRemaining = leaveBalance.sick_leave_remaining || 0;
      if (totalDays <= sickRemaining) {
        impact.deductedFrom = 'Sick Leave';
        impact.paidDays = totalDays;
        impact.unpaidDays = 0;
        impact.remainingBalance = sickRemaining;
        impact.balanceAfter = sickRemaining - totalDays;
        impact.willImpactSalary = false;
        impact.message = `${totalDays} day(s) will be deducted from your Sick Leave balance. No salary deduction.`;
      } else {
        impact.deductedFrom = 'Sick Leave + Unpaid';
        impact.paidDays = sickRemaining;
        impact.unpaidDays = totalDays - sickRemaining;
        impact.remainingBalance = sickRemaining;
        impact.balanceAfter = 0;
        impact.willImpactSalary = true;
        impact.message = `${sickRemaining} day(s) from Sick Leave (paid) + ${impact.unpaidDays} day(s) as Unpaid Leave. ${impact.unpaidDays} day(s) will be deducted from salary.`;
      }
    } else if (leaveType.includes('unpaid')) {
      impact.deductedFrom = 'Unpaid Leave';
      impact.paidDays = 0;
      impact.unpaidDays = totalDays;
      impact.remainingBalance = 0;
      impact.balanceAfter = 0;
      impact.willImpactSalary = true;
      impact.message = `All ${totalDays} day(s) will be marked as Unpaid Leave and deducted from your salary.`;
    } else {
      // Other leave types (Maternity, Paternity, Emergency, etc.) - typically don't deduct from balance
      impact.deductedFrom = formData.leaveType;
      impact.paidDays = totalDays;
      impact.unpaidDays = 0;
      impact.remainingBalance = 0;
      impact.balanceAfter = 0;
      impact.willImpactSalary = false;
      impact.message = `${totalDays} day(s) of ${formData.leaveType}. Check with HR for salary impact.`;
    }

    setLeaveImpact(impact);
  };

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
      // Get employee details for folder name and supervisor_id
      const { data: employee } = await getDocument("employees", employeeId);

      const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
      
      let fileUrl = null;

      // Upload file to R2 if selected
      if (selectedFile) {
        setUploadingFile(true);
        try {
          const formData = new FormData();
          formData.append('file', selectedFile);
          formData.append('folder', `leave-documents/${employeeName.replace(/\s+/g, '_')}`);

          const uploadResponse = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            throw new Error('File upload failed');
          }

          const uploadResult = await uploadResponse.json();
          fileUrl = uploadResult.url;
        } catch (fileError: any) {
          console.error('File upload error:', fileError);
          toast({
            title: "Warning",
            description: "Leave request submitted but file upload failed. You can resubmit the document later.",
          });
        } finally {
          setUploadingFile(false);
        }
      }

      // Get employee's supervisor_id
      const supervisor_id = employee?.supervisor_id || null;

      // Calculate total days requested
      const days_requested = calculateLeaveDays(formData.startDate, formData.endDate);

      // Create leave request in Firestore
      const { error } = await createDocument("leave_requests", {
        employee_id: employeeId,
        supervisor_id: supervisor_id,
        start_date: formData.startDate,
        end_date: formData.endDate,
        leave_type: formData.leaveType,
        reason: formData.reason,
        days_requested: days_requested,
        status: supervisor_id ? "pending_supervisor" : "pending_admin",
        supervisor_approved: false,
        admin_approved: false,
        supporting_document_url: fileUrl,
        created_at: new Date(),
        updated_at: new Date(),
      });

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

      {/* Leave Impact Calculation Display */}
      {leaveImpact && (
        <Card className="border-2">
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold text-sm">Leave Balance Impact</h4>
                
                {/* Summary Row */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Total Days:</span>
                    <span className="font-semibold">{leaveImpact.totalDays}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Deducted From:</span>
                    <span className="font-semibold">{leaveImpact.deductedFrom}</span>
                  </div>
                </div>

                {/* Balance Details */}
                {leaveImpact.deductedFrom !== "Unpaid Leave" && leaveImpact.remainingBalance > 0 && (
                  <div className="text-sm space-y-1 bg-gray-50 p-3 rounded">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Balance:</span>
                      <span className="font-medium">{leaveImpact.remainingBalance} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">After Approval:</span>
                      <span className={`font-semibold ${leaveImpact.balanceAfter < 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        {leaveImpact.balanceAfter} days
                      </span>
                    </div>
                  </div>
                )}

                {/* Impact Message */}
                {leaveImpact.willImpactSalary ? (
                  <Alert variant="destructive" className="py-3">
                    <AlertCircle className="h-4 w-4" />
                    <div className="ml-2">
                      <div className="font-semibold text-sm">Salary Impact Warning</div>
                      <div className="text-sm mt-1">{leaveImpact.message}</div>
                      {leaveImpact.paidDays > 0 && leaveImpact.unpaidDays > 0 && (
                        <div className="mt-2 text-xs space-y-1">
                          <div>✓ Paid: {leaveImpact.paidDays} days</div>
                          <div>✗ Unpaid: {leaveImpact.unpaidDays} days (salary will be deducted)</div>
                        </div>
                      )}
                    </div>
                  </Alert>
                ) : (
                  <Alert className="py-3 bg-green-50 border-green-200">
                    <Info className="h-4 w-4 text-green-600" />
                    <div className="ml-2">
                      <div className="font-semibold text-sm text-green-800">No Salary Impact</div>
                      <div className="text-sm text-green-700 mt-1">{leaveImpact.message}</div>
                    </div>
                  </Alert>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

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
