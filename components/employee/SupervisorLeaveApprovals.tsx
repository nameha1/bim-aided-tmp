import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, X, FileText, ExternalLink, Clock } from "lucide-react";
import { getDocuments, updateDocument } from "@/lib/firebase/firestore";
import { where } from "firebase/firestore";

interface SupervisorLeaveApprovalsProps {
  supervisorId: string;
}

const SupervisorLeaveApprovals = ({ supervisorId }: SupervisorLeaveApprovalsProps) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (supervisorId) {
      fetchLeaveRequests();
    }
  }, [supervisorId]);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      
      // Fetch leave requests where this user is the supervisor
      const { data: leaveRequests } = await getDocuments("leave_requests", [
        where("supervisor_id", "==", supervisorId)
      ]);

      if (leaveRequests) {
        // Fetch employee details for each request
        const requestsWithEmployees = await Promise.all(
          leaveRequests.map(async (request: any) => {
            const { data: employeeData } = await getDocuments("employees", [
              where("__name__", "==", request.employee_id)
            ]);
            
            const employee = employeeData?.[0];
            
            return {
              ...request,
              employee: employee ? {
                firstName: employee.firstName || employee.first_name,
                lastName: employee.lastName || employee.last_name,
                email: employee.email,
              } : null,
            };
          })
        );

        // Sort by created_at descending
        requestsWithEmployees.sort((a, b) => {
          const dateA = a.created_at?.toDate?.() || new Date(a.created_at);
          const dateB = b.created_at?.toDate?.() || new Date(b.created_at);
          return dateB.getTime() - dateA.getTime();
        });

        setRequests(requestsWithEmployees);
      }
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

  const handleApprove = async (requestId: string) => {
    try {
      setProcessingId(requestId);
      
      const { error } = await updateDocument("leave_requests", requestId, {
        supervisor_approved: true,
        supervisor_approved_at: new Date(),
        supervisor_approved_by: supervisorId,
        status: "pending_admin",
        updated_at: new Date(),
      });

      if (error) throw error;

      toast({
        title: "Leave request approved",
        description: "The request has been forwarded to admin for final approval.",
      });

      fetchLeaveRequests();
    } catch (error: any) {
      console.error("Error approving leave:", error);
      toast({
        title: "Error approving leave",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    try {
      setProcessingId(requestId);
      
      const { error } = await updateDocument("leave_requests", requestId, {
        supervisor_approved: false,
        supervisor_approved_at: new Date(),
        supervisor_approved_by: supervisorId,
        status: "rejected",
        rejection_reason: reason,
        rejected_by: "supervisor",
        updated_at: new Date(),
      });

      if (error) throw error;

      toast({
        title: "Leave request rejected",
        description: "The employee will be notified of the rejection.",
      });

      fetchLeaveRequests();
    } catch (error: any) {
      console.error("Error rejecting leave:", error);
      toast({
        title: "Error rejecting leave",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const pendingRequests = requests.filter(r => r.status === "pending_supervisor");
  const processedRequests = requests.filter(r => r.status !== "pending_supervisor");

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Clock className="animate-spin h-6 w-6 text-muted-foreground mr-2" />
            <span>Loading leave requests...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leave Approvals</CardTitle>
          <CardDescription>Review and approve leave requests from your team</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No leave requests to review at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Pending Approval ({pendingRequests.length})
            </CardTitle>
            <CardDescription>Leave requests awaiting your approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.employee ? `${request.employee.firstName} ${request.employee.lastName}` : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.leave_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {request.start_date && new Date(request.start_date).toLocaleDateString()}
                          {' - '}
                          {request.end_date && new Date(request.end_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm truncate">{request.reason || "No reason provided"}</div>
                      </TableCell>
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
                      <TableCell className="text-sm text-muted-foreground">
                        {request.created_at ? new Date(request.created_at.toDate?.() || request.created_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(request.id)}
                            disabled={processingId === request.id}
                          >
                            <Check size={16} className="mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(request.id)}
                            disabled={processingId === request.id}
                          >
                            <X size={16} className="mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processed Requests</CardTitle>
            <CardDescription>Leave requests you have already reviewed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Your Decision</TableHead>
                    <TableHead>Admin Status</TableHead>
                    <TableHead>Final Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.employee ? `${request.employee.firstName} ${request.employee.lastName}` : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.leave_type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {request.start_date && new Date(request.start_date).toLocaleDateString()}
                        {' - '}
                        {request.end_date && new Date(request.end_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={request.supervisor_approved ? "default" : "destructive"}>
                          {request.supervisor_approved ? "✓ Approved" : "✗ Rejected"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {request.supervisor_approved ? (
                          <Badge variant={request.admin_approved ? "default" : "secondary"}>
                            {request.admin_approved ? "✓ Approved" : "Pending"}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            request.status === "approved" ? "default" : 
                            request.status === "rejected" ? "destructive" : 
                            "secondary"
                          }
                        >
                          {request.status === "approved" ? "✓ Approved" : 
                           request.status === "rejected" ? "✗ Rejected" : 
                           "Pending Admin"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupervisorLeaveApprovals;
