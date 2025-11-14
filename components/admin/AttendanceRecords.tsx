import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, Calendar, Users, Clock } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import * as XLSX from 'xlsx';

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  total_hours: number | null;
  manually_added: boolean | null;
  ip_address: string | null;
  employees: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
}

const AttendanceRecords = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMonthlyView, setShowMonthlyView] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    leave: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTodayAttendance();
    if (showMonthlyView) {
      fetchAttendanceRecords();
    }
  }, [selectedMonth, showMonthlyView]);

  const fetchTodayAttendance = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      
      const response = await fetch(`/api/attendance?date=${today}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch today\'s attendance');
      }

      const data = result.data || [];
      setTodayRecords(data);

      // Calculate stats from today's records
      const total = data.length;
      const present = data.filter((r: any) => r.status === "Present").length;
      const absent = data.filter((r: any) => r.status === "Absent").length;
      const leave = data.filter((r: any) => r.status === "Leave").length;

      setStats({ total, present, absent, leave });
    } catch (error: any) {
      console.error("Error fetching today's attendance:", error);
    }
  };

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    try {
      const startDate = format(startOfMonth(selectedMonth), "yyyy-MM-dd");
      const endDate = format(endOfMonth(selectedMonth), "yyyy-MM-dd");

      const response = await fetch(`/api/attendance?start_date=${startDate}&end_date=${endDate}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch attendance records');
      }

      const data = result.data || [];
      setRecords(data);

      // Calculate stats
      const total = data.length;
      const present = data.filter((r: any) => r.status === "Present").length;
      const absent = data.filter((r: any) => r.status === "Absent").length;
      const leave = data.filter((r: any) => r.status === "Leave").length;

      setStats({ total, present, absent, leave });
    } catch (error: any) {
      console.error("Error fetching attendance records:", error);
      toast({
        title: "Error",
        description: "Failed to load attendance records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = records.map((record) => ({
        Date: format(new Date(record.date), "yyyy-MM-dd"),
        "Employee Name": record.employees 
          ? `${record.employees.first_name} ${record.employees.last_name}`
          : "Unknown",
        Status: record.status,
        "Check In": record.check_in_time
          ? format(new Date(record.check_in_time), "hh:mm a")
          : "-",
        "Check Out": record.check_out_time
          ? format(new Date(record.check_out_time), "hh:mm a")
          : "-",
        "Total Hours": record.total_hours ? record.total_hours.toFixed(2) : "-",
        "IP Address": record.ip_address || "-",
        "Manual Entry": record.manually_added ? "Yes" : "No",
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      ws["!cols"] = [
        { wch: 12 }, // Date
        { wch: 12 }, // Employee ID
        { wch: 25 }, // Employee Name
        { wch: 10 }, // Status
        { wch: 12 }, // Check In
        { wch: 12 }, // Check Out
        { wch: 12 }, // Total Hours
        { wch: 18 }, // IP Address
        { wch: 12 }, // Manual Entry
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Attendance");

      // Save file
      const fileName = `Attendance_${format(selectedMonth, "MMMM_yyyy")}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: "Export Successful",
        description: `Attendance data exported to ${fileName}`,
      });
    } catch (error: any) {
      console.error("Error exporting to Excel:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export attendance data",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      Present: "default",
      Absent: "destructive",
      Leave: "secondary",
      Late: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    setSelectedMonth((current) =>
      direction === "prev" ? subMonths(current, 1) : subMonths(current, -1)
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Calendar className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-500">{stats.leave}</div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
          <CardDescription>
            {format(new Date(), "EEEE, MMMM d, yyyy")} - {todayRecords.length} employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No attendance records for today yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {record.employees 
                            ? `${record.employees.first_name || ''} ${record.employees.last_name || ''}`.trim() 
                            : <span className="text-muted-foreground italic">Unknown Employee</span>
                          }
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      {record.check_in_time
                        ? format(new Date(record.check_in_time), "hh:mm a")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {record.check_out_time
                        ? format(new Date(record.check_out_time), "hh:mm a")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {record.total_hours ? `${record.total_hours.toFixed(2)}h` : "-"}
                    </TableCell>
                    <TableCell>
                      {record.manually_added ? (
                        <Badge variant="outline">Manual</Badge>
                      ) : (
                        <Badge variant="secondary">Auto</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Monthly Attendance Records */}
      {showMonthlyView && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>
                  View and export monthly attendance data
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMonthlyView(false)}
                >
                  Back to Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMonthChange("prev")}
                >
                  Previous
                </Button>
                <div className="px-4 py-2 bg-muted rounded-md text-sm font-medium">
                  {format(selectedMonth, "MMMM yyyy")}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMonthChange("next")}
                  disabled={selectedMonth >= new Date()}
                >
                  Next
                </Button>
                <Button onClick={exportToExcel} disabled={records.length === 0}>
                  <Download className="mr-2" size={16} />
                  Export Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading attendance records...
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No attendance records found for this month.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{format(new Date(record.date), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {record.employees 
                            ? `${record.employees.first_name || ''} ${record.employees.last_name || ''}`.trim() 
                            : <span className="text-muted-foreground italic">Unknown Employee</span>
                          }
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      {record.check_in_time
                        ? format(new Date(record.check_in_time), "hh:mm a")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {record.check_out_time
                        ? format(new Date(record.check_out_time), "hh:mm a")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {record.total_hours ? `${record.total_hours.toFixed(2)}h` : "-"}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono">
                        {record.ip_address || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {record.manually_added ? (
                        <Badge variant="outline">Manual</Badge>
                      ) : (
                        <Badge variant="secondary">Auto</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      )}

      {/* Button to view other dates */}
      {!showMonthlyView && (
        <div className="text-center">
          <Button 
            onClick={() => setShowMonthlyView(true)} 
            variant="outline"
            size="lg"
          >
            <Calendar className="mr-2" size={16} />
            View Other Dates
          </Button>
        </div>
      )}
    </div>
  );
};

export default AttendanceRecords;
