import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Career = () => {
  const [openings, setOpenings] = useState<any[]>([]);

  useEffect(() => {
    const fetchCareerPostings = async () => {
      const { data } = await supabase
        .from("career_postings")
        .select("*, departments(name)")
        .eq("published", true)
        .order("posted_date", { ascending: false });

      if (data && data.length > 0) {
        setOpenings(data);
      } else {
        // Fallback to static data if no postings
        setOpenings([
          {
            title: "Senior BIM Manager",
            departments: { name: "BIM Services" },
            location: "Remote",
            employment_type: "Full-time",
            description: "Lead BIM coordination and implementation for large-scale projects.",
          },
          {
            title: "Revit Modeler",
            departments: { name: "Modeling" },
            location: "Hybrid",
            employment_type: "Full-time",
            description: "Create detailed architectural and structural BIM models.",
          },
        ]);
      }
    };

    fetchCareerPostings();
  }, []);

  const benefits = [
    "Competitive salary and benefits",
    "Professional development opportunities",
    "Work-life balance",
    "Health insurance coverage",
    "Remote work options",
    "Collaborative team environment",
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-secondary to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Join Our Team</h1>
            <p className="text-xl text-muted-foreground">
              Build your career with a leading BIM services provider
            </p>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Why Work With Us?</h2>
            <p className="text-lg text-muted-foreground mb-8 text-center">
              At BIMaided, we believe in nurturing talent and providing opportunities for growth. Join a team that values innovation, collaboration, and excellence.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 bg-secondary p-4 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Open Positions</h2>
            
            <div className="space-y-6">
              {openings.map((job, index) => (
                <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                        <CardDescription className="text-base">{job.description}</CardDescription>
                      </div>
                      <Button>Apply Now</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Briefcase size={16} className="text-primary" />
                        <span>{job.departments?.name || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-primary" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-primary" />
                        <span>{job.employment_type}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Career;
