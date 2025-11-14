import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, CheckCircle, Eye, Users, ClipboardList } from "lucide-react";
import { getDocuments, updateDocument, getDocument } from "@/lib/firebase/firestore";
import { where } from "firebase/firestore";
import { getCurrentUser } from "@/lib/firebase/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface MyAssignment {
  assignment_id: string;
  title: string;
  project_note: string | null;
  start_date: string;
  deadline: string;
  status: "in_progress" | "completed" | "approved";
  my_role: string;
  my_personal_note: string | null;
  members: AssignmentMember[];
}

interface AssignmentMember {
  employee_name: string;
  employee_email: string;
  role: string;
}

const MyAssignments = () => {
  const [assignments, setAssignments] = useState<MyAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<MyAssignment | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMyAssignments();
  }, []);

  const fetchMyAssignments = async () => {
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

      // Get assignments where this employee is a member
      const { data: memberAssignments, error: memberError } = await getDocuments("assignment_members", [
        where("employee_id", "==", employee.id)
      ]);

      console.log("Member assignments found:", memberAssignments?.length || 0);

      if (memberError) {
        // If assignments feature doesn't exist yet, just set empty assignments
        console.log("Assignments feature not yet available:", memberError);
        setAssignments([]);
        setLoading(false);
        return;
      }

      if (!memberAssignments || memberAssignments.length === 0) {
        setAssignments([]);
        setLoading(false);
        return;
      }

      // Get full assignment details
      const assignmentIds = memberAssignments.map((m: any) => m.assignment_id);
      console.log("Assignment IDs to fetch:", assignmentIds);
      
      // Fetch each assignment individually by document ID
      const assignmentsPromises = assignmentIds.map(async (assignmentId: string) => {
        const { data: assignmentData, error } = await getDocument("assignments", assignmentId);
        if (error) {
          console.log("Error fetching assignment:", assignmentId, error);
          return null;
        }
        console.log("Fetched assignment:", assignmentData?.title);
        return assignmentData;
      });

      const assignmentsResults = await Promise.all(assignmentsPromises);
      const assignmentsData = assignmentsResults.filter(a => a !== null);
      console.log("Total assignments fetched:", assignmentsData.length);

      // Sort by deadline
      assignmentsData.sort((a: any, b: any) => {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });

      // Get all members for each assignment
      const assignmentsWithMembers = await Promise.all(
        assignmentsData.map(async (assignment: any) => {
          const { data: allMembers } = await getDocuments("assignment_members", [
            where("assignment_id", "==", assignment.id)
          ]);

          // Get employee details for each member using getDocument
          const membersWithDetails = await Promise.all(
            (allMembers || []).map(async (member: any) => {
              const { data: emp, error: empError } = await getDocument("employees", member.employee_id);
              if (empError) {
                console.log("Error fetching employee:", empError);
              }
              return {
                employee_name: emp ? `${emp.first_name || emp.firstName || ''} ${emp.last_name || emp.lastName || ''}`.trim() || emp.name || "Unknown" : "Unknown",
                employee_email: emp?.email || "",
                role: member.role,
              };
            })
          );

          const myMembership = memberAssignments.find(
            (m: any) => m.assignment_id === assignment.id
          );

          return {
            assignment_id: assignment.id,
            title: assignment.title,
            project_note: assignment.project_note,
            start_date: assignment.start_date,
            deadline: assignment.deadline,
            status: assignment.status,
            my_role: myMembership?.role || "",
            my_personal_note: myMembership?.personal_note || null,
            members: membersWithDetails,
          };
        })
      );

      setAssignments(assignmentsWithMembers);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (assignmentId: string) => {
    try {
      const { error } = await updateDocument("assignments", assignmentId, {
        status: "completed"
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment marked as completed. Waiting for admin approval.",
      });

      fetchMyAssignments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update assignment",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-50">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-yellow-50">
            <CheckCircle className="h-3 w-3 mr-1" />
            Awaiting Approval
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: "Overdue", color: "text-red-600" };
    if (diffDays === 0) return { text: "Due today", color: "text-orange-600" };
    if (diffDays === 1) return { text: "1 day left", color: "text-orange-500" };
    if (diffDays <= 7) return { text: `${diffDays} days left`, color: "text-yellow-600" };
    return { text: `${diffDays} days left`, color: "text-green-600" };
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Assignments</h2>
        <p className="text-muted-foreground">View and manage your assigned tasks</p>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((assignment) => {
          const daysRemaining = getDaysRemaining(assignment.deadline);
          
          return (
            <Card key={assignment.assignment_id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{assignment.title}</CardTitle>
                  {getStatusBadge(assignment.status)}
                </div>
                <div className="mt-2">
                  <Badge variant="secondary">
                    {assignment.my_role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assignment.project_note && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {assignment.project_note}
                    </p>
                  )}

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(assignment.start_date)} - {formatDate(assignment.deadline)}
                  </div>

                  <div className={`flex items-center text-sm font-semibold ${daysRemaining.color}`}>
                    <Clock className="h-4 w-4 mr-2" />
                    {daysRemaining.text}
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    {assignment.members.length} team member(s)
                  </div>

                  {assignment.my_personal_note && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-semibold text-blue-900 mb-1">
                        Personal Note:
                      </p>
                      <p className="text-sm text-blue-800">{assignment.my_personal_note}</p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setDetailsDialogOpen(true);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                    {assignment.status === "in_progress" && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleMarkCompleted(assignment.assignment_id)}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!loading && assignments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              You don't have any assignments yet.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Assignment Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title}</DialogTitle>
            <DialogDescription>Assignment Details</DialogDescription>
          </DialogHeader>
          {selectedAssignment && (
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <div className="mt-1">{getStatusBadge(selectedAssignment.status)}</div>
              </div>

              <div>
                <Label>Your Role</Label>
                <div className="mt-1">
                  <Badge variant="secondary">{selectedAssignment.my_role}</Badge>
                </div>
              </div>

              {selectedAssignment.my_personal_note && (
                <div>
                  <Label>Personal Note for You</Label>
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      {selectedAssignment.my_personal_note}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <Label>Project Note</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedAssignment.project_note || "No project notes"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDate(selectedAssignment.start_date)}
                  </p>
                </div>
                <div>
                  <Label>Deadline</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDate(selectedAssignment.deadline)}
                  </p>
                  <p className={`text-sm font-semibold mt-1 ${getDaysRemaining(selectedAssignment.deadline).color}`}>
                    {getDaysRemaining(selectedAssignment.deadline).text}
                  </p>
                </div>
              </div>

              <div>
                <Label>Team Members</Label>
                <div className="mt-2 space-y-2">
                  {selectedAssignment.members.map((member, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{member.employee_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.employee_email}
                            </p>
                          </div>
                          <Badge variant="outline">{member.role}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyAssignments;
