"use client";

import { Building2, Layers, Box, Globe, ArrowRight } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Services() {
  const services = [
    {
      icon: Building2,
      title: "BIM Modeling",
      description: "Comprehensive 3D modeling services for architectural, structural, and MEP systems.",
      link: "/services/bim-modeling",
      features: [
        "Architectural BIM Modeling",
        "Structural BIM Modeling",
        "MEP BIM Modeling",
        "3D Visualization",
        "Scan to BIM Services",
      ],
    },
    {
      icon: Layers,
      title: "Advanced BIM Services",
      description: "Sophisticated BIM solutions for complex project requirements.",
      link: "/services/advanced-bim",
      features: [
        "Clash Detection & Coordination",
        "4D BIM (Construction Sequencing)",
        "5D BIM (Cost Estimation)",
        "6D BIM (Facility Management)",
        "BIM Quantity Takeoff",
      ],
    },
    {
      icon: Box,
      title: "VDC Services",
      description: "Virtual Design & Construction coordination for seamless project delivery.",
      link: "/services/vdc-services",
      features: [
        "Virtual Design Coordination",
        "Construction Planning",
        "Site Logistics Planning",
        "Prefabrication Support",
        "Quality Control & QA",
      ],
    },
    {
      icon: Globe,
      title: "Global BIM Services",
      description: "International BIM standards compliance and consulting services.",
      link: "/services/global-bim",
      features: [
        "BIM Standards Compliance",
        "BIM Implementation",
        "BIM Training & Workshops",
        "BIM Consulting",
        "International Project Support",
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/80">
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }} />
          </div>
          
          {/* Floating Shapes */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative container mx-auto px-4 text-center text-white z-10 py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8 animate-fade-in">
            <Layers className="w-4 h-4" />
            <span className="text-sm font-medium">Comprehensive BIM Solutions</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
            Our Services
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto text-white/90 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Comprehensive BIM solutions designed to enhance your construction projects from concept to completion
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <Building2 className="w-8 h-8 mx-auto mb-2 text-white" />
              <p className="text-sm font-medium">BIM Modeling</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <Layers className="w-8 h-8 mx-auto mb-2 text-white" />
              <p className="text-sm font-medium">Advanced BIM</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <Box className="w-8 h-8 mx-auto mb-2 text-white" />
              <p className="text-sm font-medium">VDC Services</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <Globe className="w-8 h-8 mx-auto mb-2 text-white" />
              <p className="text-sm font-medium">Global BIM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What We Offer</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Expert BIM services tailored to meet the unique needs of your construction projects
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="border-border overflow-hidden group hover:shadow-2xl transition-all duration-300">
                {/* Image Section with Gradient Overlay */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <service.icon className="text-primary/20" size={120} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <div className="w-16 h-16 rounded-xl bg-primary shadow-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <service.icon className="text-white" size={32} />
                    </div>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <div className="w-1 h-4 bg-primary rounded" />
                      Key Features
                    </h4>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Link href={service.link}>
                    <Button className="w-full group-hover:bg-primary group-hover:text-white transition-all">
                      Learn More
                      <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Our Services Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Choose Our Services</h2>
              <p className="text-xl text-muted-foreground">
                Industry-leading expertise and cutting-edge solutions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-border text-center hover:shadow-xl transition-all group">
                <CardHeader>
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Building2 className="text-primary" size={40} />
                  </div>
                  <CardTitle className="text-xl">Expert Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    50+ certified BIM professionals with extensive industry experience
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border text-center hover:shadow-xl transition-all group">
                <CardHeader>
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Globe className="text-primary" size={40} />
                  </div>
                  <CardTitle className="text-xl">Global Standards</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    ISO certified processes ensuring quality and compliance worldwide
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border text-center hover:shadow-xl transition-all group">
                <CardHeader>
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Layers className="text-primary" size={40} />
                  </div>
                  <CardTitle className="text-xl">Proven Track Record</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    500+ successfully delivered projects across multiple continents
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary to-primary/90 border-0 text-white max-w-4xl mx-auto overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                                 linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                backgroundSize: '30px 30px'
              }} />
            </div>
            
            <CardHeader className="text-center py-16 relative z-10">
              <CardTitle className="text-4xl mb-4 text-white">Ready to Transform Your Project?</CardTitle>
              <CardDescription className="text-xl text-white/90 mb-8">
                Let's discuss how our BIM services can bring your vision to life
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Get Started Today
                </Button>
                <Link href="/projects">
                  <Button size="lg" variant="outline" className="text-lg px-8 border-white/30 text-white hover:bg-white hover:text-primary">
                    View Our Work
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
