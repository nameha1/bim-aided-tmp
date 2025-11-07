"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Calendar, FileText, LogOut, Briefcase, Users, ClipboardList } from "lucide-react";
import EmployeeProfile from "@/components/employee/EmployeeProfile";
import LeaveRequestForm from "@/components/employee/LeaveRequestForm";
import AttendanceHistory from "@/components/employee/AttendanceHistory";
import SupervisorLeaveRequests from "@/components/admin/SupervisorLeaveRequests";
import MyAssignments from "@/components/employee/MyAssignments";
import SupervisorAssignmentTeams from "@/components/employee/SupervisorAssignmentTeams";
import HolidayCalendar from "@/components/employee/HolidayCalendar";
import AttendanceCheckIn from "@/components/employee/AttendanceCheckIn";

export default function EmployeeDashboard() {
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [leaveBalance, setLeaveBalance] = useState<any>(null);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [isAssignmentSupervisor, setIsAssignmentSupervisor] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !isMounted) return;

        const { data: employee, error: empError } = await supabase
          .from("employees")
          .select(`
            *,
            departments!employees_department_id_fkey(name),
            designations(name)
          `)
          .eq("user_id", user.id)
          .single();

        if (empError) {
          console.error("Error fetching employee:", empError);
          if (isMounted) setLoading(false);
          return;
        }

        if (!isMounted) return;
        setEmployeeData(employee);

        // Check if this employee is a supervisor
        const { count } = await supabase
          .from("employees")
          .select("*", { count: "exact", head: true })
          .eq("supervisor_id", employee.id);

        if (isMounted) {
          setIsSupervisor((count || 0) > 0);
        }

        // Check if this employee is a supervisor for any assignments
        // Wrap in try-catch in case assignments table doesn't exist yet
        try {
          const { count: assignmentSupervisorCount, error: assignmentError } = await supabase
            .from("assignments" as any)
            .select("*", { count: "exact", head: true })
            .eq("supervisor_id", employee.id);

          if (!assignmentError && isMounted) {
            setIsAssignmentSupervisor((assignmentSupervisorCount || 0) > 0);
          }
        } catch (assignmentErr) {
          console.log("Assignments feature not yet available");
          if (isMounted) {
            setIsAssignmentSupervisor(false);
          }
        }

        const currentYear = new Date().getFullYear();
        const { data: balance } = await supabase
          .from("leave_balances")
          .select("*")
          .eq("employee_id", employee.id)
          .eq("year", currentYear)
          .single();

        if (isMounted) {
          setLeaveBalance(balance);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchEmployeeData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: employee } = await supabase
        .from("employees")
        .select(`
          *,
          departments!employees_department_id_fkey(name),
          designations(name)
        `)
        .eq("user_id", user.id)
        .single();

      setEmployeeData(employee);

      // Check if this employee is a supervisor
      const { count } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("supervisor_id", employee.id);

      setIsSupervisor((count || 0) > 0);

      const currentYear = new Date().getFullYear();
      const { data: balance } = await supabase
        .from("leave_balances")
        .select("*")
        .eq("employee_id", employee.id)
        .eq("year", currentYear)
        .single();

      setLeaveBalance(balance);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    router.push("/login");
  };

  if (loading || !employeeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading employee data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">BIMaided Employee Portal</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome, {employeeData.first_name} {employeeData.last_name}
          </h2>
          <p className="text-muted-foreground">
            {employeeData.designations?.name} | {employeeData.departments?.name}
          </p>
        </div>

        {/* Leave Balance Cards */}
        {leaveBalance && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Annual Leave</CardTitle>
                <Calendar className="text-primary" size={20} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {leaveBalance.annual_leave_total - leaveBalance.annual_leave_used} / {leaveBalance.annual_leave_total}
                </div>
                <p className="text-xs text-muted-foreground">Days remaining</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sick Leave</CardTitle>
                <FileText className="text-primary" size={20} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {leaveBalance.sick_leave_total - leaveBalance.sick_leave_used} / {leaveBalance.sick_leave_total}
                </div>
                <p className="text-xs text-muted-foreground">Days remaining</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Casual Leave</CardTitle>
                <Briefcase className="text-primary" size={20} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {leaveBalance.casual_leave_total - leaveBalance.casual_leave_used} / {leaveBalance.casual_leave_total}
                </div>
                <p className="text-xs text-muted-foreground">Days remaining</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="check-in">Attendance Check-In</TabsTrigger>
            <TabsTrigger value="assignments">My Assignments</TabsTrigger>
            {isAssignmentSupervisor && <TabsTrigger value="supervised-assignments">Supervised Assignments</TabsTrigger>}
            {isSupervisor && <TabsTrigger value="team-leaves">Team Leaves</TabsTrigger>}
            <TabsTrigger value="leave-request">Request Leave</TabsTrigger>
            <TabsTrigger value="attendance">Attendance History</TabsTrigger>
            <TabsTrigger value="holiday-calendar">Holiday Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>View and manage your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <EmployeeProfile employee={employeeData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="check-in">
            <AttendanceCheckIn employeeId={employeeData.id} />
          </TabsContent>

          <TabsContent value="assignments">
            <MyAssignments />
          </TabsContent>

          <TabsContent value="supervised-assignments">
            <SupervisorAssignmentTeams />
          </TabsContent>

          <TabsContent value="team-leaves">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Team Leave Requests</CardTitle>
                <CardDescription>Approve leave requests from your team members</CardDescription>
              </CardHeader>
              <CardContent>
                <SupervisorLeaveRequests 
                  supervisorId={employeeData.id}
                  onUpdate={fetchEmployeeData}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leave-request">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Request Leave</CardTitle>
                <CardDescription>Submit a new leave request</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaveRequestForm 
                  employeeId={employeeData.id} 
                  onSuccess={fetchEmployeeData}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Attendance History</CardTitle>
                <CardDescription>View your attendance and leave records</CardDescription>
              </CardHeader>
              <CardContent>
                <AttendanceHistory employeeId={employeeData.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="holiday-calendar">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Annual Holiday Calendar</CardTitle>
                <CardDescription>View company and public holidays for 2025-2026</CardDescription>
              </CardHeader>
              <CardContent>
                <HolidayCalendar />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
