import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Projects = () => {
  const categories = [
    "All",
    "Commercial",
    "Education & Healthcare",
    "Cultural & Sports",
    "Residential",
    "Infrastructure & Municipal",
    "Industrial & Park",
  ];

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);

  const projects = [
    {
      title: "Downtown Business Center",
      category: "Commercial",
      description: "Complete BIM modeling and coordination for a 30-story mixed-use development.",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    },
    {
      title: "City University Campus",
      category: "Education & Healthcare",
      description: "Comprehensive BIM services for a modern educational facility.",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?w=800",
    },
    {
      title: "National Sports Arena",
      category: "Cultural & Sports",
      description: "Advanced structural and MEP modeling for large-scale sports facility.",
      image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
    },
    {
      title: "Luxury Residential Tower",
      category: "Residential",
      description: "High-end residential tower with detailed architectural BIM models.",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
    },
    {
      title: "Metro Transit Station",
      category: "Infrastructure & Municipal",
      description: "Infrastructure BIM coordination for urban transit development.",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
    },
    {
      title: "Manufacturing Facility",
      category: "Industrial & Park",
      description: "Industrial complex with specialized MEP and structural modeling.",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800",
    },
  ];

  // Fetch projects from database
  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        // Use database projects if available
        const dbProjects = data.map(p => ({
          title: p.title,
          category: p.category,
          description: p.description,
          image: p.image_url || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
        }));
        setFilteredProjects(selectedCategory === "All" ? dbProjects : dbProjects.filter(p => p.category === selectedCategory));
      } else {
        // Fallback to static projects
        setFilteredProjects(selectedCategory === "All" ? projects : projects.filter(p => p.category === selectedCategory));
      }
    };

    fetchProjects();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-secondary to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Our Projects</h1>
            <p className="text-xl text-muted-foreground">
              Explore our portfolio of successful BIM implementations across various project types
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <Card key={index} className="border-border overflow-hidden hover:shadow-xl transition-all group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                      {project.category}
                    </span>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Projects;
