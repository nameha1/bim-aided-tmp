import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AttendanceHistoryProps {
  employeeId: string;
}

const AttendanceHistory = ({ employeeId }: AttendanceHistoryProps) => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceHistory();
  }, [employeeId]);

  const fetchAttendanceHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("employee_id", employeeId)
        .order("date", { ascending: false })
        .limit(30);

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching attendance history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading attendance history...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Leave Type</TableHead>
            <TableHead>Check In</TableHead>
            <TableHead>Check Out</TableHead>
            <TableHead>Approval Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    record.status === "Present"
                      ? "default"
                      : record.status === "Leave"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {record.status}
                </Badge>
              </TableCell>
              <TableCell>{record.leave_type || "N/A"}</TableCell>
              <TableCell>{record.check_in_time || "N/A"}</TableCell>
              <TableCell>{record.check_out_time || "N/A"}</TableCell>
              <TableCell>
                {record.status === "Leave" && (
                  record.supervisor_approved && record.admin_approved ? (
                    <Badge variant="default">Fully Approved</Badge>
                  ) : record.supervisor_approved ? (
                    <Badge variant="secondary">Pending Admin</Badge>
                  ) : (
                    <Badge variant="secondary">Pending Supervisor</Badge>
                  )
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendanceHistory;
