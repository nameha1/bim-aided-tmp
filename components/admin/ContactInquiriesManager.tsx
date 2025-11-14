import { useState, useEffect } from "react";
import { getDocuments, updateDocument } from "@/lib/firebase/firestore";
import { where, orderBy } from "firebase/firestore";
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
  created_at: any; // Can be Firestore Timestamp or Date string
  updated_at: any; // Can be Firestore Timestamp or Date string
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
      const { data, error } = await getDocuments("employees");

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      
      // Build query with filters
      const filters: any[] = [orderBy("created_at", "desc")];
      if (statusFilter !== "all") {
        filters.push(where("status", "==", statusFilter));
      }

      const { data, error } = await getDocuments("contact_inquiries", filters);

      if (error) throw error;
      
      // Enrich with employee data if assigned
      const enrichedData = await Promise.all(
        (data || []).map(async (inquiry: any) => {
          if (inquiry.assigned_to) {
            const { data: employeeData } = await getDocuments("employees", [
              where("id", "==", inquiry.assigned_to)
            ]);
            return {
              ...inquiry,
              employees: employeeData?.[0] || null
            };
          }
          return inquiry;
        })
      );

      setInquiries(enrichedData);
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
      const { error } = await updateDocument("contact_inquiries", inquiryId, { 
        status: newStatus,
        updated_at: new Date().toISOString()
      });

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
      const { error } = await updateDocument("contact_inquiries", inquiryId, { 
        assigned_to: userId,
        updated_at: new Date().toISOString()
      });

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
      const { error } = await updateDocument("contact_inquiries", selectedInquiry.id, { 
        admin_notes: adminNotes,
        updated_at: new Date().toISOString()
      });

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
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="text-2xl font-bold text-cyan-500">{stats.new}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter - Removed */}

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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : inquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No inquiries found
                    </TableCell>
                  </TableRow>
                ) : (
                  inquiries.map((inquiry) => {
                    // Convert Firestore Timestamp to Date
                    const createdDate = inquiry.created_at?.toDate ? inquiry.created_at.toDate() : new Date(inquiry.created_at);
                    
                    return (
                      <TableRow key={inquiry.id}>
                        <TableCell>
                          {format(createdDate, "MMM d, yyyy")}
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
                    );
                  })
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
                    {format(
                      selectedInquiry.created_at?.toDate 
                        ? selectedInquiry.created_at.toDate() 
                        : new Date(selectedInquiry.created_at), 
                      "PPP"
                    )}
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
