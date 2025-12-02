"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Building2, MapPin } from "lucide-react";

export default function ProjectDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const { getDocument } = await import('@/lib/firebase/firestore');
        
        const { data, error } = await getDocument('projects', params.id);
        
        if (error) {
          console.error('Error fetching project:', error);
          setError('Failed to load project');
          return;
        }
        
        if (!data) {
          setError('Project not found');
          return;
        }
        
        setProject(data);
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred while loading the project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading project...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2" size={16} />
            Back to Projects
          </Button>
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || 'The project you are looking for does not exist.'}</p>
            <Button onClick={() => router.push('/projects')}>View All Projects</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
      
      {/* Hero Section */}
      <div className="pt-20">
        <div className="relative h-[60vh] overflow-hidden">
          <img
            src={project.image_url || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920"}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-4 text-white hover:text-white hover:bg-white/20"
              >
                <ArrowLeft className="mr-2" size={16} />
                Back to Projects
              </Button>
              <Badge className="mb-4">{project.category}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {project.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Project Overview</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </div>

            {/* Gallery */}
            {galleryImages.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Project Gallery</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {galleryImages.map((image, index) => (
                    <div key={index} className="relative h-64 overflow-hidden rounded-lg">
                      <img
                        src={image}
                        alt={`${project.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-secondary rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg mb-4">Project Information</h3>
              
              {project.client_name && (
                <div className="flex items-start gap-3">
                  <Building2 className="text-primary mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">{project.client_name}</p>
                  </div>
                </div>
              )}
              
              {project.completion_date && (
                <div className="flex items-start gap-3">
                  <Calendar className="text-primary mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-muted-foreground">Completion Date</p>
                    <p className="font-medium">
                      {new Date(project.completion_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
              
              {project.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="text-primary mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{project.location}</p>
                  </div>
                </div>
              )}
              
              {project.lod && (
                <div className="flex items-start gap-3">
                  <Building2 className="text-primary mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-muted-foreground">LOD (Level of Development)</p>
                    <p className="font-medium">{project.lod}</p>
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Category</p>
                <Badge variant="outline">{project.category}</Badge>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-primary text-primary-foreground rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">Interested in a similar project?</h3>
              <p className="text-sm mb-4 opacity-90">
                Get in touch with us to discuss your project requirements.
              </p>
              <Button
                onClick={() => router.push('/contact')}
                variant="secondary"
                className="w-full"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
