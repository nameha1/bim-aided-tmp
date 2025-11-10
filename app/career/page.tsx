"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, Clock, ExternalLink } from "lucide-react";
import JobApplicationDialog from "@/components/JobApplicationDialog";
import JobDetailsDialog from "@/components/JobDetailsDialog";

export default function Career() {
  const [openings, setOpenings] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);

  useEffect(() => {
    const fetchCareerPostings = async () => {
      // TODO: Migrate to Firebase - using fallback data for now
      // Fallback to static data
      setOpenings([
        {
          title: "Senior BIM Manager",
          department: "BIM Services",
          location: "Remote",
          employment_type: "full_time",
          description: "Lead BIM coordination and implementation for large-scale projects.",
        },
        {
          title: "Revit Modeler",
          department: "Modeling",
          location: "Hybrid",
          employment_type: "full_time",
          description: "Create detailed architectural and structural BIM models.",
        },
      ]);
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

  const handleViewDetails = (job: any) => {
    setSelectedJob(job);
    setIsDetailsOpen(true);
  };

  const handleApplyClick = (job: any) => {
    setSelectedJob(job);
    setIsApplicationOpen(true);
    setIsDetailsOpen(false);
  };

  const handleApplyFromDetails = () => {
    setIsDetailsOpen(false);
    setIsApplicationOpen(true);
  };

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
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                        <CardDescription className="text-base line-clamp-2">
                          {job.description}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button onClick={() => handleApplyClick(job)}>Apply Now</Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleViewDetails(job)}
                          className="gap-2"
                        >
                          View Details
                          <ExternalLink size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Briefcase size={16} className="text-primary" />
                        <span>{job.department || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-primary" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-primary" />
                        <span className="capitalize">{job.employment_type?.replace('_', ' ')}</span>
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

      {/* Job Details Dialog */}
      <JobDetailsDialog
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        job={selectedJob}
        onApply={handleApplyFromDetails}
      />

      {/* Job Application Dialog */}
      <JobApplicationDialog
        isOpen={isApplicationOpen}
        onClose={() => setIsApplicationOpen(false)}
        jobTitle={selectedJob?.title || ""}
        jobId={selectedJob?.id}
      />
    </div>
  );
}
