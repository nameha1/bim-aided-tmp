import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, CheckCircle, Clock, Users, Trash2, Eye } from "lucide-react";
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

interface Assignment {
  id: string;
  title: string;
  project_note: string | null;
  start_date: string;
  deadline: string;
  status: "in_progress" | "completed" | "approved";
  supervisor_id: string | null;
  supervisor_name: string | null;
  created_at: string;
  members?: AssignmentMember[];
}

interface AssignmentMember {
  member_id: string;
  employee_id: string;
  employee_name: string;
  employee_email: string;
  role: string;
  personal_note: string | null;
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
}

const AssignmentManager = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [projectNote, setProjectNote] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<{
    employee_id: string;
    role: string;
    personal_note: string;
  }[]>([]);

  useEffect(() => {
    fetchAssignments();
    fetchEmployees();
  }, []);

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from("assignment_details" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // If assignments table doesn't exist yet, just set empty assignments
        console.log("Assignments feature not yet available:", error);
        setAssignments([]);
        setLoading(false);
        return;
      }
      
      setAssignments(data as any || []);
    } catch (error: any) {
      console.log("Assignments feature not yet available:", error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name, email")
        .eq("employment_status", "Active")
        .order("first_name");

      if (error) throw error;
      
      const employeesWithFullName = (data || []).map(emp => ({
        id: emp.id,
        full_name: `${emp.first_name} ${emp.last_name}`,
        email: emp.email,
      }));
      
      setEmployees(employeesWithFullName);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddMember = () => {
    setSelectedMembers([...selectedMembers, { employee_id: "", role: "", personal_note: "" }]);
  };

  const handleRemoveMember = (index: number) => {
    setSelectedMembers(selectedMembers.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, field: string, value: string) => {
    const updated = [...selectedMembers];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedMembers(updated);
  };

  const handleCreateOrUpdateAssignment = async () => {
    if (!title || !startDate || !deadline || selectedMembers.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and add at least one team member",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data: employeeData } = await supabase
        .from("employees")
        .select("id")
        .eq("user_id", userData.user?.id)
        .single();

      if (isEditing && editingAssignmentId) {
        // Update existing assignment
        const { error: assignmentError } = await supabase
          .from("assignments" as any)
          .update({
            title,
            project_note: projectNote || null,
            start_date: startDate,
            deadline,
            supervisor_id: supervisorId && supervisorId !== 'none' ? supervisorId : null,
          })
          .eq("id", editingAssignmentId);

        if (assignmentError) throw assignmentError;

        // Delete existing members
        await supabase
          .from("assignment_members" as any)
          .delete()
          .eq("assignment_id", editingAssignmentId);

        // Add new members
        const membersToInsert = selectedMembers
          .filter(m => m.employee_id && m.role)
          .map(m => ({
            assignment_id: editingAssignmentId,
            employee_id: m.employee_id,
            role: m.role,
            personal_note: m.personal_note || null,
          }));

        const { error: membersError } = await supabase
          .from("assignment_members" as any)
          .insert(membersToInsert);

        if (membersError) throw membersError;

        toast({
          title: "Success",
          description: "Assignment updated successfully",
        });
      } else {
        // Create new assignment
        const { data: assignment, error: assignmentError } = await supabase
          .from("assignments" as any)
          .insert({
            title,
            project_note: projectNote || null,
            start_date: startDate,
            deadline,
            supervisor_id: supervisorId && supervisorId !== 'none' ? supervisorId : null,
            created_by: employeeData?.id,
          })
          .select()
          .single();

        if (assignmentError) throw assignmentError;

        // Add members
        const membersToInsert = selectedMembers
          .filter(m => m.employee_id && m.role)
          .map(m => ({
            assignment_id: (assignment as any).id,
            employee_id: m.employee_id,
            role: m.role,
            personal_note: m.personal_note || null,
          }));

        const { error: membersError } = await supabase
          .from("assignment_members" as any)
          .insert(membersToInsert);

        if (membersError) throw membersError;

        toast({
          title: "Success",
          description: "Assignment created successfully",
        });
      }

      // Reset form
      resetForm();
      setCreateDialogOpen(false);
      fetchAssignments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setTitle("");
    setProjectNote("");
    setStartDate("");
    setDeadline("");
    setSupervisorId("none");
    setSelectedMembers([]);
    setIsEditing(false);
    setEditingAssignmentId(null);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setTitle(assignment.title);
    setProjectNote(assignment.project_note || "");
    setStartDate(assignment.start_date);
    setDeadline(assignment.deadline);
    setSupervisorId(assignment.supervisor_id || "none");
    setSelectedMembers(
      (assignment.members || []).map(m => ({
        employee_id: m.employee_id,
        role: m.role,
        personal_note: m.personal_note || "",
      }))
    );
    setIsEditing(true);
    setEditingAssignmentId(assignment.id);
    setCreateDialogOpen(true);
  };

  const handleApproveAssignment = async (assignmentId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data: employeeData } = await supabase
        .from("employees")
        .select("id")
        .eq("user_id", userData.user?.id)
        .single();

      const { error } = await supabase
        .from("assignments" as any)
        .update({
          status: "approved",
          approved_by: employeeData?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", assignmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment approved successfully",
      });

      fetchAssignments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAssignment = async () => {
    if (!assignmentToDelete) return;

    try {
      const { error } = await supabase
        .from("assignments" as any)
        .delete()
        .eq("id", assignmentToDelete);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      });

      fetchAssignments();
      setDeleteDialogOpen(false);
      setAssignmentToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-50"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-yellow-50"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
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

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Assignment Management</h2>
          <p className="text-muted-foreground">Create and manage team assignments</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={(open) => {
          if (!open) {
            resetForm();
          }
          setCreateDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Assignment" : "Create New Assignment"}</DialogTitle>
              <DialogDescription>
                Assign tasks to team members with specific roles and deadlines
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="title">Assignment Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter assignment title"
                />
              </div>

              <div>
                <Label htmlFor="projectNote">Project Note</Label>
                <Textarea
                  id="projectNote"
                  value={projectNote}
                  onChange={(e) => setProjectNote(e.target.value)}
                  placeholder="General notes about the project"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="supervisor">Supervisor (Optional)</Label>
                <Select value={supervisorId} onValueChange={setSupervisorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Supervisor</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="deadline">Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Team Members *</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddMember}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Member
                  </Button>
                </div>

                <div className="space-y-3">
                  {selectedMembers.map((member, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Employee *</Label>
                              <Select
                                value={member.employee_id}
                                onValueChange={(value) => handleMemberChange(index, "employee_id", value)}
                              >
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
                              <Label className="text-xs">Role *</Label>
                              <Input
                                value={member.role}
                                onChange={(e) => handleMemberChange(index, "role", e.target.value)}
                                placeholder="e.g., Lead Designer, Developer"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Personal Note</Label>
                            <Textarea
                              value={member.personal_note}
                              onChange={(e) => handleMemberChange(index, "personal_note", e.target.value)}
                              placeholder="Specific instructions for this team member"
                              rows={2}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveMember(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Button onClick={handleCreateOrUpdateAssignment} className="w-full">
                {isEditing ? "Update Assignment" : "Create Assignment"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((assignment) => (
          <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{assignment.title}</CardTitle>
                {getStatusBadge(assignment.status)}
              </div>
              <CardDescription className="line-clamp-2">
                {assignment.project_note || "No project notes"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(assignment.start_date)} - {formatDate(assignment.deadline)}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-2" />
                  {assignment.members?.length || 0} team member(s)
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex gap-2">
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditAssignment(assignment)}
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    {assignment.status === "completed" && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleApproveAssignment(assignment.id)}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className={assignment.status === "completed" ? "flex-1" : "w-full"}
                      onClick={() => {
                        setAssignmentToDelete(assignment.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {assignments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No assignments yet. Create your first assignment!</p>
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
              {selectedAssignment.supervisor_name && (
                <div>
                  <Label>Supervisor</Label>
                  <p className="text-sm font-semibold text-foreground mt-1">
                    {selectedAssignment.supervisor_name}
                  </p>
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
                </div>
              </div>
              <div>
                <Label>Team Members</Label>
                <div className="mt-2 space-y-2">
                  {selectedAssignment.members?.map((member) => (
                    <Card key={member.member_id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{member.employee_name}</p>
                            <p className="text-sm text-muted-foreground">{member.employee_email}</p>
                          </div>
                          <Badge variant="outline">{member.role}</Badge>
                        </div>
                        {member.personal_note && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Note: {member.personal_note}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the assignment and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAssignment}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AssignmentManager;
