import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, FileText, ExternalLink } from "lucide-react";

interface LeaveRequestsProps {
  onUpdate: () => void;
}

const LeaveRequests = ({ onUpdate }: LeaveRequestsProps) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      // Only fetch requests that need admin approval (supervisor already approved or no supervisor)
      const response = await fetch('/api/leave-requests?admin_pending=true');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch leave requests');
      }

      setRequests(result.data || []);
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Leave Type</TableHead>
            <TableHead>Date Range</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Document</TableHead>
            <TableHead>Supervisor Status</TableHead>
            <TableHead>Admin Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">
                {request.employee ? `${request.employee.firstName} ${request.employee.lastName}` : 'Unknown'}
              </TableCell>
              <TableCell>{request.leave_type}</TableCell>
              <TableCell>
                {request.start_date && new Date(request.start_date).toLocaleDateString()} - {request.end_date && new Date(request.end_date).toLocaleDateString()}
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeaveRequests;
