"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, Plus, FileText, Search, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  clientPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes: string;
  status: string;
  createdAt: string;
  createdBy: string;
}

interface InvoiceListProps {
  onCreateNew: () => void;
}

export default function InvoiceList({ onCreateNew }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const { toast } = useToast();

  const fetchInvoices = async () => {
    try {
      const response = await fetch("/api/invoices");
      const data = await response.json();
      
      if (data.success) {
        setInvoices(data.invoices);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch invoices",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast({
        title: "Error",
        description: "Failed to fetch invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const generatePDF = async (invoice: Invoice) => {
    try {
      const doc = new jsPDF();
      
      // Add company logo
      const logoUrl = "/Logo-BIMaided.png";
      const img = new Image();
      img.src = logoUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      doc.addImage(img, "PNG", 15, 10, 40, 15);

      // Company details
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("BIM AIDED", 15, 32);
      doc.text("Architectural Consultancy Services", 15, 37);
      
      // Invoice title
      doc.setFontSize(24);
      doc.setTextColor(0);
      doc.text("INVOICE", 150, 20);
      
      // Invoice details
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Invoice #: ${invoice.invoiceNumber}`, 150, 30);
      doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 150, 36);
      doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 150, 42);

      // Client information
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text("Bill To:", 15, 55);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(invoice.clientName, 15, 62);
      if (invoice.clientAddress) doc.text(invoice.clientAddress, 15, 68);
      if (invoice.clientEmail) doc.text(invoice.clientEmail, 15, 74);
      if (invoice.clientPhone) doc.text(invoice.clientPhone, 15, 80);

      // Items table
      autoTable(doc, {
        startY: 95,
        head: [["Description", "Qty", "Rate", "Amount"]],
        body: (invoice.items || []).map((item) => [
          item.description || "",
          (item.quantity || 0).toString(),
          `₹${(item.rate || 0).toFixed(2)}`,
          `₹${(item.amount || 0).toFixed(2)}`,
        ]),
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        columnStyles: {
          0: { cellWidth: 90 },
          1: { cellWidth: 25, halign: "center" },
          2: { cellWidth: 35, halign: "right" },
          3: { cellWidth: 35, halign: "right" },
        },
      });

      // Calculate final Y position after table
      const finalY = (doc as any).lastAutoTable.finalY + 10;

      // Summary section
      const summaryX = 140;
      doc.setFontSize(10);
      
      doc.setTextColor(100);
      doc.text("Subtotal:", summaryX, finalY);
      doc.text(`₹${(invoice.subtotal || 0).toFixed(2)}`, 185, finalY, { align: "right" });
      
      doc.text(`Tax (${invoice.taxRate || 0}%):`, summaryX, finalY + 7);
      doc.text(`₹${(invoice.taxAmount || 0).toFixed(2)}`, 185, finalY + 7, { align: "right" });
      
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.setFont(undefined, "bold");
      doc.text("Total:", summaryX, finalY + 15);
      doc.text(`₹${(invoice.total || 0).toFixed(2)}`, 185, finalY + 15, { align: "right" });

      // Notes
      if (invoice.notes) {
        doc.setFont(undefined, "normal");
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Notes:", 15, finalY + 25);
        doc.text(invoice.notes, 15, finalY + 32, { maxWidth: 180 });
      }

      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        "Thank you for your business!",
        105,
        pageHeight - 20,
        { align: "center" }
      );

      // Save the PDF
      doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
      
      toast({
        title: "Success",
        description: "Invoice PDF downloaded successfully",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const deleteInvoice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) {
      return;
    }

    try {
      const response = await fetch(`/api/invoices?id=${id}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Invoice deleted successfully",
        });
        fetchInvoices();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete invoice",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-500";
      case "sent":
        return "bg-blue-500";
      case "draft":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  // Filter invoices based on search term and date
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      // Search filter (client name or invoice number)
      const matchesSearch = searchTerm === "" || 
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());

      // Date filter (invoice date)
      const matchesDate = dateFilter === "" || 
        invoice.invoiceDate.startsWith(dateFilter);

      return matchesSearch && matchesDate;
    });
  }, [invoices, searchTerm, dateFilter]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">Loading invoices...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="text-cyan-500" size={24} />
              Saved Invoices
            </CardTitle>
            <CardDescription>
              View and download all saved invoices
            </CardDescription>
          </div>
          <Button onClick={onCreateNew} className="bg-cyan-500 hover:bg-cyan-600">
            <Plus className="mr-2" size={18} />
            Create New Invoice
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {invoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 mb-4">No invoices found</p>
            <Button onClick={onCreateNew} className="bg-cyan-500 hover:bg-cyan-600">
              <Plus className="mr-2" size={18} />
              Create Your First Invoice
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search by client name or invoice number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative sm:w-64">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="date"
                  placeholder="Filter by date..."
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
              {(searchTerm || dateFilter) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setDateFilter("");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-500">
              Showing {filteredInvoices.length} of {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No invoices match your search criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>{invoice.clientName}</TableCell>
                    <TableCell>
                      {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>₹{(invoice.total || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generatePDF(invoice)}
                          title="Download PDF"
                        >
                          <Download size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteInvoice(invoice.id)}
                          title="Delete"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
          </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
