"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { User, Calendar, FileText, LogOut, Briefcase, Users, ClipboardList, CheckCircle, History, PartyPopper, ListTodo } from "lucide-react";
import EmployeeProfile from "@/components/employee/EmployeeProfile";
import LeaveRequestForm from "@/components/employee/LeaveRequestForm";
import LeaveBalanceDisplay from "@/components/employee/LeaveBalanceDisplay";
import AttendanceHistory from "@/components/employee/AttendanceHistory";
import SupervisorLeaveApprovals from "@/components/employee/SupervisorLeaveApprovals";
import MyAssignments from "@/components/employee/MyAssignments";
import SupervisorAssignmentTeams from "@/components/employee/SupervisorAssignmentTeams";
import HolidayCalendar from "@/components/employee/HolidayCalendar";
import AttendanceCheckIn from "@/components/employee/AttendanceCheckIn";
import TeamOverview from "@/components/employee/TeamOverview";

export default function EmployeeDashboard() {
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [leaveBalance, setLeaveBalance] = useState<any>(null);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [isAssignmentSupervisor, setIsAssignmentSupervisor] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Use authentication hook with employee role requirement
  const { isLoading: authLoading, isAuthenticated, user: authUser } = useAuth({
    requiredRole: 'employee',
    redirectTo: '/login'
  });

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, return null (useAuth hook will handle redirect)
  if (!isAuthenticated) {
    return null;
  }

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    let authUnsubscribe: (() => void) | null = null;

    const fetchData = async () => {
      try {
        console.log("Starting employee data fetch...");
        
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isMounted && loading) {
            console.error("Employee data fetch timed out");
            toast({
              title: "Loading timeout",
              description: "Unable to load employee data. Please try refreshing the page.",
              variant: "destructive",
            });
            setLoading(false);
          }
        }, 10000); // 10 second timeout
        
        // Import Firebase auth functions
        const { getCurrentUser, onAuthStateChanged } = await import('@/lib/firebase/auth');
        
        // Wait for auth to initialize properly
        console.log("Waiting for Firebase Auth to initialize...");
        
        const user = await new Promise<any>((resolve) => {
          // First, check if user is already available
          const currentUser = getCurrentUser();
          if (currentUser) {
            console.log("User already authenticated:", currentUser.uid);
            resolve(currentUser);
            return;
          }
          
          // If not, wait for auth state change (max 5 seconds)
          console.log("Waiting for auth state change...");
          let authTimeout: NodeJS.Timeout;
          
          authUnsubscribe = onAuthStateChanged((user) => {
            clearTimeout(authTimeout);
            console.log("Auth state changed:", user ? user.uid : "no user");
            resolve(user);
          });
          
          // Timeout after 5 seconds if no auth state change
          authTimeout = setTimeout(() => {
            console.log("Auth state timeout, no user detected");
            resolve(null);
          }, 5000);
        });
        
        console.log("Current user:", user ? user.uid : "No user found");
        
        if (!user) {
          console.error("No user found, redirecting to login");
          if (isMounted) {
            setLoading(false);
            toast({
              title: "Authentication required",
              description: "Please log in to access the employee portal.",
              variant: "destructive",
            });
            router.push("/login");
          }
          return;
        }

        if (!isMounted) return;

        // Fetch employee data from Firestore
        const { getDocuments } = await import('@/lib/firebase/firestore');
        const { where } = await import('firebase/firestore');
        
        console.log("Fetching employee data for auth_uid:", user.uid);
        
        const { data: employees, error } = await getDocuments('employees', [
          where('auth_uid', '==', user.uid)
        ]);
        
        if (error) {
          console.error("Error fetching employee data:", error);
          throw error;
        }
        
        console.log("Employees found:", employees ? employees.length : 0);
        
        if (!employees || employees.length === 0) {
          console.error("No employee record found for user:", user.uid);
          if (isMounted) {
            toast({
              title: "Employee record not found",
              description: "No employee record is associated with your account. Please contact your administrator.",
              variant: "destructive",
            });
            setLoading(false);
          }
          return;
        }
        
        if (employees && employees.length > 0 && isMounted) {
          const employee = employees[0];
          console.log("Employee data loaded:", employee.id);
          setEmployeeData(employee);
          
          // Check if user is a supervisor
          console.log("Checking supervisor status for employee ID:", employee.id);
          const { data: supervisedEmployees } = await getDocuments('employees', [
            where('supervisor_id', '==', employee.id)
          ]);
          console.log("Supervised employees found:", supervisedEmployees?.length || 0);
          
          // Also check if employee is in management/executive roles
          const isManagementRole = employee.department?.toLowerCase().includes('management') || 
                                   employee.department?.toLowerCase().includes('executive') ||
                                   employee.designation?.toLowerCase().includes('manager');
          
          const hasSupervisedEmployees = supervisedEmployees && supervisedEmployees.length > 0;
          console.log("Is management role:", isManagementRole);
          console.log("Has supervised employees:", hasSupervisedEmployees);
          
          // Set supervisor status if they have team members OR are in management role
          setIsSupervisor(hasSupervisedEmployees || isManagementRole);
          
          // Check if user is an assignment supervisor
          const { data: supervisedAssignments } = await getDocuments('assignments', [
            where('supervisor_id', '==', employee.id)
          ]);
          setIsAssignmentSupervisor(supervisedAssignments && supervisedAssignments.length > 0);
        }
        
        if (isMounted) {
          clearTimeout(timeoutId);
          setLoading(false);
          console.log("Employee data fetch complete");
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
        if (isMounted) {
          clearTimeout(timeoutId);
          toast({
            title: "Error loading data",
            description: "Failed to load employee data. Please try refreshing the page.",
            variant: "destructive",
          });
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (authUnsubscribe) authUnsubscribe();
    };
  }, [router, toast]);

  const fetchEmployeeData = async () => {
    try {
      // TODO: Migrate to Firebase - temporarily disabled
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
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

  const handleLogoutOld = async () => {
    // TODO: Remove after testing
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading employee data...</p>
          <p className="text-sm text-muted-foreground mt-2">This should only take a moment</p>
        </div>
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Employee Record Not Found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find an employee record associated with your account. 
            This may be because:
          </p>
          <ul className="text-left text-sm text-muted-foreground mb-6 space-y-2">
            <li>• Your employee account hasn't been created yet</li>
            <li>• Your employee record is not linked to your login account</li>
            <li>• There was an error during account setup</li>
          </ul>
          <p className="text-sm text-muted-foreground mb-6">
            Please contact your administrator to link your employee record to your account.
          </p>
          <div className="space-y-2">
            <Button onClick={() => window.location.reload()} className="w-full">
              Retry
            </Button>
            <Button variant="outline" onClick={handleLogout} className="w-full">
              Logout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <img 
            src="/Logo-BIMaided.png" 
            alt="BIM aided Logo" 
            className="h-12 md:h-14 w-auto object-contain"
          />
          <Button variant="outline" onClick={handleLogout}>
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <Card className="mb-8 border-border bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                {employeeData.profileImageUrl ? (
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-background p-1">
                      <img 
                        src={employeeData.profileImageUrl} 
                        alt={`${employeeData.firstName || employeeData.first_name} ${employeeData.lastName || employeeData.last_name}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-background p-1">
                    <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                      <User size={48} className="text-primary" />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Welcome Text */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">
                  Welcome, {employeeData.firstName || employeeData.first_name} {employeeData.lastName || employeeData.last_name}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-1.5 bg-background/80 px-3 py-1.5 rounded-md">
                    <Briefcase size={16} className="text-primary" />
                    <span className="font-medium">{employeeData.designation || employeeData.designations?.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-background/80 px-3 py-1.5 rounded-md">
                    <Users size={16} className="text-primary" />
                    <span className="font-medium">{employeeData.department || employeeData.departments?.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-background/80 px-3 py-1.5 rounded-md">
                    <User size={16} className="text-primary" />
                    <span className="font-medium">EID: {employeeData.eid || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
        <Tabs defaultValue="assignments" className="space-y-4">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="assignments" className="gap-2">
              <ListTodo size={16} />
              My Assignments
            </TabsTrigger>
            <TabsTrigger value="check-in" className="gap-2">
              <CheckCircle size={16} />
              Attendance Check-In
            </TabsTrigger>
            <TabsTrigger value="leave-request" className="gap-2">
              <FileText size={16} />
              Request Leave
            </TabsTrigger>
            <TabsTrigger value="attendance" className="gap-2">
              <History size={16} />
              Attendance History
            </TabsTrigger>
            {isSupervisor && (
              <TabsTrigger value="team-overview" className="gap-2 bg-primary/10 border-primary/20">
                <Users size={16} />
                My Team & Leave Approvals
              </TabsTrigger>
            )}
            {isAssignmentSupervisor && (
              <TabsTrigger value="supervised-assignments" className="gap-2">
                <ClipboardList size={16} />
                Supervised Assignments
              </TabsTrigger>
            )}
            <TabsTrigger value="holiday-calendar" className="gap-2">
              <PartyPopper size={16} />
              Holiday Calendar
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User size={16} />
              My Profile
            </TabsTrigger>
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

          <TabsContent value="team-overview">
            <TeamOverview managerId={employeeData.id} />
          </TabsContent>

          <TabsContent value="assignments">
            <MyAssignments />
          </TabsContent>

          <TabsContent value="supervised-assignments">
            <SupervisorAssignmentTeams />
          </TabsContent>

          <TabsContent value="leave-request">
            <div className="space-y-6">
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
              
              <LeaveBalanceDisplay employeeId={employeeData.id} />
            </div>
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
