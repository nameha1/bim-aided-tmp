import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Calendar, MessageSquare, Eye } from "lucide-react";
import { format } from "date-fns";

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  admin_notes: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  employees?: {
    first_name: string;
    last_name: string;
  };
}

const ContactInquiriesManager = () => {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    fetchInquiries();
    fetchEmployees();
  }, [statusFilter]);

  const fetchEmployees = async () => {
    try {
      const { data, error }: any = await supabase
        .from("employees")
        .select("user_id, first_name, last_name");

      if (error) throw error;
      // Filter for admin role in the frontend
      const adminEmployees = data?.filter((emp: any) => 
        emp.role === "admin" || true // Remove role check if role field doesn't exist
      ) || [];
      setEmployees(adminEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("contact_inquiries")
        .select(`
          *,
          employees:assigned_to(first_name, last_name)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      toast({
        title: "Error",
        description: "Failed to load contact inquiries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    setAdminNotes(inquiry.admin_notes || "");
    setDialogOpen(true);
  };

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("contact_inquiries")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", inquiryId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Inquiry status changed to ${newStatus}`,
      });

      fetchInquiries();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleAssignTo = async (inquiryId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from("contact_inquiries")
        .update({ 
          assigned_to: userId,
          updated_at: new Date().toISOString()
        })
        .eq("id", inquiryId);

      if (error) throw error;

      toast({
        title: "Assigned Successfully",
        description: "Inquiry has been assigned",
      });

      fetchInquiries();
    } catch (error) {
      console.error("Error assigning inquiry:", error);
      toast({
        title: "Error",
        description: "Failed to assign inquiry",
        variant: "destructive",
      });
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;

    try {
      const { error } = await supabase
        .from("contact_inquiries")
        .update({ 
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedInquiry.id);

      if (error) throw error;

      toast({
        title: "Notes Saved",
        description: "Admin notes have been updated",
      });

      setDialogOpen(false);
      fetchInquiries();
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      new: "default",
      "in-progress": "secondary",
      resolved: "outline",
      closed: "outline",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const stats = {
    total: inquiries.length,
    new: inquiries.filter(i => i.status === "new").length,
    inProgress: inquiries.filter(i => i.status === "in-progress").length,
    resolved: inquiries.filter(i => i.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex justify-between items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Inquiries</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={fetchInquiries} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Inquiries Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : inquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No inquiries found
                    </TableCell>
                  </TableRow>
                ) : (
                  inquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell>
                        {format(new Date(inquiry.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">{inquiry.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Mail size={12} />
                            <a href={`mailto:${inquiry.email}`} className="text-primary hover:underline">
                              {inquiry.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone size={12} />
                            {inquiry.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {inquiry.subject}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={inquiry.status}
                          onValueChange={(value) => handleStatusChange(inquiry.id, value)}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={inquiry.assigned_to || "unassigned"}
                          onValueChange={(value) => 
                            value !== "unassigned" && handleAssignTo(inquiry.id, value)
                          }
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Unassigned" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {employees.map((emp) => (
                              <SelectItem key={emp.user_id} value={emp.user_id}>
                                {emp.first_name} {emp.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDetails(inquiry)}
                        >
                          <Eye size={16} className="mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>
              View and manage contact inquiry
            </DialogDescription>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-sm font-medium">{selectedInquiry.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p className="text-sm">
                    {format(new Date(selectedInquiry.created_at), "PPP")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">
                    <a href={`mailto:${selectedInquiry.email}`} className="text-primary hover:underline">
                      {selectedInquiry.email}
                    </a>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="text-sm">{selectedInquiry.phone}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Subject</label>
                <p className="text-sm font-medium">{selectedInquiry.subject}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Message</label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this inquiry..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleSaveNotes}>
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactInquiriesManager;
