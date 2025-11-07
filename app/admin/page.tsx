"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Calendar, LogOut, Briefcase, ClipboardList, Globe } from "lucide-react";
import AddEmployeeForm from "@/components/admin/AddEmployeeForm";
import EmployeeList from "@/components/admin/EmployeeList";
import LeaveRequests from "@/components/admin/LeaveRequests";
import ProjectManager from "@/components/admin/ProjectManager";
import CareerManager from "@/components/admin/CareerManager";
import ApplicationManager from "@/components/admin/ApplicationManager";
import AssignmentManager from "@/components/admin/AssignmentManager";
import ManualAttendanceEntry from "@/components/admin/ManualAttendanceEntry";
import IPWhitelistManager from "@/components/admin/IPWhitelistManager";
import AttendanceRecords from "@/components/admin/AttendanceRecords";
import ContactInquiriesManager from "@/components/admin/ContactInquiriesManager";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    activeEmployees: 0,
    totalApplications: 0,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

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

      // Get applications count (will work after migration is run)
      const { count: applicationsCount } = await supabase
        .from("job_applications" as any)
        .select("*", { count: "exact", head: true });

      setStats({
        totalEmployees: employeesCount || 0,
        activeEmployees: activeCount || 0,
        pendingLeaves: pendingCount || 0,
        totalApplications: applicationsCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleEmployeeUpdate = () => {
    fetchStats();
    setRefreshKey((prev) => prev + 1);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    router.push("/login");
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Job Applications</CardTitle>
              <Briefcase className="text-primary" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalApplications}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="add-employee">Add Employee</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="ip-whitelist">
              <Globe size={16} className="mr-2" />
              IP Whitelist
            </TabsTrigger>
            <TabsTrigger value="leave-requests">Leave Requests</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="careers">Career Postings</TabsTrigger>
            <TabsTrigger value="applications">Job Applications</TabsTrigger>
            <TabsTrigger value="contact-inquiries">Contact Inquiries</TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Employee List</CardTitle>
                <CardDescription>Manage your organization's employees</CardDescription>
              </CardHeader>
              <CardContent>
                <EmployeeList key={refreshKey} onUpdate={handleEmployeeUpdate} />
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
                <AddEmployeeForm onSuccess={handleEmployeeUpdate} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Attendance Management</CardTitle>
                  <CardDescription>View and manage employee attendance records</CardDescription>
                </div>
                <ManualAttendanceEntry onSuccess={() => setRefreshKey((prev) => prev + 1)} />
              </CardHeader>
              <CardContent>
                <AttendanceRecords key={refreshKey} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ip-whitelist">
            <IPWhitelistManager />
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

          <TabsContent value="assignments">
            <AssignmentManager />
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

          <TabsContent value="applications">
            <ApplicationManager />
          </TabsContent>

          <TabsContent value="contact-inquiries">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Contact Form Inquiries</CardTitle>
                <CardDescription>Manage and respond to website contact form submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <ContactInquiriesManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
