import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getDocuments } from "@/lib/firebase/firestore";
import { orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { compressImage, uploadImage } from "@/lib/imageUtils";

const ProjectManager = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const { toast } = useToast();

  const categories = [
    "Commercial",
    "Education & Healthcare",
    "Cultural & Sports",
    "Residential",
    "Infrastructure & Municipal",
    "Industrial & Park",
  ];

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    clientName: "",
    completionDate: "",
    published: true,
  });
  
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<(File | null)[]>([null, null, null, null, null]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>(["", "", "", "", ""]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await getDocuments("projects", [
        orderBy("created_at", "desc")
      ]);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      description: "",
      clientName: "",
      completionDate: "",
      published: true,
    });
    setPreviewImage(null);
    setPreviewUrl("");
    setGalleryImages([null, null, null, null, null]);
    setGalleryUrls(["", "", "", "", ""]);
    setEditingProject(null);
  };

  const handlePreviewImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 500, 1920);
      setPreviewImage(compressed);
      setPreviewUrl(URL.createObjectURL(compressed));
      
      toast({
        title: "Image ready",
        description: `Preview image compressed to ${(compressed.size / 1024).toFixed(0)}KB`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      });
    }
  };

  const handleGalleryImageChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 50, 800);
      const newGalleryImages = [...galleryImages];
      newGalleryImages[index] = compressed;
      setGalleryImages(newGalleryImages);
      
      const newGalleryUrls = [...galleryUrls];
      newGalleryUrls[index] = URL.createObjectURL(compressed);
      setGalleryUrls(newGalleryUrls);
      
      toast({
        title: "Image ready",
        description: `Gallery image ${index + 1} compressed to ${(compressed.size / 1024).toFixed(0)}KB`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      });
    }
  };

  const removeGalleryImage = (index: number) => {
    const newGalleryImages = [...galleryImages];
    newGalleryImages[index] = null;
    setGalleryImages(newGalleryImages);
    
    const newGalleryUrls = [...galleryUrls];
    newGalleryUrls[index] = "";
    setGalleryUrls(newGalleryUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploading(true);

    try {
      let mainImageUrl = editingProject?.image_url || "";
      const galleryImageUrls = [
        editingProject?.gallery_image_1 || "",
        editingProject?.gallery_image_2 || "",
        editingProject?.gallery_image_3 || "",
        editingProject?.gallery_image_4 || "",
        editingProject?.gallery_image_5 || "",
      ];

      // Upload main image if changed
      if (previewImage) {
        mainImageUrl = await uploadImage(previewImage, 'project-images', 'main/');
      }

      // Upload gallery images if changed
      for (let i = 0; i < galleryImages.length; i++) {
        if (galleryImages[i]) {
          galleryImageUrls[i] = await uploadImage(galleryImages[i]!, 'project-images', `gallery/${i + 1}/`);
        }
      }

      const projectData = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        image_url: mainImageUrl || null,
        gallery_image_1: galleryImageUrls[0] || null,
        gallery_image_2: galleryImageUrls[1] || null,
        gallery_image_3: galleryImageUrls[2] || null,
        gallery_image_4: galleryImageUrls[3] || null,
        gallery_image_5: galleryImageUrls[4] || null,
        client_name: formData.clientName || null,
        completion_date: formData.completionDate || null,
        published: formData.published,
      } as any;

      if (editingProject) {
        // Use API route for updating projects
        const response = await fetch(`/api/update-project/${editingProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to update project');
        }

        toast({
          title: "Project updated",
          description: "The project has been updated successfully.",
        });
      } else {
        // Use the new API route for creating projects
        const response = await fetch('/api/create-project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to create project');
        }

        toast({
          title: "Project added",
          description: "The project has been added successfully.",
        });
      }

      resetForm();
      setDialogOpen(false);
      fetchProjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      category: project.category,
      description: project.description,
      clientName: project.client_name || "",
      completionDate: project.completion_date || "",
      published: project.published,
    });
    
    // Set existing image URLs
    if (project.image_url) {
      setPreviewUrl(project.image_url);
    }
    
    const existingGalleryUrls = [
      project.gallery_image_1 || "",
      project.gallery_image_2 || "",
      project.gallery_image_3 || "",
      project.gallery_image_4 || "",
      project.gallery_image_5 || "",
    ];
    setGalleryUrls(existingGalleryUrls);
    
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      // Use API route for deleting projects
      const response = await fetch(`/api/update-project/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete project');
      }

      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully.",
      });

      fetchProjects();
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
        <h3 className="text-lg font-semibold">Manage Projects</h3>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProject ? "Edit Project" : "Add New Project"}</DialogTitle>
              <DialogDescription>
                {editingProject ? "Update project information" : "Add a new project to the portfolio"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information */}
              <div className="space-y-2">
                <Label htmlFor="title">Project Title*</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category*</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })} required>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description*</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              {/* Preview Image */}
              <div className="space-y-2">
                <Label>Preview Image (Max 500KB)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePreviewImageChange}
                    className="flex-1"
                  />
                  {previewUrl && (
                    <img src={previewUrl} alt="Preview" className="w-20 h-20 object-cover rounded" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload a preview image. It will be automatically compressed to max 500KB.
                </p>
              </div>

              {/* Gallery Images */}
              <div className="space-y-2">
                <Label>Gallery Images (Up to 5, max 50KB each)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <div key={index} className="space-y-2">
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleGalleryImageChange(index, e)}
                          className="text-xs"
                        />
                        {galleryUrls[index] && (
                          <div className="relative mt-2">
                            <img
                              src={galleryUrls[index]}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-24 object-cover rounded"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6 p-0"
                              onClick={() => removeGalleryImage(index)}
                            >
                              <X size={12} />
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Image {index + 1}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="completionDate">Completion Date</Label>
                  <Input
                    id="completionDate"
                    type="date"
                    value={formData.completionDate}
                    onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                  />
                </div>
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
                <Button type="submit" disabled={loading || uploading} className="flex-1">
                  {uploading ? "Uploading..." : loading ? "Saving..." : editingProject ? "Update Project" : "Add Project"}
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
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>LOD</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.title}</TableCell>
                <TableCell>{project.category}</TableCell>
                <TableCell>{project.lod || "N/A"}</TableCell>
                <TableCell>{project.client_name || "N/A"}</TableCell>
                <TableCell>
                  <Badge variant={project.published ? "default" : "secondary"}>
                    {project.published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(project)}>
                      <Pencil size={14} />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(project.id)}>
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

export default ProjectManager;
