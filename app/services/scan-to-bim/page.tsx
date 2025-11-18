"use client";

import { Scan, CheckCircle2, ArrowRight, Layers, Target, Zap, Shield, TrendingUp, Building2, Eye, Settings } from "lucide-react";
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

export default function ScanToBIM() {
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
      icon: Scan,
      title: "Point Cloud to BIM Conversion",
      description: "Transform raw laser scan data and point clouds into intelligent, accurate BIM models. Our team processes high-density point cloud data to create detailed 3D models that accurately represent existing conditions for renovation, retrofitting, and facility management projects.",
      img: "/images/advanced-bim/Scan to BIM Services.jpeg",
      strengths: [
        "High-accuracy modeling from point cloud data",
        "Support for all major scanner formats (Leica, Faro, Trimble)",
        "Detailed as-built documentation for existing facilities",
        "Clash detection between existing and new elements"
      ],
      scopes: [
        "Point cloud data processing and registration",
        "3D BIM model creation from scan data",
        "As-built architectural, structural, and MEP modeling",
        "Deviation analysis and accuracy reports",
        "Integration with renovation and retrofit designs"
      ]
    },
    {
      icon: Building2,
      title: "Heritage & Historic Building Documentation",
      description: "Preserve and document heritage structures with precision laser scanning and detailed BIM modeling. Our services capture intricate architectural details, ornamental features, and structural elements for restoration, conservation, and archival purposes.",
      img: "/images/Scan to BIM.jpeg",
      strengths: [
        "High-detail capture of ornamental and complex geometry",
        "Non-invasive documentation methods",
        "Digital preservation for future generations",
        "Support for restoration and conservation planning"
      ],
      scopes: [
        "Laser scanning of heritage buildings",
        "Detailed 3D modeling of decorative elements",
        "Documentation for conservation authorities",
        "Structural condition assessment support",
        "Virtual tours and digital archives"
      ]
    },
    {
      icon: Settings,
      title: "Industrial & Plant Modeling",
      description: "Create comprehensive as-built BIM models of industrial facilities, plants, and process equipment. Our Scan to BIM services support brownfield projects, plant expansions, maintenance planning, and digital twin creation for industrial operations.",
      img: "/images/advanced-bim/Scan to BIM Services.jpeg",
      strengths: [
        "Complex piping and equipment modeling",
        "Support for plant modification and expansion projects",
        "Integration with P&ID and process engineering",
        "Accurate spatial coordination for retrofit installations"
      ],
      scopes: [
        "Industrial facility laser scanning",
        "Piping, ductwork, and equipment modeling",
        "Cable tray and conduit as-built documentation",
        "Structural steel and support systems",
        "Digital twin creation for facility management"
      ]
    },
    {
      icon: Eye,
      title: "Infrastructure & Civil Scanning",
      description: "Document roads, bridges, tunnels, and other infrastructure assets with laser scanning and UAV-based photogrammetry. Convert survey data into intelligent BIM models for infrastructure maintenance, upgrades, and lifecycle management.",
      img: "/images/Scan to BIM.jpeg",
      strengths: [
        "Large-scale infrastructure capture and modeling",
        "UAV and terrestrial scanning integration",
        "GIS and BIM data integration",
        "Support for asset management systems"
      ],
      scopes: [
        "Road and bridge scanning and modeling",
        "Tunnel and underground infrastructure documentation",
        "Topographic survey integration",
        "Utility mapping and clash detection",
        "Infrastructure digital twin development"
      ]
    }
  ];

  const benefits = [
    {
      icon: Target,
      title: "Millimeter Accuracy",
      description: "Achieve precise as-built documentation with laser scanning technology delivering sub-centimeter accuracy for critical renovation projects.",
    },
    {
      icon: Zap,
      title: "Faster Documentation",
      description: "Reduce site survey time by up to 70% compared to traditional measurement methods while capturing complete spatial data.",
    },
    {
      icon: Shield,
      title: "Risk Mitigation",
      description: "Identify spatial conflicts and structural issues early in design phase, preventing costly construction surprises and rework.",
    },
    {
      icon: Building2,
      title: "Complete As-Built Data",
      description: "Capture comprehensive existing conditions including hidden elements, complex geometry, and hard-to-reach areas.",
    },
    {
      icon: TrendingUp,
      title: "Lifecycle Value",
      description: "Create digital twins and FM-ready models that support long-term facility management and future renovation projects.",
    },
  ];

  const applications = [
    "Building Renovation & Retrofit",
    "Facility Management",
    "Heritage Documentation",
    "Industrial Plant Upgrades",
    "Infrastructure Inspection",
    "Space Planning & Design",
    "MEP System Documentation",
    "Structural Assessment",
    "Construction Verification",
    "Digital Twin Creation",
    "Asset Management",
    "Energy Audits"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section with Background Image */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/images/advanced-bim/Scan to BIM Services.jpeg" 
            alt="Scan to BIM Services Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-sky-900/85 via-sky-700/75 to-blue-800/80" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            <Badge className="mb-6 px-4 py-2 text-sm" variant="secondary">
              Reality Capture & Digital Documentation
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white">
              Scan to BIM Services
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform reality into intelligent digital models. Our Scan to BIM services convert laser scan point cloud data into accurate, detailed BIM models for renovation, retrofit, facility management, and heritage documentation projects.
            </p>
            
            <div className="mb-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
                  <h3 className="font-semibold text-white mb-2">High Accuracy</h3>
                  <p className="text-sm text-white/80">Sub-centimeter precision for critical renovation and retrofit projects requiring exact as-built data</p>
                </div>
                <div className="p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
                  <h3 className="font-semibold text-white mb-2">All Building Types</h3>
                  <p className="text-sm text-white/80">Commercial, industrial, heritage, and infrastructure projects with complex existing conditions</p>
                </div>
                <div className="p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
                  <h3 className="font-semibold text-white mb-2">Complete Documentation</h3>
                  <p className="text-sm text-white/80">Full architectural, structural, and MEP systems captured and modeled for comprehensive digital records</p>
                </div>
              </div>
            </div>

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
          <div className="max-w-[95vw] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Comprehensive Scan to BIM Solutions</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                From point cloud capture to intelligent BIM models—complete reality capture services for existing facilities
              </p>
            </div>

            <div className="space-y-8" ref={servicesRef}>
              {services.map((service, index) => {
                const isEven = index % 2 === 0;
                return (
                  <Card 
                    key={index} 
                    className="service-card border-border hover:shadow-xl transition-all duration-500 group overflow-hidden opacity-0 translate-y-10"
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
                      {/* Image Section - Alternating Position */}
                      <div className={`relative h-80 md:h-auto overflow-hidden md:col-span-2 ${!isEven ? 'md:order-2' : ''}`}>
                        <img 
                          src={service.img} 
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${isEven ? 'md:bg-gradient-to-r' : 'md:bg-gradient-to-l'} from-black/70 via-black/30 to-transparent`} />
                      </div>
                      
                      {/* Content Section */}
                      <div className={`md:col-span-3 ${!isEven ? 'md:order-1' : ''}`}>
                        <CardHeader className="pb-4 px-10 py-10">
                          <CardTitle className="text-2xl mb-3">{service.title}</CardTitle>
                          <CardDescription className="text-base leading-relaxed mb-8">
                            {service.description}
                          </CardDescription>
                          
                          {/* Strengths and Scopes in Same Row */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-6">
                            {/* Strengths */}
                            <div className="space-y-4 p-8 rounded-lg bg-secondary/30 min-h-[300px]">
                              <h4 className="font-semibold text-base text-primary uppercase tracking-wide flex items-center gap-2 mb-5">
                                <Target className="w-5 h-5" />
                                Strengths
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

                            {/* Scopes */}
                            <div className="space-y-4 p-8 bg-primary/5 rounded-lg border-l-4 border-primary min-h-[300px]">
                              <h4 className="font-semibold text-base text-primary uppercase tracking-wide flex items-center gap-2 mb-5">
                                <Layers className="w-5 h-5" />
                                Scope of Services
                              </h4>
                              <ul className="space-y-4">
                                {service.scopes.map((scope, idx) => (
                                  <li key={idx} className="flex items-start gap-3 text-sm leading-relaxed">
                                    <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                    <span className="font-medium">{scope}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardHeader>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Technology & Process Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Our Scan to BIM Process</h2>
              <p className="text-xl text-muted-foreground">
                A streamlined workflow from reality capture to intelligent BIM model delivery
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { 
                  step: "01", 
                  title: "Site Survey & Scanning", 
                  desc: "Laser scanning and data capture on-site",
                  icon: Scan
                },
                { 
                  step: "02", 
                  title: "Data Processing", 
                  desc: "Point cloud registration and cleanup",
                  icon: Settings
                },
                { 
                  step: "03", 
                  title: "BIM Modeling", 
                  desc: "Convert point cloud to intelligent 3D model",
                  icon: Building2
                },
                { 
                  step: "04", 
                  title: "QA & Delivery", 
                  desc: "Quality validation and final handover",
                  icon: CheckCircle2
                },
              ].map((process, index) => (
                <div key={index} className="relative">
                  <Card className="border-border hover:shadow-lg transition-all text-center h-full">
                    <CardHeader>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <process.icon className="text-primary" size={32} />
                      </div>
                      <div className="text-3xl font-bold text-primary mb-2">{process.step}</div>
                      <CardTitle className="text-lg mb-2">{process.title}</CardTitle>
                      <CardDescription>{process.desc}</CardDescription>
                    </CardHeader>
                  </Card>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-[30%] left-[60%] w-[80%] h-0.5 bg-primary/20" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Choose Our Scan to BIM Services</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Experience the advantages of professional reality capture and BIM modeling expertise
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-border hover:shadow-lg transition-all group">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <benefit.icon className="text-primary" size={24} />
                    </div>
                    <CardTitle className="text-lg mb-2">{benefit.title}</CardTitle>
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

      {/* Applications Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Industry Applications</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our Scan to BIM services support diverse project types and industries
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {applications.map((application, index) => (
                <Card key={index} className="border-border hover:border-primary/50 transition-all text-center p-4">
                  <p className="font-medium text-sm">{application}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technical Deliverables */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Technical Deliverables</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Comprehensive outputs tailored to your project requirements
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Point Cloud Data", items: ["Registered point clouds", "E57/RCP formats", "Intensity & RGB data", "Survey control points"] },
                { title: "BIM Models", items: ["Native Revit files", "IFC format exports", "LOD 300-400 models", "As-built documentation"] },
                { title: "Drawings", items: ["Floor plans", "Elevations & sections", "Detail drawings", "Deviation reports"] },
                { title: "Analysis", items: ["Accuracy reports", "Clash detection", "Quantity takeoffs", "3D visualizations"] },
              ].map((deliverable, index) => (
                <Card key={index} className="border-border hover:shadow-lg transition-all">
                  <CardHeader>
                    <CardTitle className="text-lg mb-4 text-primary">{deliverable.title}</CardTitle>
                    <ul className="space-y-2">
                      {deliverable.items.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Software & Equipment */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Industry-Leading Technology</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We utilize professional-grade scanning equipment and advanced BIM software
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {["Leica RTC360", "Faro Focus", "Trimble X12", "Autodesk Revit", "ReCap Pro", "CloudCompare", "Navisworks", "AutoCAD", "Cyclone REGISTER 360", "PointCab"].map((tool, index) => (
                <Badge key={index} variant="outline" className="px-6 py-3 text-base hover:bg-primary hover:text-white transition-colors">
                  {tool}
                </Badge>
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
