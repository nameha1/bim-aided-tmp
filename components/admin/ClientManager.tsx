"use client";

import { useState, useEffect } from "react";
import { getDocuments, createDocument, updateDocument, deleteDocument } from "@/lib/firebase/firestore";
import { orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  User,
  Briefcase,
  Calendar,
  DollarSign,
  FileText
} from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Client, ClientWork } from "@/types/client";

const INDUSTRIES = [
  "Architecture",
  "Construction",
  "Engineering",
  "Real Estate",
  "Manufacturing",
  "Government",
  "Healthcare",
  "Education",
  "Hospitality",
  "Retail",
  "Other"
];

const PROJECT_TYPES = [
  "BIM Modeling",
  "Architectural Design",
  "Structural Engineering",
  "MEP Design",
  "Construction Documentation",
  "Project Coordination",
  "Facility Management",
  "Renovation",
  "Consulting",
  "Other"
];

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "BDT", "INR"];

export default function ClientManager() {
  const [activeTab, setActiveTab] = useState("clients");
  const [clients, setClients] = useState<Client[]>([]);
  const [clientWorks, setClientWorks] = useState<ClientWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog states
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [workDialogOpen, setWorkDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: "client" | "work" } | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingWork, setEditingWork] = useState<ClientWork | null>(null);

  // Client form state
  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [taxId, setTaxId] = useState("");
  const [industry, setIndustry] = useState("");
  const [clientStatus, setClientStatus] = useState<"active" | "inactive" | "potential">("active");
  const [clientNotes, setClientNotes] = useState("");

  // Work form state
  const [selectedClientId, setSelectedClientId] = useState("");
  const [manualClientName, setManualClientName] = useState("");
  const [useManualClient, setUseManualClient] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [workStatus, setWorkStatus] = useState<"planning" | "in-progress" | "completed" | "on-hold" | "cancelled">("planning");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [workDescription, setWorkDescription] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [teamMemberIds, setTeamMemberIds] = useState<string[]>([]);
  const [currentTeamMemberId, setCurrentTeamMemberId] = useState("select");
  const [employees, setEmployees] = useState<any[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
    fetchClientWorks();
    fetchEmployees();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await getDocuments("clients", [
        orderBy("created_at", "desc")
      ]);

      if (error) {
        console.log("Clients feature not yet available:", error);
        setClients([]);
        return;
      }

      setClients((data as Client[]) || []);
    } catch (error) {
      console.log("Could not fetch clients:", error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientWorks = async () => {
    try {
      const { data, error } = await getDocuments("client_works", [
        orderBy("start_date", "desc")
      ]);

      if (error) {
        console.log("Client works feature not yet available:", error);
        setClientWorks([]);
        return;
      }

      setClientWorks((data as ClientWork[]) || []);
    } catch (error) {
      console.log("Could not fetch client works:", error);
      setClientWorks([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await getDocuments("employees");

      if (error) {
        console.log("Could not fetch employees:", error);
        setEmployees([]);
        return;
      }

      setEmployees(data || []);
    } catch (error) {
      console.log("Could not fetch employees:", error);
      setEmployees([]);
    }
  };

  const resetClientForm = () => {
    setClientName("");
    setCompanyName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setCity("");
    setState("");
    setZipCode("");
    setCountry("");
    setTaxId("");
    setIndustry("");
    setClientStatus("active");
    setClientNotes("");
    setEditingClient(null);
  };

  const resetWorkForm = () => {
    setSelectedClientId("");
    setManualClientName("");
    setUseManualClient(false);
    setProjectName("");
    setProjectType("");
    setStartDate("");
    setEndDate("");
    setWorkStatus("planning");
    setBudget("");
    setCurrency("USD");
    setWorkDescription("");
    setSupervisorId("");
    setTeamMemberIds([]);
    setCurrentTeamMemberId("select");
    setEditingWork(null);
  };

  const handleOpenClientDialog = () => {
    resetClientForm();
    setClientDialogOpen(true);
  };

  const handleOpenWorkDialog = () => {
    resetWorkForm();
    setWorkDialogOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setClientName(client.client_name);
    setCompanyName(client.company_name);
    setEmail(client.email);
    setPhone(client.phone);
    setAddress(client.address);
    setCity(client.city);
    setState(client.state);
    setZipCode(client.zip_code);
    setCountry(client.country);
    setTaxId(client.tax_id);
    setIndustry(client.industry);
    setClientStatus(client.status);
    setClientNotes(client.notes || "");
    setClientDialogOpen(true);
  };

  const handleEditWork = (work: ClientWork) => {
    setEditingWork(work);
    setSelectedClientId(work.client_id || "");
    setManualClientName(work.client_name_manual || "");
    setUseManualClient(!work.client_id && !!work.client_name_manual);
    setProjectName(work.project_name);
    setProjectType(work.project_type);
    setStartDate(work.start_date);
    setEndDate(work.end_date || "");
    setWorkStatus(work.status);
    setBudget(work.budget.toString());
    setCurrency(work.currency);
    setWorkDescription(work.description || "");
    setSupervisorId(work.supervisor_id || "");
    setTeamMemberIds(work.team_member_ids || []);
    setWorkDialogOpen(true);
  };

  const handleSubmitClient = async () => {
    // Validation
    if (!clientName.trim()) {
      toast({
        title: "Error",
        description: "Client name is required",
        variant: "destructive",
      });
      return;
    }

    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    const clientData = {
      client_name: clientName.trim(),
      company_name: companyName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      zip_code: zipCode.trim(),
      country: country.trim(),
      tax_id: taxId.trim(),
      industry: industry,
      status: clientStatus,
      notes: clientNotes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingClient) {
        // Update existing client
        const { error } = await updateDocument("clients", editingClient.id, clientData);

        if (error) {
          toast({
            title: "Error",
            description: "Failed to update client",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Client updated successfully",
        });
      } else {
        // Create new client
        const newClient = {
          ...clientData,
          created_at: new Date().toISOString(),
        };

        const { error } = await createDocument("clients", newClient);

        if (error) {
          toast({
            title: "Error",
            description: "Failed to create client",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Client created successfully",
        });
      }

      setClientDialogOpen(false);
      resetClientForm();
      fetchClients();
    } catch (error) {
      console.error("Error submitting client:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleSubmitWork = async () => {
    // Validation
    if (!useManualClient && !selectedClientId) {
      toast({
        title: "Error",
        description: "Please select a client or use manual entry",
        variant: "destructive",
      });
      return;
    }

    if (useManualClient && !manualClientName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a client name",
        variant: "destructive",
      });
      return;
    }

    if (!projectName.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    if (!startDate) {
      toast({
        title: "Error",
        description: "Start date is required",
        variant: "destructive",
      });
      return;
    }

    if (!budget || parseFloat(budget) < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid budget",
        variant: "destructive",
      });
      return;
    }

    // Get supervisor and team member emails from IDs
    const supervisor = supervisorId ? employees.find(emp => emp.id === supervisorId) : null;
    const supervisorEmail = supervisor?.email || null;
    
    const teamMembers = teamMemberIds.map(id => employees.find(emp => emp.id === id)).filter(Boolean);
    const teamMemberEmails = teamMembers.map(member => member.email).filter(Boolean);

    const workData = {
      client_id: useManualClient ? null : selectedClientId,
      client_name_manual: useManualClient ? manualClientName.trim() : null,
      project_name: projectName.trim(),
      project_type: projectType,
      start_date: startDate,
      end_date: endDate || null,
      status: workStatus,
      budget: parseFloat(budget),
      currency: currency,
      description: workDescription.trim() || null,
      supervisor_id: supervisorId || null,
      supervisor_email: supervisorEmail,
      team_member_ids: teamMemberIds,
      team_member_emails: teamMemberEmails,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingWork) {
        // Update existing work
        const { error } = await updateDocument("client_works", editingWork.id, workData);

        if (error) {
          toast({
            title: "Error",
            description: "Failed to update project",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Project updated successfully",
        });
      } else {
        // Create new work
        const newWork = {
          ...workData,
          created_at: new Date().toISOString(),
        };

        const { error } = await createDocument("client_works", newWork);

        if (error) {
          toast({
            title: "Error",
            description: "Failed to create project",
            variant: "destructive",
          });
          return;
        }

        // Send email notifications for new projects
        if (supervisorEmail || teamMemberEmails.length > 0) {
          try {
            const clientName = useManualClient 
              ? manualClientName 
              : clients.find(c => c.id === selectedClientId)?.client_name || "Unknown Client";

            const emailResponse = await fetch('/api/send-project-notification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                projectName: projectName.trim(),
                supervisorEmail: supervisorEmail.trim() || null,
                teamMemberEmails: teamMemberEmails,
                startDate: startDate,
                clientName: clientName,
              }),
            });

            if (!emailResponse.ok) {
              console.error('Failed to send email notifications');
            }
          } catch (emailError) {
            console.error('Error sending email notifications:', emailError);
            // Don't fail the project creation if email fails
          }
        }

        toast({
          title: "Success",
          description: "Project created successfully and notifications sent",
        });
      }

      setWorkDialogOpen(false);
      resetWorkForm();
      fetchClientWorks();
    } catch (error) {
      console.error("Error submitting work:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const collection = itemToDelete.type === "client" ? "clients" : "client_works";
      const { error } = await deleteDocument(collection, itemToDelete.id);

      if (error) {
        toast({
          title: "Error",
          description: `Failed to delete ${itemToDelete.type}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `${itemToDelete.type === "client" ? "Client" : "Project"} deleted successfully`,
      });

      if (itemToDelete.type === "client") {
        fetchClients();
        // Also fetch works to update the list
        fetchClientWorks();
      } else {
        fetchClientWorks();
      }
    } catch (error) {
      console.error("Error deleting:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const openDeleteDialog = (id: string, type: "client" | "work") => {
    setItemToDelete({ id, type });
    setDeleteDialogOpen(true);
  };

  // Filter clients based on search query
  const filteredClients = clients.filter((client) =>
    client.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get client name by ID
  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? `${client.client_name} (${client.company_name})` : "Unknown Client";
  };

  // Get works by client
  const getClientWorks = (clientId: string) => {
    return clientWorks.filter((work) => work.client_id === clientId);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      inactive: "secondary",
      potential: "outline",
      planning: "outline",
      "in-progress": "default",
      completed: "secondary",
      "on-hold": "destructive",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="clients" className="gap-2">
              <Building2 className="h-4 w-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="works" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Related Work
            </TabsTrigger>
          </TabsList>
          
          {activeTab === "clients" && (
            <Button onClick={handleOpenClientDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          )}
          {activeTab === "works" && (
            <Button onClick={handleOpenWorkDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          )}
        </div>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Directory</CardTitle>
              <CardDescription>Manage your client information and contacts</CardDescription>
              
              {/* Search Bar */}
              <div className="flex items-center gap-2 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clients by name, company, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredClients.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? "No clients found matching your search" : "No clients yet. Add your first client to get started."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client Name</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Projects</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {client.client_name}
                            </div>
                          </TableCell>
                          <TableCell>{client.company_name || "-"}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 text-sm">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                {client.email}
                              </div>
                              {client.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  {client.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{client.industry || "-"}</TableCell>
                          <TableCell>{getStatusBadge(client.status)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getClientWorks(client.id).length} projects
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClient(client)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteDialog(client.id, "client")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Works Tab */}
        <TabsContent value="works" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Projects</CardTitle>
              <CardDescription>Track and manage work done for clients</CardDescription>
            </CardHeader>
            <CardContent>
              {clientWorks.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No projects yet. Add your first client project to get started.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project Name</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Timeline</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientWorks.map((work) => (
                        <TableRow key={work.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              {work.project_name}
                            </div>
                          </TableCell>
                          <TableCell>{getClientName(work.client_id)}</TableCell>
                          <TableCell>{work.project_type}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                {new Date(work.start_date).toLocaleDateString()}
                              </div>
                              {work.end_date && (
                                <span className="text-muted-foreground">
                                  to {new Date(work.end_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-muted-foreground" />
                              {work.budget.toLocaleString()} {work.currency}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(work.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditWork(work)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteDialog(work.id, "work")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Client Dialog */}
      <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingClient ? "Edit Client" : "Add New Client"}</DialogTitle>
            <DialogDescription>
              {editingClient ? "Update client information" : "Enter the details of the new client"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  placeholder="John Doe"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="ABC Corporation"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="client@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+1 234 567 8900"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Main St"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="New York"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  placeholder="NY"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  placeholder="10001"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="United States"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  placeholder="12-3456789"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientStatus">Status</Label>
              <Select value={clientStatus} onValueChange={(value: any) => setClientStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="potential">Potential</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientNotes">Notes</Label>
              <Textarea
                id="clientNotes"
                placeholder="Additional information about the client..."
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setClientDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitClient}>
              {editingClient ? "Update Client" : "Add Client"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Work Dialog */}
      <Dialog open={workDialogOpen} onOpenChange={setWorkDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingWork ? "Edit Project" : "Add New Project"}</DialogTitle>
            <DialogDescription>
              {editingWork ? "Update project information" : "Enter the details of the new project"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useManualClient"
                checked={useManualClient}
                onChange={(e) => setUseManualClient(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="useManualClient" className="cursor-pointer">
                Enter client name manually (not linked to database)
              </Label>
            </div>

            {useManualClient ? (
              <div className="space-y-2">
                <Label htmlFor="manualClientName">Client Name *</Label>
                <Input
                  id="manualClientName"
                  placeholder="Enter client name"
                  value={manualClientName}
                  onChange={(e) => setManualClientName(e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="selectedClient">Client *</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.client_name} ({client.company_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  placeholder="Office Building Renovation"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectType">Project Type</Label>
                <Select value={projectType} onValueChange={setProjectType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget *</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="50000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr} value={curr}>
                        {curr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workStatus">Status</Label>
              <Select value={workStatus} onValueChange={(value: any) => setWorkStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workDescription">Description</Label>
              <Textarea
                id="workDescription"
                placeholder="Project details, scope, deliverables..."
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="border-t pt-4 space-y-4">
              <h3 className="font-semibold text-sm">Team Assignment</h3>
              
              <div className="space-y-2">
                <Label htmlFor="supervisorId">Supervisor</Label>
                <Select value={supervisorId || "none"} onValueChange={(val) => setSupervisorId(val === "none" ? "" : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supervisor (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {employees
                      .filter((emp) => emp.email)
                      .map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} - {emp.role || "Employee"}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Team Members</Label>
                <div className="flex gap-2">
                  <Select 
                    value={currentTeamMemberId || "select"} 
                    onValueChange={(value) => {
                      if (value && value !== "select" && !teamMemberIds.includes(value)) {
                        setTeamMemberIds([...teamMemberIds, value]);
                        setCurrentTeamMemberId("select");
                      }
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Add team member (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select" disabled>-- Select a team member --</SelectItem>
                      {employees
                        .filter((emp) => emp.email && !teamMemberIds.includes(emp.id) && emp.id !== supervisorId)
                        .map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} - {emp.role || "Employee"}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                {teamMemberIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {teamMemberIds.map((id, index) => {
                      const member = employees.find(emp => emp.id === id);
                      return (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {member?.name || id}
                          <button
                            onClick={() => setTeamMemberIds(teamMemberIds.filter((_, i) => i !== index))}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setWorkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitWork}>
              {editingWork ? "Update Project" : "Add Project"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this{" "}
              {itemToDelete?.type === "client" ? "client and all associated projects" : "project"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
