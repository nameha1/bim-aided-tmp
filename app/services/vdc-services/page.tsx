"use client";

import { Box, CheckCircle2, ArrowRight, Layers, Users, Calendar, Package, Ruler, ClipboardCheck, Settings, Target, Zap, Shield, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

// Lazy load heavy components
const Navigation = dynamic(() => import("@/components/Navigation"), {
  loading: () => <div className="h-20 bg-background border-b" />,
});

const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => <div className="h-96 bg-muted" />,
});

export default function VDCServices() {
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const serviceCards = servicesRef.current?.querySelectorAll('.service-card');
    serviceCards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const services = [
    {
      icon: Ruler,
      title: "BIM Quantity Takeoff",
      description: "Model-based quantity extraction to support accurate cost estimation and procurement.",
      image: "/images/vdc-services/quantity-takeoff.jpg",
      strengths: [
        "Reduces manual takeoff errors",
        "Faster cost planning and budgeting",
        "Always aligned with latest model"
      ],
      coreOffering: [
        "QTO for arch/struct/MEP elements",
        "BOQ generation and structuring",
        "Export to estimation/cost tools"
      ]
    },
    {
      icon: Box,
      title: "BIM Design Services",
      description: "BIM-led architectural and engineering design for coordinated, data-driven projects.",
      image: "/images/vdc-services/bim-design.jpg",
      strengths: [
        "Integrated multi-discipline design",
        "Fewer clashes, better coordination",
        "Supports sustainable and performance design"
      ],
      coreOffering: [
        "Concept to detailed design in BIM",
        "Architecture + engineering modeling",
        "Model-based drawings and documentation"
      ]
    },
    {
      icon: CheckCircle2,
      title: "BIM Clash Detection",
      description: "Early detection of clashes between disciplines to prevent on-site rework.",
      image: "/images/vdc-services/clash-detection.jpg",
      strengths: [
        "Minimizes RFIs and delays",
        "Improves constructability",
        "Clear, actionable clash reports"
      ],
      coreOffering: [
        "Hard/soft clash checks in federated models",
        "Clash reports with viewpoints and priorities",
        "Support for coordination and issue tracking"
      ]
    },
    {
      icon: Layers,
      title: "BIM Coordination Services",
      description: "Multi-discipline model coordination for consistent, constructible project delivery.",
      image: "/images/vdc-services/coordination.jpg",
      strengths: [
        "Single coordinated source of truth",
        "Reduced design-change risk",
        "Better communication across teams"
      ],
      coreOffering: [
        "Federated model setup and maintenance",
        "Coordination cycles and model updates",
        "Combined services and coordinated drawings"
      ]
    },
    {
      icon: Package,
      title: "Rebar Detailing Services",
      description: "3D rebar modeling and shop drawings for precise fabrication and placement.",
      image: "/images/vdc-services/rebar-detailing.jpg",
      strengths: [
        "Accurate reinforcement quantities",
        "Reduced site interpretation errors",
        "Better integration with openings and MEP"
      ],
      coreOffering: [
        "Rebar models for slabs, beams, columns, walls",
        "Rebar shop drawings and BBS",
        "Coordination with formwork and penetrations"
      ]
    },
    {
      icon: ClipboardCheck,
      title: "Revit Drafting Services",
      description: "Professional Revit-based drafting for clean, consistent 2D/3D deliverables.",
      image: "/images/vdc-services/revit-drafting.jpg",
      strengths: [
        "High-precision documentation",
        "Fast revisions from the model",
        "Fully aligned with client standards"
      ],
      coreOffering: [
        "Plans, sections, elevations, details in Revit",
        "Sheet setup, annotation, tagging",
        "CAD/PDF to Revit conversion and families"
      ]
    },
    {
      icon: Calendar,
      title: "4D BIM Services",
      description: "4D simulations combining 3D models with schedules for visual construction planning.",
      image: "/images/vdc-services/4d-bim.jpg",
      strengths: [
        "Clear view of sequencing and phasing",
        "Early detection of time/logistics issues",
        "Better communication with stakeholders"
      ],
      coreOffering: [
        "Link model elements to schedule tasks",
        "4D simulations and videos",
        "Planned vs. actual progress visualization"
      ]
    },
    {
      icon: TrendingUp,
      title: "5D BIM Services",
      description: "Cost-linked BIM models for live budget control and forecasting.",
      image: "/images/vdc-services/5d-bim.jpg",
      strengths: [
        "Real-time cost impact of changes",
        "More accurate budgets and cashflow",
        "Transparent cost breakdowns"
      ],
      coreOffering: [
        "Map elements to cost codes and rates",
        "Auto-generated cost reports from BIM",
        "Option and value-engineering comparisons"
      ]
    },
    {
      icon: Target,
      title: "BIM Visualization Services",
      description: "High-quality renders, animations, and VR from BIM models for clear design communication.",
      image: "/images/vdc-services/visualization.jpg",
      strengths: [
        "Easy for non-technical stakeholders",
        "Faster approvals and buy-in",
        "Stronger bids and marketing materials"
      ],
      coreOffering: [
        "Still renders and animations",
        "360° and VR-ready scenes",
        "Enhanced materials, lighting, entourage"
      ]
    },
    {
      icon: Settings,
      title: "BIM Facility Management Services",
      description: "FM-ready BIM and asset data to support operations, maintenance, and lifecycle planning.",
      image: "/images/vdc-services/coordination.jpg",
      strengths: [
        "Centralized asset and space info",
        "Better maintenance planning",
        "Improved long-term asset performance"
      ],
      coreOffering: [
        "FM-ready models with asset tagging",
        "COBie/custom exports to CAFM/CMMS",
        "Space and occupancy data in the model"
      ]
    },
    {
      icon: Shield,
      title: "BIM Management Services",
      description: "End-to-end BIM process management from planning to digital handover.",
      image: "/images/vdc-services/bim-management.jpg",
      strengths: [
        "Consistent standards and workflows",
        "Reduced BIM-related risk",
        "Clear roles, responsibilities, and deliverables"
      ],
      coreOffering: [
        "BEP creation and BIM governance",
        "CDE setup and model QA/QC",
        "Managing BIM milestones and deliverables"
      ]
    }
  ];

  const benefits = [
    {
      icon: Target,
      title: "Enhanced Accuracy",
      description: "Model-based workflows ensure precise quantity takeoffs, clash-free coordination, and accurate cost forecasting.",
    },
    {
      icon: Users,
      title: "Better Collaboration",
      description: "Centralized BIM models facilitate seamless communication between all project stakeholders and disciplines.",
    },
    {
      icon: Zap,
      title: "Faster Delivery",
      description: "4D/5D BIM, prefabrication support, and early clash detection accelerate project timelines significantly.",
    },
    {
      icon: Shield,
      title: "Risk Reduction",
      description: "Proactive coordination and visualization identify issues before construction, minimizing costly changes.",
    },
    {
      icon: TrendingUp,
      title: "Lifecycle Value",
      description: "FM-ready models and comprehensive BIM management support operations long after project completion.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/images/bim-services/VDC.jpeg" 
            alt="VDC Services Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-sky-900/85 via-sky-700/75 to-blue-800/80" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            <Badge className="mb-6 px-4 py-2 text-sm" variant="secondary">
              Virtual Design & Construction
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white">
              VDC Services
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Comprehensive BIM and VDC solutions spanning design, coordination, quantity takeoff, 4D/5D simulations, visualization, facility management, and full BIM lifecycle management—delivering coordinated, data-driven projects from concept through operations.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { value: "200+", label: "Projects Completed" },
                { value: "20+", label: "Expert Team Members" },
                { value: "10+", label: "Years Experience" },
                { value: "98%", label: "Client Satisfaction" },
              ].map((stat, index) => (
                <div key={index} className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">11 Comprehensive VDC & BIM Services</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                From quantity takeoff to facility management—complete BIM lifecycle solutions for coordinated project delivery
              </p>
            </div>

            <div className="space-y-8" ref={servicesRef}>
              {services.map((service, index) => (
                <Card 
                  key={index} 
                  className="service-card border-border hover:shadow-xl transition-all duration-500 group overflow-hidden opacity-0 translate-y-10"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Service Image */}
                  <div className="relative h-64 md:h-80 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                      onError={(e) => {
                        console.error(`Failed to load image: ${service.image}`);
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.classList.add('bg-gradient-to-br', 'from-primary/10', 'to-primary/20');
                        }
                      }}
                      onLoad={(e) => {
                        console.log(`Successfully loaded: ${service.image}`);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-lg bg-primary/90 backdrop-blur-sm flex items-center justify-center">
                          <service.icon className="text-white" size={24} />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold drop-shadow-2xl" style={{ color: '#30c4fd' }}>{service.title}</h3>
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pb-4 px-6 md:px-10 py-6 md:py-10">
                    <CardDescription className="text-base leading-relaxed mb-8">
                      {service.description}
                    </CardDescription>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                      {/* Strengths */}
                      <div className="space-y-4 p-8 rounded-lg bg-secondary/30">
                        <h4 className="font-semibold text-base text-primary uppercase tracking-wide flex items-center gap-2 mb-5">
                          <Target className="w-5 h-5" />
                          Key Strengths
                        </h4>
                        <ul className="space-y-4">
                          {service.strengths.map((strength, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Core Offering */}
                      <div className="space-y-4 p-8 bg-primary/5 rounded-lg border-l-4 border-primary">
                        <h4 className="font-semibold text-base text-primary uppercase tracking-wide flex items-center gap-2 mb-5">
                          <Layers className="w-5 h-5" />
                          Core Offering
                        </h4>
                        <ul className="space-y-4">
                          {service.coreOffering.map((offering, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm leading-relaxed">
                              <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                              <span className="font-medium">{offering}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Choose Our VDC Services</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Experience measurable improvements in project outcomes through digital construction innovation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-border hover:shadow-lg transition-all group">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <benefit.icon className="text-primary" size={24} />
                    </div>
                    <CardTitle className="text-lg mb-2 text-foreground font-bold">{benefit.title}</CardTitle>
                    <CardDescription className="leading-relaxed">
                      {benefit.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-br from-sky-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card">
            <CardHeader className="text-center py-12 md:py-14 lg:py-16 px-6 md:px-12 lg:px-16 relative z-10">
              <CardTitle className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 text-sky-600 drop-shadow-sm">
                Ready to Start Your Project?
              </CardTitle>
              <CardDescription className="text-lg md:text-xl lg:text-2xl text-gray-700 mb-10 max-w-4xl mx-auto leading-relaxed font-medium">
                Let's discuss how we can help bring your vision to life with our BIM expertise
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button 
                    size="default" 
                    className="w-full sm:w-44 text-sm md:text-base px-6 py-5 bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-lg"
                  >
                    Get In Touch
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button 
                    size="default" 
                    variant="outline" 
                    className="w-full sm:w-44 text-sm md:text-base px-6 py-5 border-2 border-sky-600 text-sky-600 bg-white/50 hover:bg-white/70 font-semibold backdrop-blur-sm transition-all duration-300 rounded-lg hover:shadow-lg hover:scale-105"
                  >
                    View Our Work
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
