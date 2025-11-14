"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Plus, Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceGeneratorProps {
  onSave?: () => void;
}

const InvoiceGenerator = ({ onSave }: InvoiceGeneratorProps = {}) => {
  const { toast } = useToast();
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    clientName: "",
    clientAddress: "",
    clientEmail: "",
    clientPhone: "",
    notes: "",
    taxRate: 0,
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, rate: 0, amount: 0 }
  ]);

  const handleInputChange = (field: string, value: string | number) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = Number(updated.quantity) * Number(updated.rate);
        }
        return updated;
      }
      return item;
    }));
  };

  const addItem = () => {
    setItems(prev => [...prev, {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (invoiceData.taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const saveInvoice = async (andGeneratePDF: boolean = false) => {
    // Validation
    if (!invoiceData.invoiceNumber || !invoiceData.clientName) {
      toast({
        title: "Validation Error",
        description: "Please fill in Invoice Number and Client Name",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0 || items.every(item => !item.description)) {
      toast({
        title: "Validation Error",
        description: "Please add at least one item",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceNumber: invoiceData.invoiceNumber,
          invoiceDate: invoiceData.invoiceDate,
          dueDate: invoiceData.dueDate,
          clientName: invoiceData.clientName,
          clientAddress: invoiceData.clientAddress,
          clientEmail: invoiceData.clientEmail,
          clientPhone: invoiceData.clientPhone,
          items: items.map(({ id, ...item }) => item),
          subtotal: calculateSubtotal(),
          taxRate: invoiceData.taxRate,
          taxAmount: calculateTax(),
          total: calculateTotal(),
          notes: invoiceData.notes,
          status: "draft",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Invoice saved successfully",
        });

        if (andGeneratePDF) {
          await generatePDF();
        }

        // Reset form
        setInvoiceData({
          invoiceNumber: "",
          invoiceDate: new Date().toISOString().split('T')[0],
          dueDate: "",
          clientName: "",
          clientAddress: "",
          clientEmail: "",
          clientPhone: "",
          notes: "",
          taxRate: 0,
        });
        setItems([{ id: "1", description: "", quantity: 1, rate: 0, amount: 0 }]);

        // Call onSave callback if provided
        if (onSave) {
          onSave();
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to save invoice",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast({
        title: "Error",
        description: "Failed to save invoice",
        variant: "destructive",
      });
    }
  };

  const generatePDF = async () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // === HEADER SECTION (Gray background) ===
      doc.setFillColor(249, 250, 251); // bg-gray-50
      doc.rect(0, 0, pageWidth, 50, "F");
      doc.setDrawColor(229, 231, 235); // border-gray-300
      doc.line(0, 50, pageWidth, 50);

      // Company logo/box (top right - indigo square)
      const logoUrl = "/Logo-BIMaided.png";
      try {
        doc.addImage(logoUrl, "PNG", pageWidth - 45, 10, 16, 16);
      } catch (error) {
        // Fallback: indigo square
        doc.setFillColor(99, 102, 241); // indigo-500
        doc.rect(pageWidth - 45, 10, 16, 16, "F");
      }

      // Company name (below logo, indigo color)
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(99, 102, 241); // indigo-500
      doc.text("Panda, Inc", pageWidth - 20, 32, { align: "right" });

      // Company details (right side, gray color)
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128); // gray-500
      doc.text("Business address", pageWidth - 20, 36, { align: "right" });
      doc.text("City, State, IN - 000 000", pageWidth - 20, 40, { align: "right" });
      doc.text("TAX ID 00XXXXX1234X0XX", pageWidth - 20, 44, { align: "right" });

      // Invoice title (left side, large)
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(24, 24, 27); // zinc-900
      doc.text("INVOICE", 20, 22);

      // Billed to section (left side)
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(24, 24, 27);
      doc.text("Billed to", 20, 30);

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(107, 114, 128); // gray-500
      doc.text(invoiceData.clientName || "Company Name", 20, 36);

      doc.setFont("helvetica", "normal");
      const clientAddress = invoiceData.clientAddress || "Company address\nCity, Country - 00000";
      const addressLines = doc.splitTextToSize(clientAddress, 70);
      let clientY = 40;
      addressLines.forEach((line: string) => {
        doc.text(line, 20, clientY);
        clientY += 4;
      });

      // === INVOICE DETAILS & TABLE SECTION ===
      const detailsStartY = 72;

      // Left column: Invoice metadata in vertical stack
      doc.setFontSize(8);
      doc.setTextColor(24, 24, 27); // zinc-900
      doc.setFont("helvetica", "bold");
      
      const details = [
        { label: "Invoice #", value: invoiceData.invoiceNumber || "AB2324-01" },
        { label: "Invoice date", value: new Date(invoiceData.invoiceDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) },
        { label: "Reference", value: "INV-057" },
        { label: "Due date", value: invoiceData.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : "15 Aug, 2023" }
      ];

      let detailY = detailsStartY + 7;
      details.forEach(detail => {
        doc.setTextColor(24, 24, 27);
        doc.setFont("helvetica", "bold");
        doc.text(detail.label, 20, detailY);
        
        doc.setTextColor(107, 114, 128);
        doc.text(detail.value, 20, detailY + 4);
        
        detailY += 14;
      });

      // Right side: Table with rounded border
      const tableX = 60;
      const tableY = detailsStartY;
      const tableWidth = pageWidth - tableX - 20;
      const tableHeight = 92;

      // Draw rounded rectangle border
      doc.setDrawColor(209, 213, 219); // gray-300
      doc.setLineWidth(0.5);
      doc.roundedRect(tableX, tableY, tableWidth, tableHeight, 2, 2);

      // Table header: "Services"
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(24, 24, 27);
      doc.text("Services", tableX + 5, tableY + 6);

      // Column headers
      doc.text("Qty", tableX + 88, tableY + 6);
      doc.text("Rate", tableX + 116, tableY + 6, { align: "right" });
      doc.text("Line total", pageWidth - 28, tableY + 6, { align: "right" });

      // Header separator line
      doc.setDrawColor(229, 231, 235);
      doc.line(tableX, tableY + 10, tableX + tableWidth, tableY + 10);

      // Items (up to 4)
      let itemY = tableY + 16;
      doc.setFont("helvetica", "bold");
      items.slice(0, 4).forEach((item, index) => {
        doc.setTextColor(24, 24, 27);
        doc.text(item.description || "Item Name", tableX + 5, itemY);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text(item.quantity.toString(), tableX + 88, itemY);
        doc.text(`$${item.rate.toFixed(2)}`, tableX + 116, itemY, { align: "right" });
        doc.text(`$${item.amount.toFixed(2)}`, pageWidth - 28, itemY, { align: "right" });

        doc.setFont("helvetica", "bold");
        itemY += 12;
        
        // Separator lines between items
        if (index < Math.min(items.length, 3)) {
          doc.setDrawColor(229, 231, 235);
          doc.line(tableX + 5, itemY - 4, tableX + tableWidth - 5, itemY - 4);
        }
      });

      // Subtotal and Tax section separator
      const totalsY = tableY + 60;
      doc.setDrawColor(229, 231, 235);
      doc.line(tableX, totalsY, tableX + tableWidth, totalsY);

      // Subtotal
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(24, 24, 27);
      doc.text("Subtotal", tableX + 5, totalsY + 6);
      doc.setTextColor(107, 114, 128);
      doc.text(`$${calculateSubtotal().toFixed(2)}`, pageWidth - 28, totalsY + 6, { align: "right" });

      // Tax
      doc.setTextColor(24, 24, 27);
      doc.text(`Tax (${invoiceData.taxRate}%)`, tableX + 5, totalsY + 12);
      doc.setTextColor(107, 114, 128);
      doc.text(`$${calculateTax().toFixed(2)}`, pageWidth - 28, totalsY + 12, { align: "right" });

      // Total Due (highlighted with gray background)
      const totalDueY = tableY + tableHeight - 8;
      doc.setFillColor(249, 250, 251); // bg-gray-50
      doc.rect(tableX, totalDueY - 4, tableWidth, 12, "F");
      doc.setDrawColor(229, 231, 235);
      doc.line(tableX, totalDueY - 4, tableX + tableWidth, totalDueY - 4);

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(79, 70, 229); // indigo-600
      doc.text("Total due", tableX + 5, totalDueY + 2);
      doc.text(`US$ ${calculateTotal().toFixed(2)}`, pageWidth - 28, totalDueY + 2, { align: "right" });

      // === PAYMENT TERMS (with bullet) ===
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      
      // Bullet point (small square)
      doc.setFillColor(161, 161, 170); // zinc-400
      doc.rect(78, 170, 2, 2, "F");
      
      doc.text("Please pay within 15 days of receiving this invoice.", 84, 172);

      // === FOOTER (Gray background) ===
      const footerHeight = 22;
      doc.setFillColor(249, 250, 251); // bg-gray-50
      doc.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, "F");
      doc.setDrawColor(229, 231, 235);
      doc.line(0, pageHeight - footerHeight, pageWidth, pageHeight - footerHeight);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      
      const footerY = pageHeight - 10;
      doc.text("www.website.com", 20, footerY);
      doc.text("+91 00000 00000", pageWidth / 2, footerY, { align: "center" });
      doc.text("hello@email.com", pageWidth - 20, footerY, { align: "right" });

      // Save the PDF
      const fileName = `Invoice_${invoiceData.invoiceNumber || Date.now()}.pdf`;
      doc.save(fileName);

      toast({
        title: "Invoice generated",
        description: `PDF saved as ${fileName}`,
      });
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error generating invoice",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Generator
          </CardTitle>
          <CardDescription>Create professional invoices with your company branding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number *</Label>
              <Input
                id="invoiceNumber"
                value={invoiceData.invoiceNumber}
                onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                placeholder="INV-001"
              />
            </div>
            <div>
              <Label htmlFor="invoiceDate">Invoice Date *</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={invoiceData.invoiceDate}
                onChange={(e) => handleInputChange("invoiceDate", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
              />
            </div>
          </div>

          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={invoiceData.clientName}
                  onChange={(e) => handleInputChange("clientName", e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={invoiceData.clientEmail}
                  onChange={(e) => handleInputChange("clientEmail", e.target.value)}
                  placeholder="client@example.com"
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">Client Phone</Label>
                <Input
                  id="clientPhone"
                  value={invoiceData.clientPhone}
                  onChange={(e) => handleInputChange("clientPhone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="clientAddress">Client Address</Label>
                <Textarea
                  id="clientAddress"
                  value={invoiceData.clientAddress}
                  onChange={(e) => handleInputChange("clientAddress", e.target.value)}
                  placeholder="123 Main St, City, State ZIP"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Invoice Items</h3>
              <Button onClick={addItem} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    {index === 0 && <Label className="text-xs mb-1">Description</Label>}
                    <Input
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                      placeholder="Service or product description"
                    />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <Label className="text-xs mb-1">Quantity</Label>}
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <Label className="text-xs mb-1">Rate ($)</Label>}
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleItemChange(item.id, "rate", Number(e.target.value))}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <Label className="text-xs mb-1">Amount</Label>}
                    <Input
                      value={`$${item.amount.toFixed(2)}`}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="col-span-1">
                    {index === 0 && <div className="h-5 mb-1"></div>}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax and Totals */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  value={invoiceData.taxRate}
                  onChange={(e) => handleInputChange("taxRate", Number(e.target.value))}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-end space-y-2">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  {invoiceData.taxRate > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tax ({invoiceData.taxRate}%):</span>
                      <span className="font-medium">${calculateTax().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes / Terms</Label>
            <Textarea
              id="notes"
              value={invoiceData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Payment terms, thank you message, or additional notes..."
              rows={4}
            />
          </div>

          {/* Generate Button */}
          <div className="flex justify-end gap-3">
            <Button 
              onClick={() => saveInvoice(false)} 
              size="lg" 
              variant="outline"
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Save Invoice
            </Button>
            <Button 
              onClick={() => saveInvoice(true)} 
              size="lg" 
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Save & Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceGenerator;
