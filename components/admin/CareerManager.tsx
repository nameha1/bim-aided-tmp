import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getDocuments, createDocument, updateDocument, deleteDocument } from "@/lib/firebase/firestore";
import { orderBy } from "firebase/firestore";
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
    department: "",
    location: "",
    employmentType: "",
    description: "",
    requirements: "",
    salaryRange: "",
    status: "active",
  });

  useEffect(() => {
    fetchPostings();
    fetchDepartments();
  }, []);

  const fetchPostings = async () => {
    try {
      const { data, error } = await getDocuments("job_postings", [
        orderBy("created_at", "desc")
      ]);

      if (error) {
        console.error('Error fetching postings with ordering:', error);
        
        // If index is not ready, fetch without ordering and sort manually
        if (error.code === 9 || error.message?.includes('index')) {
          const { data: unorderedData, error: unorderedError } = await getDocuments("job_postings");
          
          if (!unorderedError && unorderedData) {
            const sorted = unorderedData.sort((a: any, b: any) => {
              const aTime = a.created_at?.toMillis?.() || 0;
              const bTime = b.created_at?.toMillis?.() || 0;
              return bTime - aTime;
            });
            setPostings(sorted);
            return;
          }
        }
        
        throw error;
      }
      setPostings(data || []);
    } catch (error) {
      console.error("Error fetching postings:", error);
    }
  };

  const fetchDepartments = async () => {
    const { data } = await getDocuments("departments");
    setDepartments(data || []);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      department: "",
      location: "",
      employmentType: "",
      description: "",
      requirements: "",
      salaryRange: "",
      status: "active",
    });
    setEditingPosting(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const postingData = {
        title: formData.title,
        department: formData.department || null,
        location: formData.location,
        employment_type: formData.employmentType,
        description: formData.description,
        requirements: formData.requirements || null,
        salary_range: formData.salaryRange || null,
        status: formData.status,
      } as any;

      if (editingPosting) {
        const { error } = await updateDocument("job_postings", editingPosting.id, postingData);

        if (error) throw error;

        toast({
          title: "Job posting updated",
          description: "The posting has been updated successfully.",
        });
      } else {
        const { error } = await createDocument("job_postings", postingData);

        if (error) throw error;

        toast({
          title: "Job posting added",
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
      department: posting.department || "",
      location: posting.location,
      employmentType: posting.employment_type,
      description: posting.description,
      requirements: posting.requirements || "",
      salaryRange: posting.salary_range || "",
      status: posting.status || "active",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this posting?")) return;

    try {
      const { error } = await deleteDocument("job_postings", id);

      if (error) throw error;

      toast({
        title: "Posting deleted",
        description: "The job posting has been deleted successfully.",
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
              <DialogTitle>{editingPosting ? "Edit Job Posting" : "Add New Job Posting"}</DialogTitle>
              <DialogDescription>
                {editingPosting ? "Update posting information" : "Add a new job opportunity"}
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
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g., BIM Services, Modeling"
                  />
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
                    <SelectItem value="full_time">Full-time</SelectItem>
                    <SelectItem value="part_time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
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
                <Label htmlFor="salaryRange">Salary Range</Label>
                <Input
                  id="salaryRange"
                  value={formData.salaryRange}
                  onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                  placeholder="e.g., $60,000 - $80,000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status*</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active (visible on website)</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
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
                <TableCell>{posting.department || "N/A"}</TableCell>
                <TableCell>{posting.location}</TableCell>
                <TableCell>{posting.employment_type?.replace('_', ' ')}</TableCell>
                <TableCell>
                  <Badge variant={posting.status === 'active' ? "default" : "secondary"}>
                    {posting.status?.charAt(0).toUpperCase() + posting.status?.slice(1)}
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
