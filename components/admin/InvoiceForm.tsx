"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Invoice, InvoiceItem, CompanyProfile, BankDetails, ClientInfo } from "@/types/invoice";
import { Client } from "@/types/client";
import { getDocuments, createDocument, updateDocument } from "@/lib/firebase/firestore";
import { where } from "firebase/firestore";
import { Plus, Trash2, Download, Eye } from "lucide-react";
import { downloadInvoicePDF, previewInvoicePDF } from "@/lib/pdf/invoice-generator";
import { format } from "date-fns";

interface InvoiceFormProps {
  editingInvoice?: Invoice | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function InvoiceForm({ editingInvoice, onSuccess, onCancel }: InvoiceFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyProfiles, setCompanyProfiles] = useState<CompanyProfile[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetails[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  // Form state
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState("");
  const [fromProfileId, setFromProfileId] = useState("");
  const [currency, setCurrency] = useState<'USD' | 'BDT'>("USD");
  const [bankDetailsId, setBankDetailsId] = useState("");
  const [status, setStatus] = useState<'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'>("draft");
  
  const [billedTo, setBilledTo] = useState<ClientInfo>({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    email: "",
    phone: "",
    taxId: "",
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", name: "", description: "", quantity: 1, rate: 0, amount: 0 }
  ]);

  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>("percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [taxType, setTaxType] = useState<'percentage' | 'fixed'>("percentage");
  const [taxValue, setTaxValue] = useState(0);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");

  useEffect(() => {
    fetchProfiles();
    fetchBankDetails();
    fetchClients();
    generateInvoiceNumber();
  }, []);

  useEffect(() => {
    if (editingInvoice) {
      populateForm(editingInvoice);
    }
  }, [editingInvoice]);

  useEffect(() => {
    // Auto-select default bank details when currency changes
    const defaultBank = bankDetails.find(b => b.currency === currency && b.isDefault);
    if (defaultBank?.id) {
      setBankDetailsId(defaultBank.id);
    } else {
      setBankDetailsId("");
    }
  }, [currency, bankDetails]);

  const populateForm = (invoice: Invoice) => {
    setInvoiceNumber(invoice.invoiceNumber);
    setInvoiceDate(invoice.invoiceDate);
    setDueDate(invoice.dueDate || "");
    setFromProfileId(invoice.fromProfileId);
    setCurrency(invoice.currency);
    setBankDetailsId(invoice.bankDetailsId || "");
    setStatus(invoice.status);
    setBilledTo(invoice.billedTo);
    setItems(invoice.items);
    setDiscountType(invoice.discountType);
    setDiscountValue(invoice.discountValue);
    setTaxType(invoice.taxType);
    setTaxValue(invoice.taxValue);
    setNotes(invoice.notes || "");
    setTerms(invoice.terms || "");
  };

  const fetchProfiles = async () => {
    try {
      const { data } = await getDocuments<CompanyProfile>("company_profiles");
      setCompanyProfiles(data || []);
      
      // Auto-select default profile
      const defaultProfile = data?.find(p => p.isDefault);
      if (defaultProfile?.id && !editingInvoice) {
        setFromProfileId(defaultProfile.id);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  const fetchBankDetails = async () => {
    try {
      const { data } = await getDocuments<BankDetails>("bank_details");
      setBankDetails(data || []);
    } catch (error) {
      console.error("Error fetching bank details:", error);
    }
  };

  const fetchClients = async () => {
    try {
      const { data } = await getDocuments<Client>("clients");
      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    if (clientId === "manual") {
      // Clear all fields for manual entry
      setBilledTo({
        name: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        email: "",
        phone: "",
        taxId: "",
      });
      return;
    }

    const client = clients.find(c => c.id === clientId);
    if (client) {
      setBilledTo({
        name: client.client_name,
        address: client.address || "",
        city: client.city || "",
        state: client.state || "",
        zipCode: client.zip_code || "",
        country: client.country || "",
        email: client.email || "",
        phone: client.phone || "",
        taxId: client.tax_id || "",
      });
    }
  };

  const generateInvoiceNumber = async () => {
    if (editingInvoice) return;
    
    try {
      const { data } = await getDocuments("invoices");
      const count = (data?.length || 0) + 1;
      const year = new Date().getFullYear();
      const number = `INV-${year}-${String(count).padStart(4, '0')}`;
      setInvoiceNumber(number);
    } catch (error) {
      console.error("Error generating invoice number:", error);
      setInvoiceNumber(`INV-${Date.now()}`);
    }
  };

  const addItem = () => {
    const newId = String(items.length + 1);
    setItems([...items, { id: newId, name: "", description: "", quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = updated.quantity * updated.rate;
        }
        return updated;
      }
      return item;
    }));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === 'percentage') {
      return subtotal * (discountValue / 100);
    }
    return discountValue;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const afterDiscount = subtotal - discount;
    
    if (taxType === 'percentage') {
      return afterDiscount * (taxValue / 100);
    }
    return taxValue;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax;
  };

  const validateForm = (): boolean => {
    if (!invoiceNumber) {
      toast({ title: "Error", description: "Invoice number is required", variant: "destructive" });
      return false;
    }
    if (!invoiceDate) {
      toast({ title: "Error", description: "Invoice date is required", variant: "destructive" });
      return false;
    }
    if (!fromProfileId) {
      toast({ title: "Error", description: "Please select a company profile", variant: "destructive" });
      return false;
    }
    if (!billedTo.name || !billedTo.address) {
      toast({ title: "Error", description: "Client name and address are required", variant: "destructive" });
      return false;
    }
    if (items.length === 0 || !items[0].name) {
      toast({ title: "Error", description: "At least one invoice item is required", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSave = async (generatePdf: boolean = false) => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const fromProfile = companyProfiles.find(p => p.id === fromProfileId);
      const bankDetail = bankDetails.find(b => b.id === bankDetailsId);

      const invoiceData: Invoice = {
        invoiceNumber,
        invoiceDate,
        dueDate,
        fromProfileId,
        fromProfile,
        billedTo,
        items,
        subtotal: calculateSubtotal(),
        discountType,
        discountValue,
        discountAmount: calculateDiscount(),
        taxType,
        taxValue,
        taxAmount: calculateTax(),
        total: calculateTotal(),
        currency,
        bankDetailsId,
        bankDetails: bankDetail,
        notes,
        terms,
        status,
      };

      if (editingInvoice && editingInvoice.id) {
        await updateDocument("invoices", editingInvoice.id, invoiceData);
        toast({ title: "Success", description: "Invoice updated successfully" });
      } else {
        await createDocument("invoices", invoiceData);
        toast({ title: "Success", description: "Invoice created successfully" });
      }

      if (generatePdf) {
        await downloadInvoicePDF(invoiceData);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast({ title: "Error", description: "Failed to save invoice", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = async () => {
    if (!validateForm()) return;

    const fromProfile = companyProfiles.find(p => p.id === fromProfileId);
    const bankDetail = bankDetails.find(b => b.id === bankDetailsId);

    const invoiceData: Invoice = {
      invoiceNumber,
      invoiceDate,
      dueDate,
      fromProfileId,
      fromProfile,
      billedTo,
      items,
      subtotal: calculateSubtotal(),
      discountType,
      discountValue,
      discountAmount: calculateDiscount(),
      taxType,
      taxValue,
      taxAmount: calculateTax(),
      total: calculateTotal(),
      currency,
      bankDetailsId,
      bankDetails: bankDetail,
      notes,
      terms,
      status,
    };

    await previewInvoicePDF(invoiceData);
  };

  const filteredBankDetails = bankDetails.filter(b => b.currency === currency);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="invoiceNumber">Invoice Number *</Label>
              <Input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-2024-0001"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="invoiceDate">Invoice Date *</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fromProfile">From (Company Profile) *</Label>
              <Select value={fromProfileId} onValueChange={setFromProfileId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company profile" />
                </SelectTrigger>
                <SelectContent>
                  {companyProfiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id!}>
                      {profile.name} {profile.isDefault && "(Default)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select value={currency} onValueChange={(value: 'USD' | 'BDT') => setCurrency(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="BDT">BDT (৳)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billed To Section */}
      <Card>
        <CardHeader>
          <CardTitle>Billed To</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="selectClient">Select Client</Label>
            <Select value={selectedClientId} onValueChange={handleClientSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select from existing clients or enter manually" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">⌨️ Enter Manually</SelectItem>
                {clients
                  .filter(c => c.status === "active")
                  .map(client => (
                    <SelectItem key={client.id} value={client.id!}>
                      {client.client_name} {client.email ? `(${client.email})` : ""}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={billedTo.name}
                onChange={(e) => setBilledTo({ ...billedTo, name: e.target.value })}
                placeholder="Client Company Name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientEmail">Email</Label>
              <Input
                id="clientEmail"
                type="email"
                value={billedTo.email}
                onChange={(e) => setBilledTo({ ...billedTo, email: e.target.value })}
                placeholder="client@example.com"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="clientAddress">Address *</Label>
            <Textarea
              id="clientAddress"
              value={billedTo.address}
              onChange={(e) => setBilledTo({ ...billedTo, address: e.target.value })}
              placeholder="Client address"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="clientCity">City</Label>
              <Input
                id="clientCity"
                value={billedTo.city}
                onChange={(e) => setBilledTo({ ...billedTo, city: e.target.value })}
                placeholder="City"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientState">State/Province</Label>
              <Input
                id="clientState"
                value={billedTo.state}
                onChange={(e) => setBilledTo({ ...billedTo, state: e.target.value })}
                placeholder="State"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientZip">Zip Code</Label>
              <Input
                id="clientZip"
                value={billedTo.zipCode}
                onChange={(e) => setBilledTo({ ...billedTo, zipCode: e.target.value })}
                placeholder="Zip"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientCountry">Country</Label>
              <Input
                id="clientCountry"
                value={billedTo.country}
                onChange={(e) => setBilledTo({ ...billedTo, country: e.target.value })}
                placeholder="Country"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="clientPhone">Phone</Label>
              <Input
                id="clientPhone"
                value={billedTo.phone}
                onChange={(e) => setBilledTo({ ...billedTo, phone: e.target.value })}
                placeholder="+1234567890"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientTaxId">Tax ID</Label>
              <Input
                id="clientTaxId"
                value={billedTo.taxId}
                onChange={(e) => setBilledTo({ ...billedTo, taxId: e.target.value })}
                placeholder="Tax ID"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Invoice Items</CardTitle>
            <Button onClick={addItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <span className="font-semibold">Item #{index + 1}</span>
                {items.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Item Name *</Label>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    placeholder="Service or product name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Item description"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Rate *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={item.amount.toFixed(2)}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-semibold">{currency === 'USD' ? '$' : '৳'}{calculateSubtotal().toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Discount Type</Label>
                <Select value={discountType} onValueChange={(value: any) => setDiscountType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Discount Value</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span>Discount:</span>
              <span className="font-semibold">-{currency === 'USD' ? '$' : '৳'}{calculateDiscount().toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tax/AIT Type</Label>
                <Select value={taxType} onValueChange={(value: any) => setTaxType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Tax/AIT Value</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={taxValue}
                  onChange={(e) => setTaxValue(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span>Tax/AIT:</span>
              <span className="font-semibold">{currency === 'USD' ? '$' : '৳'}{calculateTax().toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span className="text-cyan-500">{currency === 'USD' ? '$' : '৳'}{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>Bank Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Label>Bank Account ({currency})</Label>
            <Select value={bankDetailsId || "none"} onValueChange={(value) => setBankDetailsId(value === "none" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select bank account (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {filteredBankDetails.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id!}>
                    {bank.bankName} - {bank.accountNumber} {bank.isDefault && "(Default)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes or instructions"
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea
              id="terms"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Payment terms and conditions"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-end">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button variant="outline" onClick={handlePreview} disabled={isSubmitting}>
          <Eye className="h-4 w-4 mr-2" />
          Preview PDF
        </Button>
        <Button variant="outline" onClick={() => handleSave(false)} disabled={isSubmitting}>
          Save Draft
        </Button>
        <Button onClick={() => handleSave(true)} disabled={isSubmitting}>
          <Download className="h-4 w-4 mr-2" />
          Save & Download PDF
        </Button>
      </div>
    </div>
  );
}
