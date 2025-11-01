import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Calendar, LogOut } from "lucide-react";
import AddEmployeeForm from "@/components/admin/AddEmployeeForm";
import EmployeeList from "@/components/admin/EmployeeList";
import LeaveRequests from "@/components/admin/LeaveRequests";
import ProjectManager from "@/components/admin/ProjectManager";
import CareerManager from "@/components/admin/CareerManager";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    activeEmployees: 0,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { count: employeesCount } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true });

      const { count: activeCount } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("employment_status", "Active" as any);

      const { count: pendingCount } = await supabase
        .from("attendance")
        .select("*", { count: "exact", head: true })
        .eq("status", "Leave" as any)
        .eq("admin_approved", false);

      setStats({
        totalEmployees: employeesCount || 0,
        activeEmployees: activeCount || 0,
        pendingLeaves: pendingCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">BIMaided Admin Portal</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="text-primary" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalEmployees}</div>
            </CardContent>
          </Card>
          
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
              <UserPlus className="text-primary" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeEmployees}</div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Leave Requests</CardTitle>
              <Calendar className="text-primary" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingLeaves}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="add-employee">Add Employee</TabsTrigger>
            <TabsTrigger value="leave-requests">Leave Requests</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="careers">Career Postings</TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Employee List</CardTitle>
                <CardDescription>Manage your organization's employees</CardDescription>
              </CardHeader>
              <CardContent>
                <EmployeeList onUpdate={fetchStats} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-employee">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Add New Employee</CardTitle>
                <CardDescription>Create a new employee account</CardDescription>
              </CardHeader>
              <CardContent>
                <AddEmployeeForm onSuccess={fetchStats} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leave-requests">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Leave Requests</CardTitle>
                <CardDescription>Review and approve employee leave requests</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaveRequests onUpdate={fetchStats} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Project Management</CardTitle>
                <CardDescription>Add and manage projects for the website portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="careers">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Career Postings</CardTitle>
                <CardDescription>Manage job openings on the careers page</CardDescription>
              </CardHeader>
              <CardContent>
                <CareerManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
