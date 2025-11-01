import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";

interface SupervisorLeaveRequestsProps {
  supervisorId: string;
  onUpdate: () => void;
}

const SupervisorLeaveRequests = ({ supervisorId, onUpdate }: SupervisorLeaveRequestsProps) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaveRequests();
  }, [supervisorId]);

  const fetchLeaveRequests = async () => {
    try {
      // Get employees supervised by this supervisor
      const { data: supervisedEmployees } = await supabase
        .from("employees")
        .select("id")
        .eq("supervisor_id", supervisorId);

      if (!supervisedEmployees || supervisedEmployees.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const employeeIds = supervisedEmployees.map(e => e.id);

      const { data, error } = await supabase
        .from("attendance")
        .select(`
          *,
          employees(first_name, last_name, email, designations(name))
        `)
        .eq("status", "Leave" as any)
        .in("employee_id", employeeIds)
        .order("date", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("attendance")
        .update({
          supervisor_approved: true,
          supervisor_approved_at: new Date().toISOString(),
          supervisor_approved_by: supervisorId,
        } as any)
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Leave approved",
        description: "The leave request has been approved and sent to admin for final approval.",
      });

      fetchLeaveRequests();
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("attendance")
        .delete()
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Leave rejected",
        description: "The leave request has been rejected.",
      });

      fetchLeaveRequests();
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading leave requests...</div>;
  }

  if (requests.length === 0) {
    return <div className="text-muted-foreground">No leave requests from your team members.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Leave Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">
                {request.employees?.first_name} {request.employees?.last_name}
              </TableCell>
              <TableCell>{request.employees?.designations?.name || "N/A"}</TableCell>
              <TableCell>{request.leave_type}</TableCell>
              <TableCell>{new Date(request.date).toLocaleDateString()}</TableCell>
              <TableCell>{request.leave_reason || "N/A"}</TableCell>
              <TableCell>
                {request.supervisor_approved && request.admin_approved ? (
                  <Badge variant="default">Fully Approved</Badge>
                ) : request.supervisor_approved ? (
                  <Badge variant="secondary">Pending Admin</Badge>
                ) : (
                  <Badge variant="secondary">Pending Your Approval</Badge>
                )}
              </TableCell>
              <TableCell>
                {!request.supervisor_approved && !request.admin_approved && (
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
                      onClick={() => handleReject(request.id)}
                    >
                      <X size={16} className="mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SupervisorLeaveRequests;
