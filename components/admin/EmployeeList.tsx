import { useState, useEffect } from "react";
import { getDocuments, deleteDocument, getDocument } from "@/lib/firebase/firestore";
import { where, orderBy } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2, Shield, ShieldOff, Edit, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EditEmployeeDialog from "./EditEmployeeDialog";
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
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
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
            // Find the user document to get auth_uid
            const { data: users } = await getDocuments("users", [
              where("employee_id", "==", emp.id)
            ]);
            
            const authUid = users?.[0]?.auth_uid;
            
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
              user_id: authUid, // For compatibility
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

      <div className="overflow-x-auto">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>EID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joining Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => {
            const isAdmin = employee.roles?.includes('admin');
            return (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">
                  {employee.name}
                </TableCell>
                <TableCell>
                  {employee.eid ? (
                    <Badge variant="secondary">{employee.eid}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.department || "N/A"}</TableCell>
                <TableCell>{employee.designation || "N/A"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Badge variant="outline">
                      employee
                    </Badge>
                    {isAdmin && (
                      <Badge variant="default">
                        admin
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                    {employee.status}
                  </Badge>
                </TableCell>
                <TableCell>{employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : "N/A"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setEditDialogOpen(true);
                      }}
                      disabled={actionLoading}
                      title="Edit employee"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setResetPasswordDialogOpen(true);
                      }}
                      disabled={actionLoading}
                      title="Reset password"
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={isAdmin ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleToggleAdminRole(employee)}
                      disabled={actionLoading}
                      title={isAdmin ? "Revoke admin access" : "Grant admin access"}
                    >
                      {isAdmin ? (
                        <ShieldOff className="h-4 w-4" />
                      ) : (
                        <Shield className="h-4 w-4" />
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
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </div>

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
