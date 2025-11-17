import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, FileText, ExternalLink, Info, AlertCircle, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";

interface LeaveRequestsProps {
  onUpdate: () => void;
}

const LeaveRequests = ({ onUpdate }: LeaveRequestsProps) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  useEffect(() => {
    filterRequestsByMonth();
  }, [selectedMonth, filterStatus, allRequests]);

  const fetchLeaveRequests = async () => {
    try {
      // Fetch all leave requests (not just admin pending)
      const response = await fetch('/api/leave-requests');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch leave requests');
      }

      setAllRequests(result.data || []);
    } catch (error: any) {
      console.error("Error fetching leave requests:", error);
      toast({
        title: "Error loading leave requests",
        description: error?.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRequestsByMonth = () => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);

    let filtered = allRequests.filter((request) => {
      // Parse the start_date to check if it falls within the selected month
      const requestDate = new Date(request.start_date);
      return requestDate >= monthStart && requestDate <= monthEnd;
    });

    // Apply status filter
    if (filterStatus === "pending") {
      filtered = filtered.filter(r => r.status === "pending_admin" || r.status === "pending_supervisor");
    } else if (filterStatus === "approved") {
      filtered = filtered.filter(r => r.status === "approved");
    } else if (filterStatus === "rejected") {
      filtered = filtered.filter(r => r.status === "rejected");
    }

    setRequests(filtered);
  };

  const handlePreviousMonth = () => {
    setSelectedMonth(subMonths(selectedMonth, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(addMonths(selectedMonth, 1));
  };

  const handleCurrentMonth = () => {
    setSelectedMonth(new Date());
  };

  const getLeaveTypeCategory = (leaveType: string) => {
    const paidLeaves = ['Sick Leave', 'Casual Leave', 'Earned Leave', 'Paid Leave', 'Maternity Leave'];
    const fractionalLeaves = ['Hourly Leave', 'Half Day Leave'];
    const unpaidLeaves = ['Unpaid Leave', 'Full Day Leave', 'Other Leave'];

    if (paidLeaves.includes(leaveType)) {
      return { category: 'Paid', color: 'bg-green-100 text-green-800', icon: '✓' };
    } else if (fractionalLeaves.includes(leaveType)) {
      return { category: 'Fractional', color: 'bg-blue-100 text-blue-800', icon: '½' };
    } else if (unpaidLeaves.includes(leaveType)) {
      return { category: 'Unpaid', color: 'bg-red-100 text-red-800', icon: '✗' };
    }
    return { category: 'Other', color: 'bg-gray-100 text-gray-800', icon: '?' };
  };

  const calculateLeaveDays = (request: any) => {
    if (!request.start_date || !request.end_date) return 'N/A';
    
    const days = request.days_requested || 0;
    const leaveType = request.leave_type;

    if (leaveType === 'Hourly Leave') {
      return `${days} hour(s)`;
    } else if (leaveType === 'Half Day Leave') {
      return `${days * 0.5} day(s)`;
    }
    return `${days} day(s)`;
  };

  const getSalaryImpactInfo = (request: any) => {
    const leaveType = request.leave_type;
    const days = request.days_requested || 0;
    
    if (['Sick Leave', 'Casual Leave', 'Earned Leave', 'Paid Leave', 'Maternity Leave'].includes(leaveType)) {
      return {
        impact: 'No salary impact (within balance)',
        severity: 'low',
        note: `Deducted from ${leaveType.toLowerCase()} balance. Will impact salary only if balance is exceeded.`
      };
    } else if (leaveType === 'Hourly Leave') {
      const fractionalDays = days / 8; // Assuming 8 hours = 1 day
      return {
        impact: `${fractionalDays.toFixed(2)} day(s) from casual leave`,
        severity: 'medium',
        note: 'Hourly leaves are converted to fractional days and deducted from casual leave balance.'
      };
    } else if (leaveType === 'Half Day Leave') {
      const fractionalDays = days * 0.5;
      return {
        impact: `${fractionalDays} day(s) from casual leave`,
        severity: 'medium',
        note: 'Half-day leaves count as 0.5 days each, deducted from casual leave balance.'
      };
    } else if (['Unpaid Leave', 'Full Day Leave', 'Other Leave'].includes(leaveType)) {
      return {
        impact: `${days} day(s) salary deduction`,
        severity: 'high',
        note: 'This leave type directly impacts salary at the daily rate.'
      };
    }
    return {
      impact: 'Unknown',
      severity: 'medium',
      note: 'Impact calculation not available for this leave type.'
    };
  };

    const handleApprove = async (id: string) => {
    try {
      const response = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve',
          requestId: id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to approve leave request');
      }

      toast({
        title: "Leave request approved",
        description: "The leave request has been approved successfully",
      });

      fetchLeaveRequests();
    } catch (error: any) {
      console.error("Error approving leave:", error);
      toast({
        title: "Error approving leave",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      const response = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject',
          requestId: id,
          reason: reason,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to reject leave request');
      }

      toast({
        title: "Leave request rejected",
        description: "The leave request has been rejected",
      });

      fetchLeaveRequests();
    } catch (error: any) {
      console.error("Error rejecting leave:", error);
      toast({
        title: "Error rejecting leave",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading leave requests...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Month and Status Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-gray-50 p-4 rounded-lg border">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by Month:</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-4 py-2 bg-white rounded-md border text-sm font-medium min-w-[140px] text-center">
              {format(selectedMonth, "MMMM yyyy")}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
              disabled={selectedMonth >= new Date()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCurrentMonth}
            >
              Today
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Requests" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-500">
            ({requests.length} {requests.length === 1 ? 'request' : 'requests'})
          </span>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Date Range</TableHead>
              <TableHead>Salary Impact</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Supervisor</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No leave requests found for {format(selectedMonth, "MMMM yyyy")}
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => {
            const typeInfo = getLeaveTypeCategory(request.leave_type);
            const salaryImpact = getSalaryImpactInfo(request);
            
            return (
              <TableRow key={request.id}>
              <TableCell className="font-medium">
                {request.employee ? `${request.employee.firstName} ${request.employee.lastName}` : 'Unknown'}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{request.leave_type}</span>
                  <Badge className={`${typeInfo.color} w-fit text-xs`}>
                    {typeInfo.icon} {typeInfo.category}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {calculateLeaveDays(request)}
              </TableCell>
              <TableCell>
                {request.start_date && new Date(request.start_date).toLocaleDateString()} - {request.end_date && new Date(request.end_date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 p-2">
                      <div className="flex items-center gap-1">
                        {salaryImpact.severity === 'high' && <AlertCircle className="h-4 w-4 text-red-500" />}
                        {salaryImpact.severity === 'medium' && <Info className="h-4 w-4 text-blue-500" />}
                        {salaryImpact.severity === 'low' && <Check className="h-4 w-4 text-green-500" />}
                        <span className="text-xs">{salaryImpact.impact}</span>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Salary Impact Details</h4>
                      <p className="text-sm text-muted-foreground">{salaryImpact.note}</p>
                      {request.appeal_message && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-xs font-semibold text-yellow-800">⚠️ Has Appeal</p>
                          <p className="text-xs text-yellow-700 mt-1">{request.appeal_message}</p>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </TableCell>
              <TableCell>{request.reason || "N/A"}</TableCell>
              <TableCell>
                {request.supporting_document_url ? (
                  <a
                    href={request.supporting_document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-cyan-500 hover:text-blue-800 hover:underline"
                  >
                    <FileText size={16} />
                    <span className="text-sm">View</span>
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="text-sm text-gray-400">No document</span>
                )}
              </TableCell>
              <TableCell>
                {request.supervisor_id ? (
                  <Badge variant={request.supervisor_approved ? "default" : "secondary"}>
                    {request.supervisor_approved ? "✓ Approved" : "Pending"}
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">N/A</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={request.admin_approved ? "default" : request.status === "rejected" ? "destructive" : "secondary"}>
                  {request.admin_approved ? "✓ Approved" : request.status === "rejected" ? "✗ Rejected" : "Pending"}
                </Badge>
              </TableCell>
              <TableCell>
                {request.status === "pending_admin" && request.supervisor_approved && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleApprove(request.id)}
                    >
                      <Check size={16} className="mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        const reason = prompt("Please provide a reason for rejection:");
                        if (reason) handleReject(request.id, reason);
                      }}
                    >
                      <X size={16} className="mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
                {!request.supervisor_approved && request.supervisor_id && (
                  <span className="text-sm text-muted-foreground">Awaiting supervisor approval</span>
                )}
                {request.admin_approved && (
                  <span className="text-sm text-muted-foreground">✓ Approved</span>
                )}
                {request.status === "rejected" && (
                  <span className="text-sm text-muted-foreground">✗ Rejected{request.rejection_reason ? `: ${request.rejection_reason}` : ''}</span>
                )}
              </TableCell>
              </TableRow>
            );
          })
            )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
};

export default LeaveRequests;
