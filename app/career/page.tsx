"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, Clock, ExternalLink } from "lucide-react";
import dynamic from "next/dynamic";

// Lazy load heavy components
const Navigation = dynamic(() => import("@/components/Navigation"), {
  loading: () => <div className="h-20 bg-background border-b" />,
});

const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => <div className="h-96 bg-muted" />,
});

const JobApplicationDialog = dynamic(() => import("@/components/JobApplicationDialog"));
const JobDetailsDialog = dynamic(() => import("@/components/JobDetailsDialog"));

export default function Career() {
  const [openings, setOpenings] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);

  useEffect(() => {
    const fetchCareerPostings = async () => {
      try {
        // Import Firebase functions
        const { getDocuments } = await import('@/lib/firebase/firestore');
        const { where, orderBy } = await import('firebase/firestore');
        
        console.log('Fetching job postings from Firestore...');
        
        // Fetch active job postings from Firebase
        const { data, error } = await getDocuments('job_postings', [
          where('status', '==', 'active'),
          orderBy('created_at', 'desc')
        ]);

        console.log('Firestore response:', { data, error });

        if (error) {
          console.error('Error fetching job postings:', error);
          
          // If it's an index error, try without ordering
          if (error.code === 9 || error.message?.includes('index')) {
            console.log('Index not ready, fetching without ordering...');
            const { data: unorderedData, error: unorderedError } = await getDocuments('job_postings', [
              where('status', '==', 'active')
            ]);
            
            if (!unorderedError && unorderedData) {
              // Sort manually by created_at
              const sorted = unorderedData.sort((a: any, b: any) => {
                const aTime = a.created_at?.toMillis?.() || 0;
                const bTime = b.created_at?.toMillis?.() || 0;
                return bTime - aTime;
              });
              console.log(`Found ${sorted.length} active job postings (sorted manually)`);
              setOpenings(sorted);
              return;
            }
          }
          
          // Fallback to static data on error
          setOpenings([]);
        } else {
          console.log(`Found ${data?.length || 0} active job postings`);
          setOpenings(data || []);
        }
      } catch (error) {
        console.error('Error in fetchCareerPostings:', error);
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
      }
    };

    fetchCareerPostings();
  }, []);

  const benefits = [
    "Competitive salary and benefits",
    "Professional development opportunities",
    "Work-life balance",
    "Employee Well Being",
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
      
      {/* Hero Section with Background Image */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000"
            alt="Modern office workspace"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/90 via-cyan-800/85 to-blue-900/90" />
          
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }} />
          </div>
          
          {/* Floating shapes */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <span className="text-white/90 font-medium">We're Hiring!</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
              Join Our Team
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Build your career with a leading BIM services provider and shape the future of construction technology
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <Briefcase className="w-5 h-5 text-cyan-300" />
                <span className="text-white font-medium">{openings.length}+ Open Positions</span>
              </div>
              <div className="flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <MapPin className="w-5 h-5 text-cyan-300" />
                <span className="text-white font-medium">Remote & Hybrid Options</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white"/>
          </svg>
        </div>
```
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
