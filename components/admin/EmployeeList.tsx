import { useState, useEffect } from "react";
import { getDocuments, deleteDocument, getDocument } from "@/lib/firebase/firestore";
import { where, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2, Shield, ShieldOff, Edit, Key, Mail, Calendar, Briefcase, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EditEmployeeDialog from "./EditEmployeeDialog";
import ViewEmployeeDialog from "./ViewEmployeeDialog";
import ResetPasswordDialog from "./ResetPasswordDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EmployeeListProps {
  onUpdate: () => void;
}

const EmployeeList = ({ onUpdate }: EmployeeListProps) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Wait for auth to initialize
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      // Fetch employees sorted by creation date
      const { data, error } = await getDocuments("employees", [
        orderBy("created_at", "desc")
      ]);

      if (error) {
        console.error("Error fetching employees:", error);
        toast({
          title: "Error loading employees",
          description: error.message || "Failed to load employees",
          variant: "destructive",
        });
        setEmployees([]);
        return;
      }

      // Fetch roles for each employee
      if (data && data.length > 0) {
        const employeesWithRoles = await Promise.all(
          data.map(async (emp) => {
            // The auth_uid should be stored directly in the employee document
            let authUid = emp.auth_uid;
            
            // If no auth_uid in employee doc, try to find it from users collection
            // (for backwards compatibility with older employee records)
            if (!authUid) {
              const { data: users } = await getDocuments("users", [
                where("employee_id", "==", emp.id)
              ]);
              
              // The auth_uid is the document ID in the users collection
              if (users && users.length > 0) {
                authUid = users[0].id;
              }
            }
            
            // Fetch role using auth_uid
            let roles: string[] = [];
            if (authUid) {
              const { data: roleDoc } = await getDocument("user_roles", authUid);
              if (roleDoc) {
                roles = [roleDoc.role];
              }
            }
            
            return {
              ...emp,
              user_id: authUid, // For compatibility with components
              auth_uid: authUid, // Keep this too
              roles
            };
          })
        );
        setEmployees(employeesWithRoles || []);
      } else {
        setEmployees([]);
      }

    } catch (error: any) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Error loading employees",
        description: "Failed to load employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    
    setActionLoading(true);
    try {
      // In Firebase, we'll soft delete by setting status to 'inactive'
      // Hard deletes require admin API
      const response = await fetch('/api/delete-employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          employeeId: selectedEmployee.id,
          authUid: selectedEmployee.user_id 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete employee');
      }

      toast({
        title: "Employee deleted",
        description: "Employee has been successfully removed from the system.",
      });

      setDeleteDialogOpen(false);
      setSelectedEmployee(null);
      fetchEmployees();
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error deleting employee",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAdminRole = async (employee: any) => {
    setActionLoading(true);
    try {
      if (!employee.user_id) {
        throw new Error('This employee does not have a user account yet. Please ensure they have login credentials first.');
      }

      const isAdmin = employee.roles?.includes('admin');
      
      // Call API to toggle admin role
      const response = await fetch('/api/toggle-admin-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authUid: employee.user_id,
          isAdmin: !isAdmin,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update role');
      }

      if (isAdmin) {
        toast({
          title: "Admin access revoked",
          description: `${employee.name} is no longer an admin.`,
        });
      } else {
        toast({
          title: "Admin access granted",
          description: `${employee.name} is now an admin.`,
        });
      }

      fetchEmployees();
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error updating admin role",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Total employees: {employees.length}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchEmployees}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <User className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Employees Found</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first employee</p>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {employees.map((employee) => {
          const isAdmin = employee.roles?.includes('admin');
          const initials = employee.name
            ?.split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'NA';
          
          return (
            <Card key={employee.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex flex-col items-center space-y-3">
                  {/* Profile Picture */}
                  <Avatar className="h-20 w-20 border-4 border-primary/20">
                    <AvatarImage 
                      src={employee.profileImageUrl || employee.profile_picture || employee.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=3b82f6&color=fff&size=200`} 
                      alt={employee.name}
                    />
                    <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-primary/80 to-primary text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Name and EID */}
                  <div className="text-center space-y-1.5 w-full">
                    <h3 className="font-semibold text-base leading-tight">{employee.name}</h3>
                    {employee.eid && (
                      <Badge variant="secondary" className="text-xs font-mono">
                        EID: {employee.eid}
                      </Badge>
                    )}
                    {isAdmin && (
                      <Badge variant="default" className="text-xs ml-1">
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-2 pt-2">
                {/* View Details Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedEmployee(employee);
                    setViewDialogOpen(true);
                  }}
                  className="w-full"
                >
                  <User className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setEditDialogOpen(true);
                    }}
                    disabled={actionLoading}
                    className="w-full"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setResetPasswordDialogOpen(true);
                    }}
                    disabled={actionLoading || !employee.user_id}
                    className="w-full"
                    title={!employee.user_id ? "Employee needs login credentials first" : ""}
                  >
                    <Key className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                  <Button
                    variant={isAdmin ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleToggleAdminRole(employee)}
                    disabled={actionLoading || !employee.user_id}
                    className="w-full"
                    title={!employee.user_id ? "Employee needs login credentials first" : ""}
                  >
                    {isAdmin ? (
                      <>
                        <ShieldOff className="h-4 w-4 mr-1" />
                        Revoke
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-1" />
                        Admin
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setDeleteDialogOpen(true);
                    }}
                    disabled={actionLoading}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedEmployee?.first_name} {selectedEmployee?.last_name}'s employee record.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEmployee}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? "Deleting..." : "Delete Employee"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Employee Dialog */}
      <ViewEmployeeDialog
        employee={selectedEmployee}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      {/* Edit Employee Dialog */}
      <EditEmployeeDialog
        employee={selectedEmployee}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => {
          fetchEmployees();
          onUpdate();
        }}
      />

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        employeeId={selectedEmployee?.id}
        employeeName={`${selectedEmployee?.first_name || ''} ${selectedEmployee?.last_name || ''}`}
        employeeEmail={selectedEmployee?.email || ''}
        open={resetPasswordDialogOpen}
        onOpenChange={setResetPasswordDialogOpen}
      />
    </div>
  );
};

export default EmployeeList;
