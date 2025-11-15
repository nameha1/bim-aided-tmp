"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Users, UserPlus, Calendar, LogOut, Briefcase, ClipboardList, Globe, DollarSign, Menu, X, FileText, Settings, Clock } from "lucide-react";
import AddEmployeeForm from "@/components/admin/AddEmployeeForm";
import EmployeeList from "@/components/admin/EmployeeList";
import LeaveRequests from "@/components/admin/LeaveRequests";
import LeavePolicyManager from "@/components/admin/LeavePolicyManager";
import AttendancePolicyManager from "@/components/admin/AttendancePolicyManager";
import HolidayManager from "@/components/admin/HolidayManager";
import ProjectManager from "@/components/admin/ProjectManager";
import CareerManager from "@/components/admin/CareerManager";
import ApplicationManager from "@/components/admin/ApplicationManager";
import AssignmentManager from "@/components/admin/AssignmentManager";
import ManualAttendanceEntry from "@/components/admin/ManualAttendanceEntry";
import IPWhitelistManager from "@/components/admin/IPWhitelistManager";
import AttendanceRecords from "@/components/admin/AttendanceRecords";
import ContactInquiriesManager from "@/components/admin/ContactInquiriesManager";
import PayrollManager from "@/components/admin/PayrollManager";
import { TransactionManager } from "@/components/admin/TransactionManager";
import InvoiceManager from "@/components/admin/InvoiceManager";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("employees");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    activeEmployees: 0,
    totalApplications: 0,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  // Authentication check - redirect if not authenticated or not admin
  const { isLoading: authLoading, isAuthenticated, role } = useAuth({
    requiredRole: 'admin',
    redirectTo: '/login'
  });

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or not admin, don't render (useAuth will redirect)
  if (!isAuthenticated || role !== 'admin') {
    return null;
  }

  // Wait for component to be ready before fetching data
  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady) {
      fetchStats();
    }
  }, [refreshKey, isReady]);

  const fetchStats = async () => {
    try {
      // Import Firebase functions dynamically to avoid server-side issues
      const { getDocuments } = await import("@/lib/firebase/firestore");
      const { where } = await import("firebase/firestore");

      // Fetch all employees
      const { data: allEmployees } = await getDocuments("employees");
      const totalEmployees = allEmployees?.length || 0;

      // Count active employees
      const { data: activeEmps } = await getDocuments("employees", [
        where("status", "==", "active")
      ]);
      const activeEmployees = activeEmps?.length || 0;

      // Fetch pending leave requests (only those needing admin approval)
      const { data: pendingLeavesData } = await getDocuments("leave_requests", [
        where("status", "==", "pending_admin")
      ]);
      const pendingLeaves = pendingLeavesData?.length || 0;

      // Fetch job applications
      const { data: applicationsData } = await getDocuments("job_applications");
      const totalApplications = applicationsData?.length || 0;

      setStats({
        totalEmployees,
        activeEmployees,
        pendingLeaves,
        totalApplications,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Keep default values on error
      setStats({
        totalEmployees: 0,
        activeEmployees: 0,
        pendingLeaves: 0,
        totalApplications: 0,
      });
    }
  };

  const handleEmployeeUpdate = () => {
    fetchStats();
    setRefreshKey((prev) => prev + 1);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden max-w-[100vw]">
      {/* Header with Logo */}
      <header className="border-b bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-50 w-full max-w-[100vw] overflow-x-hidden">
        <div className="w-full max-w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden flex-shrink-0"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>

          {/* Company Logo - Center on mobile, left on desktop */}
          <img 
            src="/Logo-BIMaided.png" 
            alt="BIM aided Logo" 
            className="h-10 md:h-14 w-auto object-contain flex-shrink-0"
          />
          
          {/* Logout Button - Right side */}
          <Button variant="outline" onClick={handleLogout} size="sm" className="md:size-default flex-shrink-0">
            <LogOut size={16} className="md:mr-2" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>
      </header>

      <div className="flex relative overflow-x-hidden w-full max-w-[100vw]">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <aside className={`
          ${isSidebarOpen ? 'fixed' : 'hidden md:block md:sticky'} top-0 left-0
          w-64 min-h-screen md:min-h-[calc(100vh-73px)] md:max-h-[calc(100vh-73px)]
          bg-white dark:bg-slate-900 border-r
          z-40 overflow-y-auto flex-shrink-0
        `}>
          <div className="p-4 space-y-6">
            {/* HR Section */}
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">HR</h2>
              <nav className="space-y-1">
                <Button
                  variant={activeTab === "employees" ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${activeTab === "employees" ? "bg-cyan-500 text-white hover:bg-cyan-600" : "hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-slate-800"}`}
                  onClick={() => {
                    setActiveTab("employees");
                    setIsSidebarOpen(false);
                  }}
                >
                  <Users size={18} />
                  <span>Employees</span>
                </Button>
                <Button
                  variant={activeTab === "add-employee" ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${activeTab === "add-employee" ? "bg-cyan-500 text-white hover:bg-cyan-600" : "hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-slate-800"}`}
                  onClick={() => {
                    setActiveTab("add-employee");
                    setIsSidebarOpen(false);
                  }}
                >
                  <UserPlus size={18} />
                  <span>Add Employee</span>
                </Button>
                <Button
                  variant={activeTab === "attendance" ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${activeTab === "attendance" ? "bg-cyan-500 text-white hover:bg-cyan-600" : "hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-slate-800"}`}
                  onClick={() => {
                    setActiveTab("attendance");
                    setIsSidebarOpen(false);
                  }}
                >
                  <Calendar size={18} />
                  <span>Attendance</span>
                </Button>
                <Button
                  variant={activeTab === "leave-requests" ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${activeTab === "leave-requests" ? "bg-cyan-500 text-white hover:bg-cyan-600" : "hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-slate-800"}`}
                  onClick={() => {
                    setActiveTab("leave-requests");
                    setIsSidebarOpen(false);
                  }}
                >
                  <Calendar size={18} />
                  <span>Leave Requests</span>
                </Button>
                <Button
                  variant={activeTab === "leave-policies" ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${activeTab === "leave-policies" ? "bg-cyan-500 text-white hover:bg-cyan-600" : "hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-slate-800"}`}
                  onClick={() => {
                    setActiveTab("leave-policies");
                    setIsSidebarOpen(false);
                  }}
                >
                  <Settings size={18} />
                  <span>Leave Policies</span>
                </Button>
                <Button
                  variant={activeTab === "attendance-policy" ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${activeTab === "attendance-policy" ? "bg-cyan-500 text-white hover:bg-cyan-600" : "hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-slate-800"}`}
                  onClick={() => {
                    setActiveTab("attendance-policy");
                    setIsSidebarOpen(false);
                  }}
                >
                  <Clock size={18} />
                  <span>Attendance Policy</span>
                </Button>
                <Button
                  variant={activeTab === "holidays" ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${activeTab === "holidays" ? "bg-cyan-500 text-white hover:bg-cyan-600" : "hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-slate-800"}`}
                  onClick={() => {
                    setActiveTab("holidays");
                    setIsSidebarOpen(false);
                  }}
                >
                  <Calendar size={18} />
                  <span>Holidays</span>
                </Button>
              </nav>
            </div>

            {/* Finance Section */}
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Finance</h2>
              <nav className="space-y-1">
                <Button
                  variant={activeTab === "invoices" ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${activeTab === "invoices" ? "bg-cyan-500 text-white hover:bg-cyan-600" : "hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-slate-800"}`}
                  onClick={() => {
                    setActiveTab("invoices");
                    setIsSidebarOpen(false);
                  }}
                >
                  <FileText size={18} />
                  <span>Invoices</span>
                </Button>
                <Button
                  variant={activeTab === "payroll" ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${activeTab === "payroll" ? "bg-cyan-500 text-white hover:bg-cyan-600" : "hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-slate-800"}`}
                  onClick={() => {
                    setActiveTab("payroll");
                    setIsSidebarOpen(false);
                  }}
                >
                  <DollarSign size={18} />
                  <span>Payroll</span>
                </Button>
                <Button
                  variant={activeTab === "transactions" ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${activeTab === "transactions" ? "bg-cyan-500 text-white hover:bg-cyan-600" : "hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-slate-800"}`}
                  onClick={() => {
                    setActiveTab("transactions");
                    setIsSidebarOpen(false);
                  }}
                >
                  <DollarSign size={18} />
                  <span>Transactions</span>
                </Button>
              </nav>
            </div>

            {/* Projects & Work Section */}
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Projects & Work</h2>
              <nav className="space-y-1">
                <Button
                  variant={activeTab === "projects" ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${activeTab === "projects" ? "bg-cyan-500 text-white hover:bg-cyan-600" : "hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-slate-800"}`}
                  onClick={() => {
                    setActiveTab("projects");
                    setIsSidebarOpen(false);
                  }}
                >
                  <Briefcase size={18} />
                  <span>Projects</span>
                </Button>
                <Button
                  variant={activeTab === "assignments" ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${activeTab === "assignments" ? "bg-cyan-500 text-white hover:bg-cyan-600" : "hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-slate-800"}`}
                  onClick={() => {
                    setActiveTab("assignments");
                    setIsSidebarOpen(false);
                  }}
                >
                  <ClipboardList size={18} />
                  <span>Assignments</span>
                </Button>
              </nav>
            </div>

            {/* Recruitment Section */}
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Recruitment</h2>
              <nav className="space-y-1">
                <Button
                  variant={activeTab === "careers" ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${activeTab === "careers" ? "bg-cyan-500 text-white hover:bg-cyan-600" : "hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-slate-800"}`}
                  onClick={() => {
                    setActiveTab("careers");
                    setIsSidebarOpen(false);
                  }}
                >
                  <Briefcase size={18} />
                  <span>Career Postings</span>
                </Button>
                <Button
                  variant={activeTab === "applications" ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${activeTab === "applications" ? "bg-cyan-500 text-white hover:bg-cyan-600" : "hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-slate-800"}`}
                  onClick={() => {
                    setActiveTab("applications");
                    setIsSidebarOpen(false);
                  }}
                >
                  <ClipboardList size={18} />
                  <span>Job Applications</span>
                </Button>
              </nav>
            </div>

            {/* Front Desk Section */}
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Front Desk</h2>
              <nav className="space-y-1">
                <Button
                  variant={activeTab === "contact-inquiries" ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${activeTab === "contact-inquiries" ? "bg-cyan-500 text-white hover:bg-cyan-600" : "hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-slate-800"}`}
                  onClick={() => {
                    setActiveTab("contact-inquiries");
                    setIsSidebarOpen(false);
                  }}
                >
                  <ClipboardList size={18} />
                  <span>Contact Inquiries</span>
                </Button>
              </nav>
            </div>

            {/* Settings Section */}
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Settings</h2>
              <nav className="space-y-1">
                <Button
                  variant={activeTab === "ip-whitelist" ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${activeTab === "ip-whitelist" ? "bg-cyan-500 text-white hover:bg-cyan-600" : "hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-slate-800"}`}
                  onClick={() => {
                    setActiveTab("ip-whitelist");
                    setIsSidebarOpen(false);
                  }}
                >
                  <Globe size={18} />
                  <span>IP Whitelist</span>
                </Button>
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-3 md:p-6 md:ml-0 overflow-x-hidden min-w-0">
          {/* Stats Cards - Only show for first 5 tabs */}
          {["employees", "add-employee", "attendance", "payroll", "leave-requests"].includes(activeTab) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
                <div className="p-1.5 md:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="text-cyan-500" size={16} />
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-2xl md:text-3xl font-bold text-cyan-500">
                  {stats.totalEmployees}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Registered in system</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Active Employees</CardTitle>
                <div className="p-1.5 md:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <UserPlus className="text-cyan-500" size={16} />
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-2xl md:text-3xl font-bold text-cyan-500">
                  {stats.activeEmployees}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Currently working</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Pending Leaves</CardTitle>
                <div className="p-1.5 md:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Calendar className="text-cyan-500" size={16} />
                </div>
              </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-2xl md:text-3xl font-bold text-cyan-500">
                {stats.pendingLeaves}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Job Applications</CardTitle>
              <div className="p-1.5 md:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Briefcase className="text-cyan-500" size={16} />
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-2xl md:text-3xl font-bold text-cyan-500">
                {stats.totalApplications}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total submissions</p>
            </CardContent>
          </Card>
          </div>
          )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="hidden">
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="add-employee">Add Employee</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="ip-whitelist">IP Whitelist</TabsTrigger>
            <TabsTrigger value="leave-requests">Leave Requests</TabsTrigger>
            <TabsTrigger value="leave-policies">Leave Policies</TabsTrigger>
            <TabsTrigger value="attendance-policy">Attendance Policy</TabsTrigger>
            <TabsTrigger value="holidays">Holiday Management</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="careers">Career Postings</TabsTrigger>
            <TabsTrigger value="applications">Job Applications</TabsTrigger>
            <TabsTrigger value="contact-inquiries">Contact Inquiries</TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Users className="text-cyan-500" size={24} />
                  Employee List
                </CardTitle>
                <CardDescription>Manage your organization's employees</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <EmployeeList key={refreshKey} onUpdate={handleEmployeeUpdate} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-employee">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="text-cyan-500" size={24} />
                  Add New Employee
                </CardTitle>
                <CardDescription>Create a new employee account</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <AddEmployeeForm onSuccess={handleEmployeeUpdate} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="text-cyan-500" size={24} />
                    Attendance Management
                  </CardTitle>
                  <CardDescription>View and manage employee attendance records</CardDescription>
                </div>
                <ManualAttendanceEntry onSuccess={() => setRefreshKey((prev) => prev + 1)} />
              </CardHeader>
              <CardContent className="pt-6">
                <AttendanceRecords key={refreshKey} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            <InvoiceManager />
          </TabsContent>

          <TabsContent value="payroll">
            <PayrollManager />
          </TabsContent>

          <TabsContent value="ip-whitelist">
            <IPWhitelistManager />
          </TabsContent>

          <TabsContent value="leave-requests">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="text-cyan-500" size={24} />
                  Leave Requests
                </CardTitle>
                <CardDescription>Review and approve employee leave requests</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <LeaveRequests onUpdate={fetchStats} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leave-policies">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="text-cyan-500" size={24} />
                  Leave Policies Configuration
                </CardTitle>
                <CardDescription>Define leave types, allowances, and salary impact rules</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <LeavePolicyManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance-policy">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="text-cyan-500" size={24} />
                  Attendance Policy Configuration
                </CardTitle>
                <CardDescription>Configure office hours, grace periods, and late arrival penalties</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <AttendancePolicyManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="holidays">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="text-cyan-500" size={24} />
                  Holiday Management
                </CardTitle>
                <CardDescription>Configure holidays and government off days that affect working days calculation</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <HolidayManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments">
            <AssignmentManager />
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="text-cyan-500" size={24} />
                  Project Management
                </CardTitle>
                <CardDescription>Add and manage projects for the website portfolio</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ProjectManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="careers">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="text-cyan-500" size={24} />
                  Career Postings
                </CardTitle>
                <CardDescription>Manage job openings on the careers page</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <CareerManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <ApplicationManager />
          </TabsContent>

          <TabsContent value="contact-inquiries">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="text-cyan-500" size={24} />
                  Contact Form Inquiries
                </CardTitle>
                <CardDescription>Manage and respond to website contact form submissions</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ContactInquiriesManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionManager />
          </TabsContent>
        </Tabs>
        </main>
      </div>
    </div>
  );
}
