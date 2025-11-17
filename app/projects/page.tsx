"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

// Lazy load heavy components
const Navigation = dynamic(() => import("@/components/Navigation"), {
  loading: () => <div className="h-20 bg-background border-b" />,
});

const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => <div className="h-96 bg-muted" />,
});

export default function Projects() {
  const categories = [
    "All",
    "Commercial",
    "Residential",
    "Historical",
    "Embassy",
    "Infrastructure",
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
      title: "Historic Museum Restoration",
      category: "Historical",
      description: "Comprehensive BIM services for heritage building restoration and modernization.",
      image: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=800",
      client_name: "National Heritage Trust",
      completion_date: "2024-06-20",
      project_value: 28000000,
      location: "Boston, USA",
      scope: "Detailed 3D documentation and restoration planning for a 19th-century museum building, including structural assessment, MEP upgrades while preserving historical features.",
      challenges: "Documenting intricate historical details, integrating modern systems without compromising heritage value, ensuring compliance with preservation standards.",
      solutions: "Utilized 3D laser scanning for precise documentation, created detailed restoration models, and developed phased implementation plan to minimize impact on operations.",
      technologies: ["Revit", "ReCap Pro", "Point Cloud", "BIM 360", "AutoCAD"],
    },
    {
      id: "3",
      title: "Embassy Complex",
      category: "Embassy",
      description: "High-security diplomatic facility with advanced building systems.",
      image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800",
      client_name: "Ministry of Foreign Affairs",
      completion_date: "2024-12-10",
      project_value: 125000000,
      location: "Washington DC, USA",
      scope: "Complete BIM services for a secure embassy complex including office buildings, residential quarters, security infrastructure, and ceremonial spaces with state-of-the-art technology.",
      challenges: "Meeting stringent security requirements, coordinating complex security systems, ensuring compliance with international diplomatic building standards.",
      solutions: "Developed comprehensive security-integrated BIM models, performed detailed coordination with security consultants, and created secure construction documentation protocols.",
      technologies: ["Revit", "Navisworks", "BIM 360", "AutoCAD", "Solibri"],
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
      category: "Infrastructure",
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
      title: "Corporate Headquarters",
      category: "Commercial",
      description: "Modern corporate campus with sustainable design features.",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800",
      client_name: "Global Industries Inc.",
      completion_date: "2024-07-22",
      project_value: 52000000,
      location: "Houston, USA",
      scope: "Complete BIM services for a modern corporate headquarters featuring open office spaces, collaborative work areas, cafeteria, fitness center, and LEED certification requirements.",
      challenges: "Achieving LEED Platinum certification, optimizing energy efficiency, and creating flexible workspace layouts that can adapt to future needs.",
      solutions: "Performed comprehensive energy analysis, developed sustainable design strategies, and created adaptable BIM models to support various workspace configurations.",
      technologies: ["Revit", "IES VE", "Navisworks", "BIM 360", "Enscape"],
    },
  ];

  // Fetch projects from database
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        console.log('[Projects Page] Fetching projects from Firestore...');
        console.log('[Projects Page] Selected category:', selectedCategory);
        
        const { getDocuments } = await import('@/lib/firebase/firestore');
        const { where, orderBy } = await import('firebase/firestore');
        
        // Build query constraints
        const constraints: any[] = [];
        
        // Add published filter
        constraints.push(where('published', '==', true));
        console.log('[Projects Page] Added published filter');
        
        // Only add category filter if not "All"
        if (selectedCategory !== "All") {
          constraints.push(where('category', '==', selectedCategory));
          console.log('[Projects Page] Added category filter:', selectedCategory);
        }
        
        // Add ordering - NOTE: This requires a composite index in Firestore
        // If the index doesn't exist, we'll catch the error and fetch without ordering
        constraints.push(orderBy('created_at', 'desc'));
        console.log('[Projects Page] Added ordering by created_at desc');
        
        let { data, error } = await getDocuments('projects', constraints);
        
        // If query fails (likely due to missing index), try without ordering
        if (error && error.message?.includes('index')) {
          console.warn('[Projects Page] ⚠️ Index required for ordering, fetching without orderBy');
          const simpleConstraints = [where('published', '==', true)];
          if (selectedCategory !== "All") {
            simpleConstraints.push(where('category', '==', selectedCategory));
          }
          const fallbackResult = await getDocuments('projects', simpleConstraints);
          data = fallbackResult.data;
          error = fallbackResult.error;
          
          // Sort in memory if we got data
          if (data && data.length > 0) {
            data = data.sort((a: any, b: any) => {
              const aTime = a.created_at?.toMillis?.() || 0;
              const bTime = b.created_at?.toMillis?.() || 0;
              return bTime - aTime;
            });
          }
        }
        
        if (error) {
          console.error('[Projects Page] ❌ Error fetching projects:', error);
          // Use static fallback on error
          console.log('[Projects Page] Using static fallback due to error');
          setFilteredProjects(selectedCategory === "All" ? projects : projects.filter(p => p.category === selectedCategory));
          return;
        }
        
        console.log('[Projects Page] ✅ Fetched from Firestore:', data?.length, 'projects');
        console.log('[Projects Page] Data:', data);
        
        if (data && data.length > 0) {
          console.log('[Projects Page] 📊 Setting filtered projects with database data');
          // Normalize the data to match the expected format
          const normalizedData = data.map((project: any) => ({
            ...project,
            image: project.image_url || project.image || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
          }));
          console.log('[Projects Page] Normalized data:', normalizedData);
          setFilteredProjects(normalizedData);
        } else {
          // Use static fallback if no data
          console.log('[Projects Page] ⚠️ No projects found, using static fallback');
          setFilteredProjects(selectedCategory === "All" ? projects : projects.filter(p => p.category === selectedCategory));
        }
      } catch (error) {
        console.error('[Projects Page] ❌ Error in fetchProjects:', error);
        // Use static fallback on error
        console.log('[Projects Page] Using static fallback due to exception');
        setFilteredProjects(selectedCategory === "All" ? projects : projects.filter(p => p.category === selectedCategory));
      }
    };

    fetchProjects();
  }, [selectedCategory]);

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section with Background Image */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000"
            alt="Architecture and construction projects"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/90 via-blue-900/85 to-slate-900/90" />
          
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }} />
          </div>
          
          {/* Floating shapes */}
          <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <span className="text-white/90 font-medium">Portfolio Showcase</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
              Our Projects
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              Explore our portfolio of successful BIM implementations across various project types
            </p>
          </div>
        </div>
        
        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 border-b border-border bg-white">
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
