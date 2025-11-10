"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Projects() {
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
  const router = useRouter();

  const projects = [
    {
      id: "1",
      title: "Downtown Business Center",
      category: "Commercial",
      description: "Complete BIM modeling and coordination for a 30-story mixed-use development.",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
      client_name: "Metropolitan Development Corp.",
      completion_date: "2024-08-15",
      project_value: 45000000,
      location: "New York, USA",
      scope: "Full BIM modeling services including architectural, structural, and MEP coordination for a 30-story mixed-use development featuring retail, office spaces, and luxury apartments.",
      challenges: "Complex MEP coordination in a tight urban site with existing underground utilities. Integration of sustainable building systems while maintaining design aesthetics.",
      solutions: "Implemented advanced clash detection protocols, conducted weekly coordination meetings, and utilized 4D simulation to optimize construction sequencing and minimize disruptions.",
      technologies: ["Revit", "Navisworks", "BIM 360", "AutoCAD MEP", "Dynamo"],
    },
    {
      id: "2",
      title: "City University Campus",
      category: "Education & Healthcare",
      description: "Comprehensive BIM services for a modern educational facility.",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?w=800",
      client_name: "State Education Authority",
      completion_date: "2024-06-20",
      project_value: 28000000,
      location: "Boston, USA",
      scope: "Design and construction documentation for a state-of-the-art university campus including lecture halls, laboratories, library, and student center with advanced learning technologies.",
      challenges: "Coordinating multiple buildings with different functional requirements, ensuring accessibility compliance, and integrating smart building technologies.",
      solutions: "Created a comprehensive BIM execution plan, established consistent modeling standards across all disciplines, and developed custom families for specialized educational equipment.",
      technologies: ["Revit", "Enscape", "BIM 360", "Solibri", "Bluebeam"],
    },
    {
      id: "3",
      title: "National Sports Arena",
      category: "Cultural & Sports",
      description: "Advanced structural and MEP modeling for large-scale sports facility.",
      image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
      client_name: "National Sports Commission",
      completion_date: "2024-12-10",
      project_value: 125000000,
      location: "Los Angeles, USA",
      scope: "Complete BIM services for a 50,000-seat multi-purpose arena including complex roof structure, advanced HVAC systems, broadcast facilities, and VIP suites.",
      challenges: "Modeling complex geometric roof structure, coordinating large-scale MEP systems, and ensuring optimal sight lines from all seating areas.",
      solutions: "Utilized parametric modeling for the complex roof geometry, performed detailed energy analysis, and created virtual reality walkthroughs for stakeholder approval.",
      technologies: ["Revit", "Rhinoceros", "Grasshopper", "Navisworks", "Lumion", "IES VE"],
    },
    {
      id: "4",
      title: "Luxury Residential Tower",
      category: "Residential",
      description: "High-end residential tower with detailed architectural BIM models.",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      client_name: "Prestige Properties Ltd.",
      completion_date: "2024-09-30",
      project_value: 67000000,
      location: "Miami, USA",
      scope: "Full architectural and interior design BIM modeling for a 42-story luxury residential tower featuring premium amenities, rooftop gardens, and ocean views.",
      challenges: "Creating highly detailed custom interior finishes, coordinating complex curtain wall systems, and modeling unique amenity spaces with custom millwork.",
      solutions: "Developed extensive custom content library, performed detailed clash detection for interior fit-out, and created high-quality renderings for marketing purposes.",
      technologies: ["Revit", "3ds Max", "V-Ray", "Enscape", "AutoCAD"],
    },
    {
      id: "5",
      title: "Metro Transit Station",
      category: "Infrastructure & Municipal",
      description: "Infrastructure BIM coordination for urban transit development.",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
      client_name: "City Transit Authority",
      completion_date: "2024-11-05",
      project_value: 89000000,
      location: "Chicago, USA",
      scope: "BIM modeling and coordination for a major transit hub including underground platforms, passenger circulation areas, retail spaces, and connection to existing infrastructure.",
      challenges: "Coordination with existing underground utilities, integration with operational metro systems, and ensuring continuous service during construction.",
      solutions: "Developed detailed 4D construction sequencing, performed thorough utility coordination, and created comprehensive construction documentation to support phased delivery.",
      technologies: ["Revit", "Civil 3D", "Navisworks", "InfraWorks", "Synchro"],
    },
    {
      id: "6",
      title: "Manufacturing Facility",
      category: "Industrial & Park",
      description: "Industrial complex with specialized MEP and structural modeling.",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800",
      client_name: "Global Industries Inc.",
      completion_date: "2024-07-22",
      project_value: 52000000,
      location: "Houston, USA",
      scope: "Complete BIM services for an advanced manufacturing facility including production areas, clean rooms, utilities infrastructure, and administrative offices.",
      challenges: "Modeling complex process piping systems, coordinating heavy equipment placement, and ensuring compliance with industrial safety standards.",
      solutions: "Created detailed 3D models of all process equipment, performed CFD analysis for ventilation systems, and developed comprehensive installation documentation.",
      technologies: ["Revit", "AutoCAD Plant 3D", "Navisworks", "Fabrication CADmep", "BIM 360"],
    },
  ];

  // Fetch projects from database
  useEffect(() => {
    const fetchProjects = async () => {
      // TODO: Migrate to Firebase - using static fallback for now
      setFilteredProjects(selectedCategory === "All" ? projects : projects.filter(p => p.category === selectedCategory));
    };

    fetchProjects();
  }, [selectedCategory]);

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

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
              <Card 
                key={index} 
                className="border-border overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
                onClick={() => handleProjectClick(project.id)}
              >
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                      {project.category}
                    </span>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
