import { useState, useEffect } from "react";
// TODO: Migrate to Firebase
import { supabase } from "@/lib/supabase-stub";
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
      const { data, error } = await supabase
        .from("attendance")
        .select(`
          *,
          employees!attendance_employee_id_fkey(first_name, last_name, email)
        `)
        .eq("status", "Leave" as any)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching leave requests:", error);
        toast({
          title: "Error loading leave requests",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      setRequests(data || []);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: employeeData } = await supabase
        .from("employees")
        .select("id")
        .eq("user_id", user.id)
        .single();

      const { error } = await supabase
        .from("attendance")
        .update({
          admin_approved: true,
          admin_approved_at: new Date().toISOString(),
          admin_approved_by: employeeData?.id,
        } as any)
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Leave approved",
        description: "The leave request has been fully approved.",
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
        description: "The leave request has been rejected and removed.",
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

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Leave Type</TableHead>
            <TableHead>Date</TableHead>
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
                {request.employees?.first_name} {request.employees?.last_name}
              </TableCell>
              <TableCell>{request.leave_type}</TableCell>
              <TableCell>{new Date(request.date).toLocaleDateString()}</TableCell>
              <TableCell>{request.leave_reason || "N/A"}</TableCell>
              <TableCell>
                {request.supporting_document_url ? (
                  <a
                    href={request.supporting_document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
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
                <Badge variant={request.supervisor_approved ? "default" : "secondary"}>
                  {request.supervisor_approved ? "Approved" : "Pending"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={request.admin_approved ? "default" : "secondary"}>
                  {request.admin_approved ? "Approved" : "Pending"}
                </Badge>
              </TableCell>
              <TableCell>
                {request.supervisor_approved && !request.admin_approved && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleApprove(request.id)}
                    >
                      <Check size={16} className="mr-1" />
                      Final Approve
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
                {request.admin_approved && (
                  <span className="text-sm text-muted-foreground">Completed</span>
                )}
                {!request.supervisor_approved && (
                  <span className="text-sm text-muted-foreground">Awaiting Supervisor</span>
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
