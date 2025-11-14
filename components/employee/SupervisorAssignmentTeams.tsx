import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Users as UsersIcon, FileText } from "lucide-react";
import { getDocuments, createDocument, deleteDocument, getDocument } from "@/lib/firebase/firestore";
import { where } from "firebase/firestore";
import { getCurrentUser } from "@/lib/firebase/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface SupervisedAssignment {
  id: string;
  title: string;
  project_note: string | null;
  members: AssignmentMember[];
}

interface AssignmentMember {
  member_id: string;
  employee_id: string;
  employee_name: string;
  role: string;
  personal_note: string | null;
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
}

const SupervisorAssignmentTeams = () => {
  const [assignments, setAssignments] = useState<SupervisedAssignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state
  const [employeeId, setEmployeeId] = useState("");
  const [role, setRole] = useState("");
  const [personalNote, setPersonalNote] = useState("");

  useEffect(() => {
    fetchSupervisedAssignments();
    fetchEmployees();
  }, []);

  const fetchSupervisedAssignments = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        console.log("No current user found");
        setLoading(false);
        return;
      }

      console.log("Current user UID:", currentUser.uid);

      // Get employee data from Firebase (using auth_uid field)
      const { data: employeeData, error: employeeError } = await getDocuments("employees", [
        where("auth_uid", "==", currentUser.uid)
      ]);

      if (employeeError || !employeeData || employeeData.length === 0) {
        console.log("No employee found for user:", employeeError);
        setLoading(false);
        return;
      }

      const employee = employeeData[0];
      console.log("Employee found:", { id: employee.id, email: employee.email });

      // Get assignments where this employee is the supervisor
      const { data, error } = await getDocuments("assignments", [
        where("supervisor_id", "==", employee.id)
      ]);

      console.log("Supervised assignments query result:", { data, error });

      if (error) {
        // If assignments feature doesn't exist yet, just set empty assignments
        console.log("Assignments feature not yet available:", error);
        setAssignments([]);
        setLoading(false);
        return;
      }

      // Debug: Also fetch ALL assignments to see what's in the database
      const { data: allAssignments } = await getDocuments("assignments");
      console.log("All assignments in database:", allAssignments);
      console.log("Assignments with supervisor_id:", 
        allAssignments?.filter((a: any) => a.supervisor_id)
          .map((a: any) => ({ title: a.title, supervisor_id: a.supervisor_id }))
      );

      // For each assignment, get its members
      const assignmentsWithMembers = await Promise.all(
        (data || []).map(async (assignment: any) => {
          const { data: members } = await getDocuments("assignment_members", [
            where("assignment_id", "==", assignment.id)
          ]);

          console.log("Members for assignment", assignment.title, ":", members);

          // Get employee details for each member using getDocument
          const membersWithDetails = await Promise.all(
            (members || []).map(async (member: any) => {
              console.log("Fetching employee with ID:", member.employee_id);
              const { data: emp, error: empError } = await getDocument("employees", member.employee_id);
              if (empError) {
                console.log("Error fetching employee:", empError);
              }
              console.log("Employee data:", emp);
              return {
                member_id: member.id,
                employee_id: member.employee_id,
                employee_name: emp ? `${emp.first_name || emp.firstName || ''} ${emp.last_name || emp.lastName || ''}`.trim() || "Unknown" : "Unknown",
                role: member.role,
                personal_note: member.personal_note,
              };
            })
          );

          return {
            id: assignment.id,
            title: assignment.title,
            project_note: assignment.project_note || null,
            members: membersWithDetails,
          };
        })
      );

      setAssignments(assignmentsWithMembers);
    } catch (error: any) {
      console.log("Assignments feature not yet available:", error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await getDocuments("employees", [
        where("status", "==", "active")
      ]);

      if (error) throw error;

      const employeesWithFullName = (data || []).map((emp: any) => ({
        id: emp.id,
        full_name: `${emp.first_name || emp.firstName || ''} ${emp.last_name || emp.lastName || ''}`.trim() || emp.name || "Unknown",
        email: emp.email,
      }))
      // Sort in JavaScript to avoid needing a composite index
      .sort((a, b) => a.full_name.localeCompare(b.full_name));

      setEmployees(employeesWithFullName);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch employees",
        variant: "destructive",
      });
    }
  };

  const handleAddMember = async () => {
    if (!employeeId || !role || !selectedAssignmentId) {
      toast({
        title: "Error",
        description: "Please fill in employee and role",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await createDocument("assignment_members", {
        assignment_id: selectedAssignmentId,
        employee_id: employeeId,
        role: role,
        personal_note: personalNote || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team member added successfully",
      });

      // Reset form
      setEmployeeId("");
      setRole("");
      setPersonalNote("");
      setDialogOpen(false);
      fetchSupervisedAssignments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add team member",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      const { error } = await deleteDocument("assignment_members", memberToDelete);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team member removed successfully",
      });

      fetchSupervisedAssignments();
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove team member",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            You are not supervising any assignments yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Supervised Assignments</h2>
        <p className="text-muted-foreground">Manage team members for your supervised assignments</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {assignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardHeader>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <CardTitle>{assignment.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <UsersIcon className="h-4 w-4" />
                    {assignment.members?.length || 0} team member(s)
                  </CardDescription>
                </div>
                <Dialog open={dialogOpen && selectedAssignmentId === assignment.id} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) {
                    setEmployeeId("");
                    setRole("");
                    setPersonalNote("");
                    setSelectedAssignmentId(null);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => setSelectedAssignmentId(assignment.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Team Member</DialogTitle>
                      <DialogDescription>
                        Add a new member to {assignment.title}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="employee">Employee *</Label>
                        <Select value={employeeId} onValueChange={setEmployeeId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map((emp) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="role">Role *</Label>
                        <Input
                          id="role"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          placeholder="e.g., Designer, Developer"
                        />
                      </div>
                      <div>
                        <Label htmlFor="personalNote">Personal Note</Label>
                        <Textarea
                          id="personalNote"
                          value={personalNote}
                          onChange={(e) => setPersonalNote(e.target.value)}
                          placeholder="Specific instructions for this member"
                          rows={3}
                        />
                      </div>
                      <Button onClick={handleAddMember} className="w-full">
                        Add Team Member
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {/* Project Note Section */}
              {assignment.project_note && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        Project Note:
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-200">{assignment.project_note}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Team Members</h4>
                {assignment.members && assignment.members.length > 0 ? (
                  assignment.members.map((member) => (
                    <Card key={member.member_id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{member.employee_name}</p>
                              <Badge variant="outline">{member.role}</Badge>
                            </div>
                            {member.personal_note && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Note: {member.personal_note}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setMemberToDelete(member.member_id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No team members yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the team member from the assignment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMember}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SupervisorAssignmentTeams;
