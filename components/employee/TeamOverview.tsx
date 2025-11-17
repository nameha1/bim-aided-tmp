import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDocuments } from "@/lib/firebase/firestore";
import { where, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Users, Calendar, Briefcase, Clock, ClipboardCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import SupervisorLeaveApprovals from "./SupervisorLeaveApprovals";

interface TeamOverviewProps {
  managerId: string;
}

const TeamOverview = ({ managerId }: TeamOverviewProps) => {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamAttendance, setTeamAttendance] = useState<any[]>([]);
  const [pendingAppealsCount, setPendingAppealsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeamData();
    fetchPendingAppeals();
  }, [managerId]);

  const fetchPendingAppeals = async () => {
    try {
      // Fetch leave requests with pending appeals
      const { data: leaveRequests } = await getDocuments("leave_requests", [
        where("supervisor_id", "==", managerId),
        where("status", "==", "rejected")
      ]);

      if (leaveRequests) {
        const appealsCount = leaveRequests.filter((req: any) => 
          req.appeal_message && !req.appeal_reviewed
        ).length;
        setPendingAppealsCount(appealsCount);
      }
    } catch (error) {
      console.error("Error fetching appeals count:", error);
    }
  };

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      // Fetch team members (employees reporting to this manager)
      const { data: members, error: membersError } = await getDocuments("employees", [
        where("supervisor_id", "==", managerId)
      ]);

      if (membersError) throw membersError;

      setTeamMembers(members || []);

      // Fetch today's attendance for team members
      if (members && members.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const memberIds = members.map(m => m.id);

        // Fetch attendance for all team members
        const { data: attendance } = await getDocuments("attendance", [
          where("date", "==", today)
        ]);

        // Filter for team members only
        const teamAttendanceData = (attendance || []).filter((att: any) =>
          memberIds.includes(att.employee_id)
        );

        setTeamAttendance(teamAttendanceData);
      }
    } catch (error: any) {
      console.error("Error fetching team data:", error);
      toast({
        title: "Error",
        description: "Failed to load team data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = teamMembers.find(m => m.id === employeeId);
    return employee ? `${employee.firstName || employee.first_name} ${employee.lastName || employee.last_name}` : "Unknown";
  };

  const getAttendanceStatus = (employeeId: string) => {
    const attendance = teamAttendance.find(att => att.employee_id === employeeId);
    if (!attendance) return { status: "Absent", color: "destructive" };
    if (attendance.check_out_time) return { status: "Completed", color: "default" };
    if (attendance.check_in_time) return { status: "Present", color: "secondary" };
    return { status: "Unknown", color: "outline" };
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      Present: "default",
      Absent: "destructive",
      Leave: "secondary",
      Late: "outline",
      Completed: "default",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading team data...
      </div>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <Users className="mx-auto mb-4" size={48} />
            <p>No team members found reporting to you.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">Direct reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {teamAttendance.filter(att => att.status === "Present" || att.check_in_time).length}
            </div>
            <p className="text-xs text-muted-foreground">Checked in</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Data Tabs */}
      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance">Today's Attendance</TabsTrigger>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="leave-approvals" className="gap-2">
            Leave Approvals
            {pendingAppealsCount > 0 && (
              <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">
                {pendingAppealsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
              <CardDescription>
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => {
                    const attendance = teamAttendance.find(att => att.employee_id === member.id);
                    const statusInfo = getAttendanceStatus(member.id);
                    
                    return (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.firstName || member.first_name} {member.lastName || member.last_name}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(attendance?.status || statusInfo.status)}
                        </TableCell>
                        <TableCell>
                          {attendance?.check_in_time 
                            ? format(attendance.check_in_time?.toDate?.() || new Date(attendance.check_in_time), "h:mm a")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {attendance?.check_out_time 
                            ? format(attendance.check_out_time?.toDate?.() || new Date(attendance.check_out_time), "h:mm a")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {attendance?.remote_checkout ? (
                            <Badge variant="outline">Remote</Badge>
                          ) : attendance?.check_in_time ? (
                            <Badge variant="secondary">Office</Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Employees reporting to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.firstName || member.first_name} {member.lastName || member.last_name}
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.department || "—"}</TableCell>
                      <TableCell>{member.designation || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={member.status === "active" ? "default" : "secondary"}>
                          {member.status || member.employmentStatus || "Active"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave-approvals">
          <SupervisorLeaveApprovals supervisorId={managerId} onUpdate={fetchPendingAppeals} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamOverview;
