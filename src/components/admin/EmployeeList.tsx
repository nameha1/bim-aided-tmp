import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2, Shield, ShieldOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("employees")
        .select(`
          id,
          user_id,
          first_name,
          last_name,
          email,
          employment_status,
          joining_date,
          created_at,
          department_id,
          designation_id,
          departments!employees_department_id_fkey(name),
          designations(name)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching employees:", error);
        toast({
          title: "Error loading employees",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // Fetch roles for each employee
      if (data) {
        const employeesWithRoles = await Promise.all(
          data.map(async (emp) => {
            const { data: roleData } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", emp.user_id);
            
            return {
              ...emp,
              roles: roleData?.map(r => r.role) || []
            };
          })
        );
        setEmployees(employeesWithRoles || []);
      } else {
        setEmployees([]);
      }
      return;

    } catch (error: any) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    
    setActionLoading(true);
    try {
      // Delete employee record (this will cascade delete related records)
      const { error: empError } = await supabase
        .from("employees")
        .delete()
        .eq("id", selectedEmployee.id);

      if (empError) throw empError;

      // Delete user roles
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", selectedEmployee.user_id);

      if (roleError) throw roleError;

      // Note: We can't delete from auth.users directly via client
      // The user account will remain but won't be able to access the system

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
      
      if (isAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", employee.user_id)
          .eq("role", "admin");

        if (error) throw error;

        toast({
          title: "Admin access revoked",
          description: `${employee.first_name} ${employee.last_name} is no longer an admin.`,
        });
      } else {
        // Grant admin role
        const { error } = await supabase
          .from("user_roles")
          .insert({
            user_id: employee.user_id,
            role: "admin"
          });

        if (error) throw error;

        toast({
          title: "Admin access granted",
          description: `${employee.first_name} ${employee.last_name} is now an admin.`,
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
                  {employee.first_name} {employee.last_name}
                </TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.departments?.name || "N/A"}</TableCell>
                <TableCell>{employee.designations?.name || "N/A"}</TableCell>
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
                  <Badge variant={employee.employment_status === "Active" ? "default" : "secondary"}>
                    {employee.employment_status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(employee.joining_date).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant={isAdmin ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleToggleAdminRole(employee)}
                      disabled={actionLoading}
                      title={isAdmin ? "Revoke admin access" : "Grant admin access"}
                    >
                      {isAdmin ? (
                        <>
                          <ShieldOff className="h-4 w-4 mr-1" />
                          Revoke Admin
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-1" />
                          Make Admin
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
    </div>
  );
};

export default EmployeeList;
