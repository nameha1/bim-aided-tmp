import { useState, useEffect } from "react";
import { getDocuments } from "@/lib/firebase/firestore";
import { where, orderBy, limit } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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
      const { data, error } = await getDocuments("attendance", [
        where("employee_id", "==", employeeId),
        orderBy("date", "desc"),
        limit(30)
      ]);

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
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No attendance records found
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => {
              // Handle date conversion
              const dateStr = typeof record.date === 'string' 
                ? record.date 
                : record.date?.toDate?.() 
                ? format(record.date.toDate(), "MMM d, yyyy")
                : "N/A";

              // Handle check-in time
              const checkInTime = record.check_in_time?.toDate?.()
                ? format(record.check_in_time.toDate(), "h:mm a")
                : record.check_in_time || "N/A";

              // Handle check-out time
              const checkOutTime = record.check_out_time?.toDate?.()
                ? format(record.check_out_time.toDate(), "h:mm a")
                : record.check_out_time || "N/A";

              return (
                <TableRow key={record.id}>
                  <TableCell>{dateStr}</TableCell>
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
                  <TableCell>{checkInTime}</TableCell>
                  <TableCell>{checkOutTime}</TableCell>
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
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendanceHistory;
