import { Building2, CheckCircle2, ArrowRight, Layers, Box, Eye, Scan, Users, FileText, Target, Zap, Shield, TrendingUp } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

const BIMModeling = () => {
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
      title: "Architectural BIM Modeling",
      description: "Our Architectural BIM (Building Information Modeling) service delivers detailed and intelligent 3D models for architects, designers, and builders. We enhance design accuracy, visualization, and coordination to ensure smooth project delivery and informed decision-making.",
      img: "/images/bim-services/freepik__a-modern-architectural-visualization-showing-a-dig__21477.jpeg",
      strengths: [
        "Multi-Disciplinary Integration: Seamless collaboration between architecture, structure, and MEP",
        "High Level of Detail: Accurate LOD-based modeling for visualization and documentation",
        "Efficient Coordination: Detects design conflicts early, minimizing costly rework",
        "Global Standards: Adheres to AIA, ISO, and local building regulations"
      ],
      scopes: [
        "3D Modeling of Core Architectural Elements",
        "Floor, wall, ceiling, and roof systems",
        "Doors, windows, facades, and finishes",
        "Furniture layouts and fixture details",
        "Documentation-ready models for construction and facility use"
      ]
    },
    {
      icon: Layers,
      title: "Structural BIM Modeling",
      description: "We deliver Structural BIM (Building Information Modeling) models that visualize and analyze structural frameworks with precision. Our modeling enhances coordination, reduces clashes, and ensures structural accuracy for concrete, steel, and composite structures.",
      img: "/images/bim-services/freepik__a-realistic-3d-render-of-a-steel-and-concrete-fram__21478.jpeg",
      strengths: [
        "Expert Structural Engineers and Modelers",
        "Detailed Reinforcement and Connection Modeling",
        "Cross-Discipline Coordination to Avoid Clashes",
        "Data-Rich Models for Analysis and Fabrication"
      ],
      scopes: [
        "3D Modeling of Major Structural Components",
        "Columns, beams, slabs, foundations",
        "Reinforcement detailing and steel connections",
        "Construction sequence simulation and quantity extraction"
      ]
    },
    {
      icon: Box,
      title: "Mechanical BIM Modeling",
      description: "Our Mechanical BIM (Building Information Modeling) modeling services create detailed, coordinated HVAC systems that enhance efficiency and design validation. We deliver accurate mechanical layouts to support clash-free construction and energy optimization.",
      img: "/images/bim-services/freepik__mechanical-system-modeling-in-bim-showing-hvac-duc__21479.jpeg",
      strengths: [
        "Professional HVAC Expertise",
        "Coordinated Models for Mechanical Rooms and Equipment",
        "Thermal Insulation and Support System Detailing",
        "Integrated Design Collaboration"
      ],
      scopes: [
        "3D Modeling of Mechanical Systems",
        "Air systems, ducts, chillers, AHUs",
        "Pipe supports, insulation, and maintenance zones",
        "Clash detection and simulation with BIM 360 or Navisworks"
      ]
    },
    {
      icon: Box,
      title: "Plumbing BIM Modeling",
      description: "Our Plumbing BIM (Building Information Modeling) services produce coordinated, constructible 3D models for plumbing systems across residential, commercial, and industrial projects. We ensure accurate water, drainage, and fire protection layouts.",
      img: "/images/bim-services/freepik__plumbing-bim-visualization-showing-water-and-drain__21480.jpeg",
      strengths: [
        "Experienced Plumbing BIM Team",
        "Construction-Ready Detailing",
        "Multi-System Integration (Water, Drainage, Fire)",
        "Revit and Navisworks Compatibility"
      ],
      scopes: [
        "System Modeling",
        "Water supply, sanitary, stormwater, greywater",
        "Fire protection and hot water systems",
        "Coordination with other MEP trades"
      ]
    },
    {
      icon: Zap,
      title: "Electrical BIM Modeling",
      description: "Our Electrical BIM (Building Information Modeling) services offer full-system modeling for power, lighting, and low-voltage networks. We create constructible 3D models that ensure safety, compliance, and spatial coordination.",
      img: "/images/bim-services/freepik__fire-protection-system-in-bim-sprinklers-alarms-an__21482.jpeg",
      strengths: [
        "Detailed Electrical System Modeling",
        "Integrated Cable Tray and Conduit Design",
        "Cross-Disciplinary Coordination",
        "Standardized Component Libraries"
      ],
      scopes: [
        "Power & Lighting Systems",
        "Distribution boards, transformers, conduits",
        "Lighting and control circuits",
        "Fire alarm and communication systems"
      ]
    },
    {
      icon: Shield,
      title: "Fire Protection BIM Modeling",
      description: "We provide comprehensive Fire Protection BIM (Building Information Modeling) services for sprinkler, hydrant, gas suppression, and alarm systems—ensuring compliance, safety, and coordination across disciplines.",
      img: "/images/bim-services/freepik__fire-protection-system-in-bim-sprinklers-alarms-an__21482.jpeg",
      strengths: [
        "Multi-System Fire Protection Modeling",
        "Code-Compliant Design (NFPA, GB, BS)",
        "High-Detail Equipment Representation",
        "Coordination with MEP Systems"
      ],
      scopes: [
        "Sprinkler, Hydrant, and Gas Suppression Systems",
        "Alarm device modeling",
        "Clash detection, documentation, and FM data integration"
      ]
    },
    {
      icon: Layers,
      title: "Infrastructure BIM Modeling",
      description: "Our Infrastructure BIM (Building Information Modeling) solutions support digital design and construction for roads, bridges, tunnels, and utilities. We integrate GIS and BIM for large-scale coordination and lifecycle management.",
      img: "/images/bim-services/freepik__infrastructure-bim-scene-featuring-underground-uti__21483.jpeg",
      strengths: [
        "Multi-Disciplinary Infrastructure Expertise",
        "GIS and Terrain Integration",
        "Full Lifecycle BIM Delivery (LOD 100–500)",
        "Consistent Data Standards and Templates"
      ],
      scopes: [
        "Roads, Bridges, and Utilities",
        "3D modeling of transportation and underground networks",
        "Clash detection and spatial optimization",
        "4D construction simulation and digital twin setup"
      ]
    },
    {
      icon: Eye,
      title: "Interior Design BIM Modeling",
      description: "Our Interior Design BIM (Building Information Modeling) services combine architecture and interior detailing to create realistic 3D models for premium spaces. Ideal for luxury, hospitality, and commercial design.",
      img: "/images/bim-services/freepik__interior-design-visualization-in-bim-software-show__21484.jpeg",
      strengths: [
        "Architectural-Interior Integration",
        "Millimeter-Level Detailing",
        "Render-Ready Materials and Lighting",
        "Reusable Family Libraries"
      ],
      scopes: [
        "3D Modeling of Finishes and Furniture",
        "Ceilings, walls, flooring, and custom furniture",
        "Lighting and appliance modeling",
        "Visualization and construction documentation"
      ]
    },
    {
      icon: Scan,
      title: "Landscape BIM Modeling",
      description: "We deliver Landscape BIM (Building Information Modeling) solutions that bring exterior design concepts to life with accurate terrain, grading, and planting simulations. Perfect for parks, campuses, and urban spaces.",
      img: "/images/bim-services/freepik__infrastructure-bim-scene-featuring-underground-uti__21483.jpeg",
      strengths: [
        "Advanced Terrain and Grading Modeling",
        "Parametric Landscape Elements",
        "Real-Time Visualization and Coordination",
        "Sponge City and Drainage Design Support"
      ],
      scopes: [
        "Terrain & Grading Modeling",
        "Hardscape, softscape, and drainage layouts",
        "Outdoor structures and furniture modeling",
        "Construction detailing and visualization"
      ]
    },
  ];

  const benefits = [
    {
      icon: Target,
      title: "Enhanced Accuracy",
      description: "Eliminate design conflicts with precise 3D coordination and automated clash detection.",
    },
    {
      icon: Users,
      title: "Better Collaboration",
      description: "Enable seamless teamwork across disciplines with centralized, cloud-based model access.",
    },
    {
      icon: Zap,
      title: "Faster Delivery",
      description: "Accelerate project timelines with efficient workflows and automated documentation.",
    },
    {
      icon: Shield,
      title: "Risk Reduction",
      description: "Identify and resolve issues during design phase, minimizing costly construction errors.",
    },
    {
      icon: TrendingUp,
      title: "Cost Optimization",
      description: "Reduce material waste and optimize resource allocation through accurate quantity takeoffs.",
    },
  ];

  const lodLevels = [
    { level: "LOD 100", desc: "Conceptual design with basic massing" },
    { level: "LOD 200", desc: "Schematic design with approximate geometry" },
    { level: "LOD 300", desc: "Detailed design with precise dimensions" },
    { level: "LOD 350", desc: "Construction documentation ready" },
    { level: "LOD 400", desc: "Fabrication and installation details" },
    { level: "LOD 500", desc: "As-built verification models" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section with Background Image */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/images/bim-services/freepik__a-modern-architectural-visualization-showing-a-dig__21477.jpeg" 
            alt="BIM Services Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            <Badge className="mb-6 px-4 py-2 text-sm" variant="secondary">
              Professional BIM Services
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white">
              BIM Modeling Services
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Our BIM (Building Information Modeling) services empower architects, engineers, and contractors with intelligent 3D models that streamline project design, coordination, and construction. We deliver data-driven digital twins for seamless collaboration, reducing rework and enhancing project visualization.
            </p>
            
            <div className="mb-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
                  <h3 className="font-semibold text-white mb-2">Applicable to All Types</h3>
                  <p className="text-sm text-white/80">Buildings and infrastructure with multi-disciplinary coordination across Architecture, Structure, and MEP</p>
                </div>
                <div className="p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
                  <h3 className="font-semibold text-white mb-2">Full Lifecycle Coverage</h3>
                  <p className="text-sm text-white/80">From schematic design to construction and operation—covering modeling, clash detection, and documentation</p>
                </div>
                <div className="p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
                  <h3 className="font-semibold text-white mb-2">Global Standards</h3>
                  <p className="text-sm text-white/80">Proven experience across global standards supporting design development and facility management</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { value: "500+", label: "Projects Modeled" },
                { value: "98%", label: "Accuracy Rate" },
                { value: "50+", label: "BIM Experts" },
                { value: "24/7", label: "Support Available" },
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
              <h2 className="text-4xl font-bold mb-4">Comprehensive BIM Modeling Solutions</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                From conceptual design to as-built documentation, we provide end-to-end BIM modeling services
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

      {/* Technical Deliverables */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Technical Deliverables</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Comprehensive BIM outputs tailored to your project needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "3D Models", items: ["Native Revit files", "IFC format", "NWC/NWD files", "DWG exports"] },
                { title: "Documentation", items: ["Construction drawings", "Schedules & quantities", "Clash reports", "Model reports"] },
                { title: "Coordination", items: ["Federated models", "Coordination views", "Issue tracking", "RFI responses"] },
                { title: "Analysis", items: ["Energy analysis", "Structural loads", "Code compliance", "Cost estimates"] },
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

      {/* LOD Levels Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Level of Development (LOD)</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                We deliver models at various LOD levels to match your project requirements and phases
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lodLevels.map((lod, index) => (
                <Card key={index} className="border-l-4 border-l-primary hover:shadow-md transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-primary mb-1">{lod.level}</CardTitle>
                    <CardDescription>{lod.desc}</CardDescription>
                  </CardHeader>
                </Card>
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
              <h2 className="text-4xl font-bold mb-4">Why Choose Our BIM Modeling Services</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Experience the competitive advantages that professional BIM modeling brings to your projects
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

      {/* Process Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Our BIM Modeling Process</h2>
              <p className="text-xl text-muted-foreground">
                A streamlined workflow ensuring quality and timely delivery
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { 
                  step: "01", 
                  title: "Project Analysis", 
                  desc: "Review drawings and requirements",
                  image: "/images/bim-services/freepik__plumbing-bim-visualization-showing-water-and-drain__21480.jpeg"
                },
                { 
                  step: "02", 
                  title: "Model Creation", 
                  desc: "Develop detailed 3D BIM models",
                  image: "/images/freepik__electrical-system-bim-visualization-showing-condui__21481.png"
                },
                { 
                  step: "03", 
                  title: "Quality Check", 
                  desc: "Clash detection and validation",
                  image: "/images/bim-services/freepik__fire-protection-system-in-bim-sprinklers-alarms-an__21482.jpeg"
                },
                { 
                  step: "04", 
                  title: "Delivery", 
                  desc: "Final model handover and support",
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <span className="text-3xl font-bold text-white">{process.step}</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{process.title}</h3>
                    <p className="text-muted-foreground text-sm">{process.desc}</p>
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-[25%] left-[60%] w-[80%] h-0.5 bg-primary/20" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Industry Applications */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Industry Applications</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our BIM modeling expertise spans across diverse building and infrastructure sectors
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                "Commercial Buildings",
                "Residential Complexes",
                "Healthcare Facilities",
                "Educational Institutions",
                "Industrial Plants",
                "Infrastructure Projects",
                "Hospitality & Retail",
                "Data Centers",
                "Transportation Hubs",
                "Mixed-Use Developments",
                "Heritage Restoration",
                "Sports & Recreation"
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Industry-Leading Software & Technology</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We leverage cutting-edge BIM platforms and collaboration tools for superior results
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {["Autodesk Revit", "Navisworks Manage", "AutoCAD", "BIM 360", "Tekla Structures", "ArchiCAD", "Rhino + Grasshopper", "Dynamo", "Solibri", "Lumion"].map((tool, index) => (
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
                Ready to Transform Your Project?
              </CardTitle>
              <CardDescription className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Get in touch with our BIM experts to discuss your modeling requirements and receive a customized solution
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Schedule a Consultation
                </Button>
                <Link to="/services">
                  <Button size="lg" variant="outline" className="text-lg px-8 border-white/30 text-white hover:bg-white/10">
                    Explore Other Services
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
};

export default BIMModeling;
