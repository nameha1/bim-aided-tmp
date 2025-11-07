import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Eye, Download, Trash2, RefreshCw, Mail, Phone, Calendar, FileText } from "lucide-react";

interface Application {
  id: string;
  job_posting_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  cv_url: string;
  status: string;
  applied_at: string;
  job_postings?: {
    title: string;
  };
}

const ApplicationManager = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<Application | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterJob, setFilterJob] = useState<string>("all");
  const [jobs, setJobs] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data } = await supabase
      .from("career_postings")
      .select("id, title")
      .eq("published", true)
      .order("title");

    if (data) {
      setJobs(data);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          *,
          job_postings:career_postings(title)
        `)
        .order("applied_at", { ascending: false });

      if (error) throw error;

      setApplications(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsDetailsOpen(true);
  };

  const handleDownloadCV = (cvUrl: string, applicantName: string) => {
    window.open(cvUrl, "_blank");
    toast({
      title: "Opening CV",
      description: `Opening CV for ${applicantName}`,
    });
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("job_applications")
        .update({ status: newStatus })
        .eq("id", applicationId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: "Application status has been updated successfully.",
      });

      fetchApplications();
      setIsDetailsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteApplication = async () => {
    if (!applicationToDelete) return;

    try {
      // Delete CV file from storage
      const cvPath = applicationToDelete.cv_url.split("/").pop();
      if (cvPath) {
        await supabase.storage.from("cvs").remove([`applications/${cvPath}`]);
      }

      // Delete application record
      const { error } = await supabase
        .from("job_applications")
        .delete()
        .eq("id", applicationToDelete.id);

      if (error) throw error;

      toast({
        title: "Application Deleted",
        description: "Application and CV have been permanently deleted.",
      });

      fetchApplications();
      setDeleteDialogOpen(false);
      setApplicationToDelete(null);
      setIsDetailsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (application: Application) => {
    setApplicationToDelete(application);
    setDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-500",
      reviewing: "bg-blue-500",
      shortlisted: "bg-green-500",
      rejected: "bg-red-500",
      accepted: "bg-purple-500",
    };

    return (
      <Badge className={statusColors[status] || "bg-gray-500"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredApplications = applications.filter((app) => {
    const statusMatch = filterStatus === "all" || app.status === filterStatus;
    const jobMatch = filterJob === "all" || app.job_posting_id === filterJob;
    return statusMatch && jobMatch;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Applications...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Job Applications</CardTitle>
              <CardDescription>
                Manage and review candidate applications ({filteredApplications.length} total)
              </CardDescription>
            </div>
            <Button onClick={fetchApplications} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Filter by Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Filter by Job</label>
              <Select value={filterJob} onValueChange={setFilterJob}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Applications Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant Name</TableHead>
                  <TableHead>Job Position</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">
                        {application.applicant_name}
                      </TableCell>
                      <TableCell>
                        {application.job_postings?.title || "N/A"}
                      </TableCell>
                      <TableCell>
                        {new Date(application.applied_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(application)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleDownloadCV(
                                application.cv_url,
                                application.applicant_name
                              )
                            }
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => confirmDelete(application)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review candidate information and update application status
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Applicant Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Applicant Name
                  </label>
                  <p className="text-base font-medium">
                    {selectedApplication.applicant_name}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Job Position
                  </label>
                  <p className="text-base font-medium">
                    {selectedApplication.job_postings?.title || "N/A"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail size={16} />
                    Email
                  </label>
                  <p className="text-base">
                    <a
                      href={`mailto:${selectedApplication.applicant_email}`}
                      className="text-primary hover:underline"
                    >
                      {selectedApplication.applicant_email}
                    </a>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone size={16} />
                    Phone
                  </label>
                  <p className="text-base">
                    <a
                      href={`tel:${selectedApplication.applicant_phone}`}
                      className="text-primary hover:underline"
                    >
                      {selectedApplication.applicant_phone}
                    </a>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar size={16} />
                    Applied Date
                  </label>
                  <p className="text-base">
                    {new Date(selectedApplication.applied_at).toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Current Status
                  </label>
                  <div>{getStatusBadge(selectedApplication.status)}</div>
                </div>
              </div>

              {/* CV Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() =>
                    handleDownloadCV(
                      selectedApplication.cv_url,
                      selectedApplication.applicant_name
                    )
                  }
                  className="flex-1"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View CV
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => confirmDelete(selectedApplication)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Application
                </Button>
              </div>

              {/* Update Status */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Update Application Status</label>
                <Select
                  value={selectedApplication.status}
                  onValueChange={(value) =>
                    handleUpdateStatus(selectedApplication.id, value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the application
              for <strong>{applicationToDelete?.applicant_name}</strong> and remove their
              CV from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setApplicationToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteApplication}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ApplicationManager;
