"use client";

import { Building2, CheckCircle2, ArrowRight, Layers, Box, Eye, Scan, Users, FileText, Target, Zap, Shield, TrendingUp, Wrench, Trees, Home, Share2, MessageSquare } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function AdvancedBIM() {
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
      icon: Building2,
      title: "Architectural BIM Services",
      description: "Our architectural BIM services empower architects and designers to create detailed 3D building models that enhance design visualization, improve coordination, and streamline the entire design-to-construction workflow. From conceptual design to construction documentation, we ensure your architectural vision is accurately represented in a collaborative BIM environment.",
      img: "/images/bim-services/freepik__a-modern-architectural-visualization-showing-a-dig__21477.jpeg",
      strengths: [
        "Parametric modeling for design flexibility",
        "Multi-disciplinary coordination with MEP and structural teams",
        "Code compliance and regulation checks",
        "High-quality rendering and visualization"
      ],
      coreOffering: [
        "3D architectural modeling from concept to detail",
        "Floor plans, elevations, and sections generation",
        "Material and finish specifications",
        "Coordination with consultants",
        "Construction drawing sets and documentation"
      ]
    },
    {
      icon: Layers,
      title: "Structural BIM Services",
      description: "We provide structural BIM services that deliver precise modeling of structural systems including concrete, steel, and composite frameworks. Our team ensures that structural integrity is maintained while coordinating seamlessly with architectural and MEP disciplines for clash-free construction.",
      img: "/images/bim-services/freepik__a-realistic-3d-render-of-a-steel-and-concrete-fram__21478.jpeg",
      strengths: [
        "Detailed reinforcement and steel connection modeling",
        "Structural analysis integration",
        "Fabrication-ready models for contractors",
        "Compliance with international structural codes"
      ],
      coreOffering: [
        "3D modeling of beams, columns, slabs, and foundations",
        "Rebar detailing and steel connection design",
        "Coordination with architectural and MEP models",
        "Quantity takeoff and material schedules",
        "Construction sequencing and phasing support"
      ]
    },
    {
      icon: Box,
      title: "MEP BIM Services",
      description: "Our MEP (Mechanical, Electrical, and Plumbing) BIM services cover complete system modeling for HVAC, electrical, plumbing, and fire protection. We create coordinated, clash-free models that optimize space utilization, improve installation efficiency, and support facility management.",
      img: "/images/bim-services/freepik__mechanical-system-modeling-in-bim-showing-hvac-duc__21479.jpeg",
      strengths: [
        "Integrated MEP system modeling",
        "Advanced clash detection and resolution",
        "Energy analysis and optimization",
        "Equipment layout and sizing"
      ],
      coreOffering: [
        "HVAC ductwork and equipment modeling",
        "Electrical conduit, panel, and lighting design",
        "Plumbing and sanitary systems",
        "Fire protection and safety systems",
        "MEP coordination and shop drawings"
      ]
    },
    {
      icon: TrendingUp,
      title: "Infrastructure BIM Services",
      description: "We deliver infrastructure BIM solutions for roads, bridges, tunnels, railways, and utilities. Our services integrate civil engineering, geospatial data, and BIM workflows to enable better planning, design coordination, and construction execution for large-scale infrastructure projects.",
      img: "/images/bim-services/freepik__infrastructure-bim-scene-featuring-underground-uti__21483.jpeg",
      strengths: [
        "Civil 3D and Revit integration",
        "Terrain modeling and site analysis",
        "Utility mapping and underground coordination",
        "4D construction simulation"
      ],
      coreOffering: [
        "Road and highway corridor modeling",
        "Bridge and tunnel structural design",
        "Railway track and station modeling",
        "Underground utilities and drainage systems",
        "Earthwork calculation and grading plans"
      ]
    },
    {
      icon: Trees,
      title: "Landscape BIM Services",
      description: "Our landscape BIM services bring exterior environments to life with detailed terrain modeling, hardscape and softscape elements, and irrigation systems. We create sustainable and visually stunning outdoor spaces that integrate seamlessly with your building designs.",
      img: "/images/bim-services/freepik__infrastructure-bim-scene-featuring-underground-uti__21483.jpeg",
      strengths: [
        "Topographic modeling and grading",
        "Plant species and planting schedules",
        "Outdoor furniture and amenity placement",
        "Stormwater management and drainage design"
      ],
      coreOffering: [
        "Site terrain and grading models",
        "Hardscape elements (paving, walls, stairs)",
        "Softscape elements (trees, shrubs, lawns)",
        "Irrigation and drainage system design",
        "Outdoor lighting and signage coordination"
      ]
    },
    {
      icon: Home,
      title: "Interior Design BIM Services",
      description: "We offer interior design BIM services that transform concepts into detailed 3D models with realistic materials, lighting, and furnishings. Perfect for commercial, residential, and hospitality projects, our services ensure design intent is maintained through to construction.",
      img: "/images/bim-services/freepik__interior-design-visualization-in-bim-software-show__21484.jpeg",
      strengths: [
        "Photorealistic rendering and walkthroughs",
        "Custom millwork and furniture modeling",
        "Material library and finish coordination",
        "Space planning and layout optimization"
      ],
      coreOffering: [
        "Interior space modeling with finishes",
        "Ceiling, flooring, and wall treatment design",
        "Custom furniture and fixture modeling",
        "Lighting design and visualization",
        "Interior construction documentation"
      ]
    },
    {
      icon: Eye,
      title: "Façade BIM Services",
      description: "Our façade BIM services specialize in the detailed modeling of building envelopes including curtain walls, cladding systems, and glazing. We ensure thermal performance, structural integrity, and aesthetic quality while coordinating with the overall building design.",
      img: "/images/bim-services/freepik__a-modern-architectural-visualization-showing-a-dig__21477.jpeg",
      strengths: [
        "Parametric façade panel design",
        "Thermal and energy performance analysis",
        "Panel fabrication and installation details",
        "Wind load and structural verification"
      ],
      coreOffering: [
        "Curtain wall and cladding system modeling",
        "Glazing and window wall design",
        "Panel rationalization and optimization",
        "Façade detail drawings and schedules",
        "Coordination with structure and MEP penetrations"
      ]
    },
    {
      icon: Scan,
      title: "Scan to BIM Services",
      description: "We convert laser scan point cloud data into accurate, intelligent BIM models for existing buildings and facilities. Our Scan to BIM services are ideal for renovation, retrofitting, heritage documentation, and facility management projects requiring precise as-built information.",
      img: "/images/bim-services/freepik__infrastructure-bim-scene-featuring-underground-uti__21483.jpeg",
      strengths: [
        "High-accuracy point cloud processing",
        "Existing condition modeling and documentation",
        "Clash detection for retrofit projects",
        "Support for heritage and conservation projects"
      ],
      coreOffering: [
        "3D laser scanning data processing",
        "As-built BIM model creation",
        "Architectural, structural, and MEP modeling from scans",
        "Deviation analysis and quality checks",
        "Integration with new design elements"
      ]
    },
    {
      icon: FileText,
      title: "CAD to BIM Services",
      description: "Our CAD to BIM conversion services transform traditional 2D CAD drawings into intelligent 3D BIM models. We help you transition to modern BIM workflows, enabling better collaboration, visualization, and data management throughout the project lifecycle.",
      img: "/images/bim-services/freepik__plumbing-bim-visualization-showing-water-and-drain__21480.jpeg",
      strengths: [
        "Accurate conversion from legacy CAD files",
        "Smart object creation with metadata",
        "Discipline-specific model development",
        "Quality assurance and validation"
      ],
      coreOffering: [
        "2D to 3D model conversion",
        "Architectural, structural, and MEP modeling",
        "Family creation and library development",
        "Model validation and quality checks",
        "Coordination and clash detection"
      ]
    },
    {
      icon: Share2,
      title: "BIM Outsourcing Services",
      description: "We provide comprehensive BIM outsourcing solutions for design firms, contractors, and developers looking to scale their capabilities. Our dedicated teams work as an extension of your organization, delivering high-quality BIM models on time and within budget.",
      img: "/images/bim-services/freepik__mechanical-system-modeling-in-bim-showing-hvac-duc__21479.jpeg",
      strengths: [
        "Scalable resource allocation",
        "Cost-effective solutions",
        "Quality control and project management",
        "Flexible engagement models"
      ],
      coreOffering: [
        "Dedicated BIM teams for long-term projects",
        "Multi-disciplinary modeling support",
        "Project-specific workflows and standards",
        "Regular progress updates and reviews",
        "Cloud-based collaboration and file sharing"
      ]
    },
    {
      icon: MessageSquare,
      title: "BIM Consulting Services",
      description: "Our BIM consulting services help organizations develop BIM strategies, implement standards, and optimize workflows. From BIM execution planning to staff training, we provide the expertise needed to successfully adopt and leverage BIM technology.",
      img: "/images/bim-services/freepik__fire-protection-system-in-bim-sprinklers-alarms-an__21482.jpeg",
      strengths: [
        "Strategic BIM implementation planning",
        "Standards development and documentation",
        "Team training and capacity building",
        "Technology evaluation and selection"
      ],
      coreOffering: [
        "BIM execution plan (BEP) development",
        "BIM standards and template creation",
        "Workflow optimization and automation",
        "Staff training and certification programs",
        "Technology assessment and recommendations"
      ]
    },
  ];

  const benefits = [
    {
      icon: Target,
      title: "Enhanced Accuracy",
      description: "Eliminate design conflicts with precise 3D coordination and automated clash detection across all disciplines.",
    },
    {
      icon: Users,
      title: "Better Collaboration",
      description: "Enable seamless teamwork with centralized cloud-based models accessible to all project stakeholders.",
    },
    {
      icon: Zap,
      title: "Faster Delivery",
      description: "Accelerate project timelines with efficient workflows, automated documentation, and parallel processing.",
    },
    {
      icon: Shield,
      title: "Risk Reduction",
      description: "Identify and resolve issues during the design phase, minimizing costly construction errors and delays.",
    },
    {
      icon: TrendingUp,
      title: "Cost Optimization",
      description: "Reduce material waste and optimize resource allocation through accurate quantity takeoffs and analytics.",
    },
    {
      icon: Wrench,
      title: "Lifecycle Management",
      description: "Support facility operations with as-built models containing rich data for maintenance and management.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section with Background Image */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/images/bim-services/freepik__a-modern-architectural-visualization-showing-a-dig__21477.jpeg" 
            alt="Advanced BIM Services Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/65 to-black/75" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            <Badge className="mb-6 px-4 py-2 text-sm" variant="secondary">
              Comprehensive BIM Solutions
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white">
              Advanced BIM Services
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your projects with our comprehensive suite of BIM services. From architectural design to infrastructure modeling, we deliver intelligent 3D models that enhance collaboration, reduce errors, and optimize construction workflows across all project phases.
            </p>
            
            <div className="mb-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
                  <h3 className="font-semibold text-white mb-2">Full-Spectrum Services</h3>
                  <p className="text-sm text-white/80">11 specialized BIM service offerings covering architecture, structure, MEP, infrastructure, and beyond</p>
                </div>
                <div className="p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
                  <h3 className="font-semibold text-white mb-2">End-to-End Solutions</h3>
                  <p className="text-sm text-white/80">From initial concept and design to construction, renovation, and facility management</p>
                </div>
                <div className="p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
                  <h3 className="font-semibold text-white mb-2">Industry Expertise</h3>
                  <p className="text-sm text-white/80">Proven track record across commercial, residential, institutional, and infrastructure projects</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { value: "1000+", label: "Projects Delivered" },
                { value: "99%", label: "Client Satisfaction" },
                { value: "75+", label: "BIM Specialists" },
                { value: "11", label: "Service Categories" },
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
              <h2 className="text-4xl font-bold mb-4">Our Advanced BIM Service Portfolio</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Comprehensive BIM expertise across all disciplines and project types
              </p>
            </div>

            <div className="space-y-8" ref={servicesRef}>
              {services.map((service, index) => {
                const isEven = index % 2 === 0;
                return (
                  <Card 
                    key={index} 
                    className="service-card border-border hover:shadow-xl transition-all duration-500 group overflow-hidden opacity-0 translate-y-10"
                    style={{ transitionDelay: `${index * 100}ms` }}
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
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <service.icon className="text-primary" size={24} />
                            </div>
                            <CardTitle className="text-2xl">{service.title}</CardTitle>
                          </div>
                          
                          <CardDescription className="text-base leading-relaxed mb-8">
                            {service.description}
                          </CardDescription>
                          
                          {/* Strengths and Core Offering in Same Row */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-6">
                            {/* Strengths */}
                            <div className="space-y-4 p-8 rounded-lg bg-secondary/30 min-h-[280px]">
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
                            <div className="space-y-4 p-8 bg-primary/5 rounded-lg border-l-4 border-primary min-h-[280px]">
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
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Choose Our Advanced BIM Services</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Experience the competitive advantages that professional BIM expertise brings to your projects
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

      {/* Technical Capabilities */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Technical Capabilities</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our BIM deliverables meet international standards and project requirements
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  title: "Model Development", 
                  items: ["LOD 100 - 500", "Native Revit/ArchiCAD", "IFC/DWG exports", "Federated models"] 
                },
                { 
                  title: "Documentation", 
                  items: ["Construction drawings", "Schedules & BOQ", "Specification sheets", "As-built records"] 
                },
                { 
                  title: "Coordination", 
                  items: ["Clash detection", "Design reviews", "RFI management", "Change tracking"] 
                },
                { 
                  title: "Analysis", 
                  items: ["Energy modeling", "Structural analysis", "Code compliance", "4D/5D simulation"] 
                },
              ].map((capability, index) => (
                <Card key={index} className="border-border hover:shadow-lg transition-all">
                  <CardHeader>
                    <CardTitle className="text-lg mb-4 text-primary">{capability.title}</CardTitle>
                    <ul className="space-y-2">
                      {capability.items.map((item, idx) => (
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

      {/* Process Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Our BIM Delivery Process</h2>
              <p className="text-xl text-muted-foreground">
                A proven methodology ensuring quality, consistency, and timely delivery
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { 
                  step: "01", 
                  title: "Requirements Analysis", 
                  desc: "Understand project scope and client needs",
                  image: "/images/bim-services/freepik__a-modern-architectural-visualization-showing-a-dig__21477.jpeg"
                },
                { 
                  step: "02", 
                  title: "BIM Planning", 
                  desc: "Develop BEP and modeling standards",
                  image: "/images/bim-services/freepik__a-realistic-3d-render-of-a-steel-and-concrete-fram__21478.jpeg"
                },
                { 
                  step: "03", 
                  title: "Model Creation", 
                  desc: "Build intelligent 3D models",
                  image: "/images/bim-services/freepik__mechanical-system-modeling-in-bim-showing-hvac-duc__21479.jpeg"
                },
                { 
                  step: "04", 
                  title: "Quality Assurance", 
                  desc: "Clash detection and validation",
                  image: "/images/bim-services/freepik__fire-protection-system-in-bim-sprinklers-alarms-an__21482.jpeg"
                },
                { 
                  step: "05", 
                  title: "Delivery & Support", 
                  desc: "Handover and ongoing assistance",
                  image: "/images/bim-services/freepik__infrastructure-bim-scene-featuring-underground-uti__21483.jpeg"
                },
              ].map((process, index) => (
                <div key={index} className="relative">
                  <div className="text-center">
                    <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden shadow-lg group">
                      <img 
                        src={process.image} 
                        alt={process.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                        <span className="text-2xl font-bold text-white">{process.step}</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-base mb-2">{process.title}</h3>
                    <p className="text-muted-foreground text-sm">{process.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Industry Applications */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Industry Applications</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our BIM services support diverse sectors and project types
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                "Commercial Buildings",
                "Residential Towers",
                "Healthcare Facilities",
                "Educational Campuses",
                "Industrial Plants",
                "Transportation Hubs",
                "Hospitality & Retail",
                "Data Centers",
                "Sports Complexes",
                "Mixed-Use Developments",
                "Heritage Conservation",
                "Infrastructure Projects"
              ].map((industry, index) => (
                <Card key={index} className="border-border hover:border-primary/50 transition-all text-center p-4">
                  <p className="font-medium text-sm">{industry}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Software & Tools */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Industry-Leading Technology Stack</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We leverage cutting-edge BIM platforms and collaboration tools
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "Autodesk Revit", 
                "Navisworks", 
                "AutoCAD", 
                "BIM 360", 
                "Civil 3D",
                "Tekla Structures", 
                "ArchiCAD", 
                "Rhino", 
                "Dynamo", 
                "Solibri",
                "Lumion",
                "SketchUp"
              ].map((tool, index) => (
                <Badge key={index} variant="outline" className="px-6 py-3 text-base hover:bg-primary hover:text-white transition-colors">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-br from-primary via-primary to-primary/90 border-0 text-white max-w-4xl mx-auto overflow-hidden relative">
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            <CardHeader className="text-center py-16 relative">
              <CardTitle className="text-4xl md:text-5xl mb-6 text-white">
                Ready to Elevate Your Project with BIM?
              </CardTitle>
              <CardDescription className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Connect with our BIM specialists to discuss your requirements and discover how our advanced services can transform your project delivery
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Get a Free Consultation
                </Button>
                <Link href="/services">
                  <Button size="lg" variant="outline" className="text-lg px-8 border-white/30 text-white hover:bg-white/10">
                    View All Services
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
