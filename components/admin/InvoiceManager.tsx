"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Building2, Landmark, Plus } from "lucide-react";
import CompanyProfileManager from "./CompanyProfileManager";
import BankDetailsManager from "./BankDetailsManager";
import InvoiceForm from "./InvoiceForm";
import InvoiceList from "./InvoiceList";
import { Invoice } from "@/types/invoice";

export default function InvoiceManager() {
  const [activeTab, setActiveTab] = useState("invoices");
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const handleCreateNew = () => {
    setEditingInvoice(null);
    setShowForm(true);
    setActiveTab("create");
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
    setActiveTab("create");
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingInvoice(null);
    setActiveTab("invoices");
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingInvoice(null);
    setActiveTab("invoices");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Invoice Management</h2>
          <p className="text-muted-foreground">
            Create, manage, and download professional invoices
          </p>
        </div>
        {activeTab === "invoices" && (
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="invoices" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Invoices</span>
          </TabsTrigger>
          <TabsTrigger value="create" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create/Edit</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Company</span>
          </TabsTrigger>
          <TabsTrigger value="bank" className="gap-2">
            <Landmark className="h-4 w-4" />
            <span className="hidden sm:inline">Bank Details</span>
          </TabsTrigger>
        </TabsList>

        {/* Invoice List Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>
                View, search, and manage all your invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceList onEdit={handleEdit} refreshTrigger={refreshTrigger} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create/Edit Invoice Tab */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingInvoice ? "Edit Invoice" : "Create New Invoice"}
              </CardTitle>
              <CardDescription>
                {editingInvoice 
                  ? `Editing invoice ${editingInvoice.invoiceNumber}`
                  : "Fill in the details below to create a new invoice"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceForm
                editingInvoice={editingInvoice}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Profiles Tab */}
        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Profiles</CardTitle>
              <CardDescription>
                Manage your company information that appears on invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyProfileManager />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bank Details Tab */}
        <TabsContent value="bank" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bank Account Details</CardTitle>
              <CardDescription>
                Manage bank account information for invoice payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BankDetailsManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
