import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Calendar, FileText, LogOut, Briefcase, Users } from "lucide-react";
import EmployeeProfile from "@/components/employee/EmployeeProfile";
import LeaveRequestForm from "@/components/employee/LeaveRequestForm";
import AttendanceHistory from "@/components/employee/AttendanceHistory";
import SupervisorLeaveRequests from "@/components/admin/SupervisorLeaveRequests";

const EmployeeDashboard = () => {
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [leaveBalance, setLeaveBalance] = useState<any>(null);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: employee } = await supabase
        .from("employees")
        .select("*, departments(name), designations(name)")
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
    navigate("/login");
  };

  if (!employeeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
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
            {isSupervisor && <TabsTrigger value="team-leaves">Team Leaves</TabsTrigger>}
            <TabsTrigger value="leave-request">Request Leave</TabsTrigger>
            <TabsTrigger value="attendance">Attendance History</TabsTrigger>
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
        </Tabs>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
