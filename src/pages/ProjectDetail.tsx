import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, MapPin, Building2, Layers, X } from "lucide-react";
import { format } from "date-fns";

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [imageModalOpen, setImageModalOpen] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      if (data) {
        setProject(data);
        // Use preview_image as the main image
        setSelectedImage(data.preview_image || data.image_url || "");
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-8">The project you're looking for doesn't exist.</p>
          <Link to="/projects">
            <Button>
              <ArrowLeft className="mr-2" size={18} />
              Back to Projects
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Gallery images - will be populated after database migration
  const galleryImages = [
    project.gallery_image_1,
    project.gallery_image_2,
    project.gallery_image_3,
    project.gallery_image_4,
    project.gallery_image_5,
  ].filter(Boolean);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section with Title */}
      <section className="pt-24 pb-8 bg-gradient-to-b from-secondary to-background">
        <div className="container mx-auto px-4">
          <Link to="/projects">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2" size={18} />
              Back to Projects
            </Button>
          </Link>
          <div className="max-w-4xl">
            <span className="inline-block bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full mb-4">
              {project.category}
            </span>
            {/* Title First */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{project.title}</h1>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Preview Image - Second (after title) */}
              {(project.preview_image || project.image_url) && (
                <Card className="overflow-hidden">
                  <img
                    src={project.preview_image || project.image_url}
                    alt={project.title}
                    className="w-full h-[500px] object-cover"
                  />
                </Card>
              )}

              {/* Description - Third (after preview image) */}
              {(project.description || project.scope) && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold mb-4">Description</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {project.scope || project.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Gallery Images - Fourth (after description) */}
              {galleryImages.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Other Images</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {galleryImages.map((img, index) => (
                      <Card
                        key={index}
                        className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                        onClick={() => {
                          setSelectedImage(img);
                          setImageModalOpen(true);
                        }}
                      >
                        <img
                          src={img}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-40 object-cover"
                        />
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Technologies */}
              {project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold mb-4">Technologies Used</h2>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-secondary text-sm rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Details Card */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h3 className="text-xl font-semibold mb-4">Project Details</h3>
                  
                  {project.client_name && (
                    <div className="flex items-start gap-3">
                      <Building2 size={20} className="text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Client</p>
                        <p className="font-semibold">{project.client_name}</p>
                      </div>
                    </div>
                  )}

                  {project.location && (
                    <div className="flex items-start gap-3">
                      <MapPin size={20} className="text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Location</p>
                        <p className="font-semibold">{project.location}</p>
                      </div>
                    </div>
                  )}

                  {project.lod && (
                    <div className="flex items-start gap-3">
                      <Layers size={20} className="text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Level of Detail</p>
                        <p className="font-semibold">{project.lod}</p>
                      </div>
                    </div>
                  )}

                  {project.completion_date && (
                    <div className="flex items-start gap-3">
                      <Calendar size={20} className="text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Completion Date</p>
                        <p className="font-semibold">
                          {format(new Date(project.completion_date), "MMMM yyyy")}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* CTA Card */}
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-2">Interested in Similar Projects?</h3>
                  <p className="text-primary-foreground/90 mb-4 text-sm">
                    Let's discuss how we can help bring your vision to life with our BIM expertise.
                  </p>
                  <Link to="/contact">
                    <Button variant="secondary" className="w-full">
                      Get In Touch
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Gallery view"
              className="w-full h-auto max-h-[90vh] object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setImageModalOpen(false)}
            >
              <X size={20} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ProjectDetail;
