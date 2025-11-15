"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CompanyProfile } from "@/types/invoice";
import { getDocuments, createDocument, updateDocument, deleteDocument } from "@/lib/firebase/firestore";
import { Plus, Edit, Trash2, Star, Building2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function CompanyProfileManager() {
  const [profiles, setProfiles] = useState<CompanyProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<CompanyProfile | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<CompanyProfile>>({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    email: "",
    phone: "",
    website: "",
    taxId: "",
    isDefault: false,
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const { data } = await getDocuments<CompanyProfile>("company_profiles");
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast({
        title: "Error",
        description: "Failed to load company profiles",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      email: "",
      phone: "",
      website: "",
      taxId: "",
      isDefault: false,
    });
    setEditingProfile(null);
  };

  const handleEdit = (profile: CompanyProfile) => {
    setEditingProfile(profile);
    setFormData(profile);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.address) {
      toast({
        title: "Validation Error",
        description: "Company name and address are required",
        variant: "destructive",
      });
      return;
    }

    try {
      // If setting as default, unset all other defaults
      if (formData.isDefault) {
        const defaultProfiles = profiles.filter(p => p.isDefault && p.id !== editingProfile?.id);
        for (const profile of defaultProfiles) {
          if (profile.id) {
            await updateDocument("company_profiles", profile.id, { isDefault: false });
          }
        }
      }

      if (editingProfile && editingProfile.id) {
        await updateDocument("company_profiles", editingProfile.id, formData);
        toast({
          title: "Success",
          description: "Company profile updated successfully",
        });
      } else {
        await createDocument("company_profiles", formData);
        toast({
          title: "Success",
          description: "Company profile created successfully",
        });
      }

      await fetchProfiles();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save company profile",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (profileId: string) => {
    if (!confirm("Are you sure you want to delete this company profile?")) {
      return;
    }

    try {
      await deleteDocument("company_profiles", profileId);
      toast({
        title: "Success",
        description: "Company profile deleted successfully",
      });
      await fetchProfiles();
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast({
        title: "Error",
        description: "Failed to delete company profile",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (profile: CompanyProfile) => {
    if (!profile.id) return;

    try {
      // Unset all other defaults
      const defaultProfiles = profiles.filter(p => p.isDefault && p.id !== profile.id);
      for (const p of defaultProfiles) {
        if (p.id) {
          await updateDocument("company_profiles", p.id, { isDefault: false });
        }
      }

      // Set this one as default
      await updateDocument("company_profiles", profile.id, { isDefault: true });
      
      toast({
        title: "Success",
        description: "Default company profile updated",
      });
      await fetchProfiles();
    } catch (error) {
      console.error("Error setting default:", error);
      toast({
        title: "Error",
        description: "Failed to set default profile",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Company Profiles</h3>
          <p className="text-sm text-muted-foreground">
            Manage your company information for invoices
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProfile ? "Edit Company Profile" : "Add Company Profile"}
              </DialogTitle>
              <DialogDescription>
                Enter your company details to use on invoices
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="BIMaided Ltd."
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Business Street"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Dhaka"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Dhaka"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="1000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Bangladesh"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@bimaided.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+880 1234567890"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="www.bimaided.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="123-456-789"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                />
                <Label htmlFor="isDefault">Set as default profile</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Profile</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading profiles...</div>
      ) : profiles.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No company profiles yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create a company profile to use when creating invoices
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {profiles.map((profile) => (
            <Card key={profile.id} className={profile.isDefault ? "border-cyan-500 border-2" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {profile.name}
                      {profile.isDefault && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {profile.address}
                      {profile.city && `, ${profile.city}`}
                      {profile.state && `, ${profile.state}`}
                      {profile.zipCode && ` ${profile.zipCode}`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(profile)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => profile.id && handleDelete(profile.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {profile.country && <p>Country: {profile.country}</p>}
                  {profile.email && <p>Email: {profile.email}</p>}
                  {profile.phone && <p>Phone: {profile.phone}</p>}
                  {profile.website && <p>Website: {profile.website}</p>}
                  {profile.taxId && <p>Tax ID: {profile.taxId}</p>}
                </div>
                {!profile.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => handleSetDefault(profile)}
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
