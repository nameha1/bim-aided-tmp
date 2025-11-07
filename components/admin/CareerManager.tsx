import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CareerManager = () => {
  const [postings, setPostings] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPosting, setEditingPosting] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    departmentId: "",
    location: "",
    employmentType: "",
    description: "",
    requirements: "",
    responsibilities: "",
    closingDate: "",
    published: true,
  });

  useEffect(() => {
    fetchPostings();
    fetchDepartments();
  }, []);

  const fetchPostings = async () => {
    try {
      const { data, error } = await supabase
        .from("career_postings")
        .select("*, departments!career_postings_department_id_fkey(name)")
        .order("posted_date", { ascending: false });

      if (error) throw error;
      setPostings(data || []);
    } catch (error) {
      console.error("Error fetching postings:", error);
    }
  };

  const fetchDepartments = async () => {
    const { data } = await supabase.from("departments").select("*");
    setDepartments(data || []);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      departmentId: "",
      location: "",
      employmentType: "",
      description: "",
      requirements: "",
      responsibilities: "",
      closingDate: "",
      published: true,
    });
    setEditingPosting(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const postingData = {
        title: formData.title,
        department_id: formData.departmentId || null,
        location: formData.location,
        employment_type: formData.employmentType,
        description: formData.description,
        requirements: formData.requirements || null,
        responsibilities: formData.responsibilities || null,
        closing_date: formData.closingDate || null,
        published: formData.published,
      } as any;

      if (editingPosting) {
        const { error } = await supabase
          .from("career_postings")
          .update(postingData)
          .eq("id", editingPosting.id);

        if (error) throw error;

        toast({
          title: "Career posting updated",
          description: "The posting has been updated successfully.",
        });
      } else {
        const { error } = await supabase.from("career_postings").insert(postingData);

        if (error) throw error;

        toast({
          title: "Career posting added",
          description: "The posting has been added successfully.",
        });
      }

      resetForm();
      setDialogOpen(false);
      fetchPostings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (posting: any) => {
    setEditingPosting(posting);
    setFormData({
      title: posting.title,
      departmentId: posting.department_id || "",
      location: posting.location,
      employmentType: posting.employment_type,
      description: posting.description,
      requirements: posting.requirements || "",
      responsibilities: posting.responsibilities || "",
      closingDate: posting.closing_date || "",
      published: posting.published,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this posting?")) return;

    try {
      const { error } = await supabase.from("career_postings").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Posting deleted",
        description: "The career posting has been deleted successfully.",
      });

      fetchPostings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Manage Career Postings</h3>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Add Posting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPosting ? "Edit Career Posting" : "Add New Career Posting"}</DialogTitle>
              <DialogDescription>
                {editingPosting ? "Update posting information" : "Add a new career opportunity"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title*</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={formData.departmentId} onValueChange={(value) => setFormData({ ...formData, departmentId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location*</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type*</Label>
                <Select value={formData.employmentType} onValueChange={(value) => setFormData({ ...formData, employmentType: value })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description*</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={3}
                  placeholder="List key requirements..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibilities">Responsibilities</Label>
                <Textarea
                  id="responsibilities"
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  rows={3}
                  placeholder="List key responsibilities..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="closingDate">Application Closing Date</Label>
                <Input
                  id="closingDate"
                  type="date"
                  value={formData.closingDate}
                  onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="published">Published (visible on website)</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Saving..." : editingPosting ? "Update Posting" : "Add Posting"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {postings.map((posting) => (
              <TableRow key={posting.id}>
                <TableCell className="font-medium">{posting.title}</TableCell>
                <TableCell>{posting.departments?.name || "N/A"}</TableCell>
                <TableCell>{posting.location}</TableCell>
                <TableCell>{posting.employment_type}</TableCell>
                <TableCell>
                  <Badge variant={posting.published ? "default" : "secondary"}>
                    {posting.published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(posting)}>
                      <Pencil size={14} />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(posting.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CareerManager;
