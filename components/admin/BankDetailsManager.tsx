"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BankDetails } from "@/types/invoice";
import { getDocuments, createDocument, updateDocument, deleteDocument } from "@/lib/firebase/firestore";
import { Plus, Edit, Trash2, Star, Landmark } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function BankDetailsManager() {
  const [bankDetails, setBankDetails] = useState<BankDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<BankDetails | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<BankDetails>>({
    bankName: "",
    accountName: "",
    accountNumber: "",
    routingNumber: "",
    swiftCode: "",
    branchName: "",
    branchAddress: "",
    currency: "USD",
    isDefault: false,
  });

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    setIsLoading(true);
    try {
      const { data } = await getDocuments<BankDetails>("bank_details");
      setBankDetails(data || []);
    } catch (error) {
      console.error("Error fetching bank details:", error);
      toast({
        title: "Error",
        description: "Failed to load bank details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      bankName: "",
      accountName: "",
      accountNumber: "",
      routingNumber: "",
      swiftCode: "",
      branchName: "",
      branchAddress: "",
      currency: "USD",
      isDefault: false,
    });
    setEditingBank(null);
  };

  const handleEdit = (bank: BankDetails) => {
    setEditingBank(bank);
    setFormData(bank);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.bankName || !formData.accountName || !formData.accountNumber) {
      toast({
        title: "Validation Error",
        description: "Bank name, account name, and account number are required",
        variant: "destructive",
      });
      return;
    }

    try {
      // If setting as default, unset all other defaults for the same currency
      if (formData.isDefault) {
        const defaultBanks = bankDetails.filter(
          b => b.isDefault && b.currency === formData.currency && b.id !== editingBank?.id
        );
        for (const bank of defaultBanks) {
          if (bank.id) {
            await updateDocument("bank_details", bank.id, { isDefault: false });
          }
        }
      }

      if (editingBank && editingBank.id) {
        await updateDocument("bank_details", editingBank.id, formData);
        toast({
          title: "Success",
          description: "Bank details updated successfully",
        });
      } else {
        await createDocument("bank_details", formData);
        toast({
          title: "Success",
          description: "Bank details created successfully",
        });
      }

      await fetchBankDetails();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving bank details:", error);
      toast({
        title: "Error",
        description: "Failed to save bank details",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (bankId: string) => {
    if (!confirm("Are you sure you want to delete these bank details?")) {
      return;
    }

    try {
      await deleteDocument("bank_details", bankId);
      toast({
        title: "Success",
        description: "Bank details deleted successfully",
      });
      await fetchBankDetails();
    } catch (error) {
      console.error("Error deleting bank details:", error);
      toast({
        title: "Error",
        description: "Failed to delete bank details",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (bank: BankDetails) => {
    if (!bank.id) return;

    try {
      // Unset all other defaults for the same currency
      const defaultBanks = bankDetails.filter(
        b => b.isDefault && b.currency === bank.currency && b.id !== bank.id
      );
      for (const b of defaultBanks) {
        if (b.id) {
          await updateDocument("bank_details", b.id, { isDefault: false });
        }
      }

      // Set this one as default
      await updateDocument("bank_details", bank.id, { isDefault: true });
      
      toast({
        title: "Success",
        description: "Default bank details updated",
      });
      await fetchBankDetails();
    } catch (error) {
      console.error("Error setting default:", error);
      toast({
        title: "Error",
        description: "Failed to set default bank details",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Bank Details</h3>
          <p className="text-sm text-muted-foreground">
            Manage bank account information for invoices
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Bank Details
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBank ? "Edit Bank Details" : "Add Bank Details"}
              </DialogTitle>
              <DialogDescription>
                Enter bank account information to display on invoices
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="Standard Chartered Bank"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="accountName">Account Name *</Label>
                <Input
                  id="accountName"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder="BIMaided Ltd."
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="1234567890"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="routingNumber">Routing Number</Label>
                  <Input
                    id="routingNumber"
                    value={formData.routingNumber}
                    onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
                    placeholder="123456789"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="swiftCode">SWIFT Code</Label>
                  <Input
                    id="swiftCode"
                    value={formData.swiftCode}
                    onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                    placeholder="SCBLBDDH"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="branchName">Branch Name</Label>
                <Input
                  id="branchName"
                  value={formData.branchName}
                  onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                  placeholder="Gulshan Branch"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="branchAddress">Branch Address</Label>
                <Textarea
                  id="branchAddress"
                  value={formData.branchAddress}
                  onChange={(e) => setFormData({ ...formData, branchAddress: e.target.value })}
                  placeholder="123 Main Street, Gulshan, Dhaka"
                  rows={2}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="currency">Currency *</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value: 'USD' | 'BDT') => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="BDT">BDT (৳)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                />
                <Label htmlFor="isDefault">Set as default for {formData.currency}</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Bank Details</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading bank details...</div>
      ) : bankDetails.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Landmark className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No bank details yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Add bank account information to display on invoices
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {bankDetails.map((bank) => (
            <Card key={bank.id} className={bank.isDefault ? "border-cyan-500 border-2" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {bank.bankName}
                      {bank.isDefault && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {bank.accountName}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(bank)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => bank.id && handleDelete(bank.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>Account Number: {bank.accountNumber}</p>
                  {bank.routingNumber && <p>Routing: {bank.routingNumber}</p>}
                  {bank.swiftCode && <p>SWIFT: {bank.swiftCode}</p>}
                  {bank.branchName && <p>Branch: {bank.branchName}</p>}
                  <p className="font-semibold">Currency: {bank.currency}</p>
                </div>
                {!bank.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => handleSetDefault(bank)}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Set as Default
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
