import { useState, useEffect } from "react";
import { getDocuments, createDocument, updateDocument, deleteDocument, getDocument } from "@/lib/firebase/firestore";
import { orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Plus, Calendar, CheckCircle, Trash2, Edit, AlertCircle } from "lucide-react";
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

interface Invoice {
  id: string;
  invoice_number: string | null;
  invoice_type: "receivable" | "payable";
  amount: number;
  currency: string;
  assignment_id: string | null;
  assignment_title?: string;
  category: string;
  due_date: string;
  status: "pending" | "paid" | "received" | "overdue";
  notes: string | null;
  paid_date: string | null;
  transaction_id: string | null;
  created_at: string;
}

interface Assignment {
  id: string;
  title: string;
}

const EXPENSE_CATEGORIES = [
  "Software Licenses",
  "Salaries",
  "Hardware",
  "Subcontracting",
  "Training",
  "Utilities",
  "Office Expenses",
  "Other"
];

const INCOME_CATEGORIES = [
  "Project Revenue",
  "Consultation",
  "Maintenance",
  "Training Services",
  "Other"
];

interface InvoiceManagerProps {
  onInvoiceConverted: () => void;
}

export const InvoiceManager = ({ onInvoiceConverted }: InvoiceManagerProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // Form state
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceType, setInvoiceType] = useState<"receivable" | "payable">("payable");
  const [amount, setAmount] = useState("");
  const [assignmentId, setAssignmentId] = useState("");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
    fetchAssignments();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await getDocuments("invoices", [
        orderBy("due_date", "asc")
      ]);

      if (error) {
        console.log("Invoices feature not yet available:", error);
        setInvoices([]);
        setLoading(false);
        return;
      }

      // Enrich with assignment titles
      const invoicesWithAssignments = await Promise.all(
        (data || []).map(async (invoice: any) => {
          let assignment_title = null;
          if (invoice.assignment_id) {
            const { data: assignment } = await getDocument("assignments", invoice.assignment_id);
            assignment_title = assignment?.title || null;
          }
          return {
            ...invoice,
            assignment_title
          };
        })
      );

      // Update overdue status
      const today = new Date().toISOString().split('T')[0];
      invoicesWithAssignments.forEach((invoice: Invoice) => {
        if (invoice.status === 'pending' && invoice.due_date < today) {
          updateInvoiceStatus(invoice.id, 'overdue');
        }
      });

      setInvoices(invoicesWithAssignments);
    } catch (error: any) {
      console.log("Invoices feature not yet available:", error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const { data, error } = await getDocuments("assignments");

      if (!error && data) {
        // Sort by title in JavaScript
        const sortedAssignments = data.sort((a: any, b: any) => 
          (a.title || '').localeCompare(b.title || '')
        );
        setAssignments(sortedAssignments.map((a: any) => ({ id: a.id, title: a.title })));
      }
    } catch (error) {
      console.log("Could not fetch assignments:", error);
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, status: string) => {
    await updateDocument("invoices", invoiceId, {
      status,
      updated_at: new Date().toISOString()
    });
  };

  const resetForm = () => {
    setInvoiceNumber("");
    setInvoiceType("payable");
    setAmount("");
    setAssignmentId("");
    setCategory("");
    setDueDate("");
    setNotes("");
    setEditingInvoice(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setInvoiceNumber(invoice.invoice_number || "");
    setInvoiceType(invoice.invoice_type);
    setAmount(invoice.amount.toString());
    setAssignmentId(invoice.assignment_id || "");
    setCategory(invoice.category);
    setDueDate(invoice.due_date);
    setNotes(invoice.notes || "");
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!amount || !category || !dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const invoiceData = {
        invoice_number: invoiceNumber || null,
        invoice_type: invoiceType,
        amount: parseFloat(amount),
        currency: "BDT",
        assignment_id: assignmentId && assignmentId !== "none" ? assignmentId : null,
        category,
        due_date: dueDate,
        notes: notes || null,
        status: "pending",
      };

      if (editingInvoice) {
        const { error } = await updateDocument("invoices", editingInvoice.id, {
          ...invoiceData,
          updated_at: new Date().toISOString()
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Invoice updated successfully",
        });
      } else {
        const { error } = await createDocument("invoices", {
          ...invoiceData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Invoice added successfully",
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchInvoices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save invoice",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsPaid = async (invoice: Invoice) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Create a transaction
      const transactionData = {
        transaction_date: today,
        transaction_type: invoice.invoice_type === "receivable" ? "income" : "expense",
        amount: invoice.amount,
        currency: invoice.currency,
        assignment_id: invoice.assignment_id,
        category: invoice.category,
        notes: `Payment for invoice ${invoice.invoice_number || invoice.id}${invoice.notes ? ` - ${invoice.notes}` : ''}`,
      };

      const { data: transactionResult, error: transactionError } = await createDocument("transactions", {
        ...transactionData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (transactionError) throw transactionError;

      // Update invoice status
      const newStatus = invoice.invoice_type === "receivable" ? "received" : "paid";
      const transactionId = typeof transactionResult === 'string' ? transactionResult : null;
      const { error: invoiceError } = await updateDocument("invoices", invoice.id, {
        status: newStatus,
        paid_date: today,
        transaction_id: transactionId,
        updated_at: new Date().toISOString(),
      });

      if (invoiceError) throw invoiceError;

      toast({
        title: "Success",
        description: `Invoice marked as ${newStatus} and transaction created`,
      });

      fetchInvoices();
      onInvoiceConverted(); // Notify parent to refresh transactions
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;

    try {
      const { error } = await deleteDocument("invoices", invoiceToDelete);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });

      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
      fetchInvoices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete invoice",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "paid":
      case "received":
        return <Badge variant="default" className="bg-green-600">
          {status === "paid" ? "Paid" : "Received"}
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const categories = invoiceType === "receivable" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const pendingInvoices = invoices.filter(i => i.status === "pending" || i.status === "overdue");
  const completedInvoices = invoices.filter(i => i.status === "paid" || i.status === "received");

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Upcoming Invoices</h3>
          <p className="text-gray-500 text-sm">
            Track invoices payable and receivable
          </p>
        </div>
        <Button onClick={handleOpenDialog} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Invoice
        </Button>
      </div>

      {/* Pending Invoices */}
      <div>
        <h4 className="text-lg font-semibold mb-3">Pending ({pendingInvoices.length})</h4>
        {pendingInvoices.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No pending invoices
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingInvoices.map((invoice) => (
              <Card key={invoice.id} className="border-l-4" style={{
                borderLeftColor: invoice.status === "overdue" ? "#dc2626" : 
                                invoice.invoice_type === "receivable" ? "#16a34a" : "#f59e0b"
              }}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(invoice.status)}
                        <Badge variant={invoice.invoice_type === "receivable" ? "default" : "outline"}>
                          {invoice.invoice_type === "receivable" ? "Receivable" : "Payable"}
                        </Badge>
                        <Badge variant="outline">{invoice.category}</Badge>
                        {invoice.invoice_number && (
                          <span className="text-sm text-muted-foreground">#{invoice.invoice_number}</span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          Due: {formatDate(invoice.due_date)}
                        </div>
                        {invoice.assignment_title && (
                          <div className="text-muted-foreground">
                            Assignment: {invoice.assignment_title}
                          </div>
                        )}
                        <div className="font-bold text-lg">
                          {formatCurrency(Number(invoice.amount))}
                        </div>
                      </div>
                      {invoice.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Note: {invoice.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleMarkAsPaid(invoice)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark {invoice.invoice_type === "receivable" ? "Received" : "Paid"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditInvoice(invoice)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setInvoiceToDelete(invoice.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Completed Invoices */}
      {completedInvoices.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-3">Completed ({completedInvoices.length})</h4>
          <div className="space-y-3">
            {completedInvoices.map((invoice) => (
              <Card key={invoice.id} className="opacity-75">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(invoice.status)}
                        <Badge variant="outline">{invoice.category}</Badge>
                        {invoice.invoice_number && (
                          <span className="text-sm text-muted-foreground">#{invoice.invoice_number}</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Paid on: {invoice.paid_date ? formatDate(invoice.paid_date) : "N/A"}
                      </div>
                      <div className="font-bold">
                        {formatCurrency(Number(invoice.amount))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Invoice Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingInvoice ? "Edit Invoice" : "Add New Invoice"}</DialogTitle>
            <DialogDescription>
              Track upcoming payments (payable) or receipts (receivable)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice_number">Invoice Number (Optional)</Label>
                <Input
                  id="invoice_number"
                  placeholder="INV-001"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="invoice_type">Type *</Label>
                <Select value={invoiceType} onValueChange={(value: "receivable" | "payable") => {
                  setInvoiceType(value);
                  setCategory("");
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receivable">Receivable (Income)</SelectItem>
                    <SelectItem value="payable">Payable (Expense)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount (BDT) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={category || undefined} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assignment">Assignment (Optional)</Label>
                <Select value={assignmentId || undefined} onValueChange={(value) => setAssignmentId(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignment (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Assignment</SelectItem>
                    {assignments.map((assignment) => (
                      <SelectItem key={assignment.id} value={assignment.id}>
                        {assignment.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
              {editingInvoice ? "Update" : "Add"} Invoice
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
              This will permanently delete the invoice. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteInvoice}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
