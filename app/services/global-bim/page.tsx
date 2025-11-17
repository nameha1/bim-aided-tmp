"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  Globe, 
  Clock, 
  Shield, 
  Zap, 
  Users, 
  Award,
  CheckCircle,
  ArrowRight,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Lazy load heavy components
const Navigation = dynamic(() => import("@/components/Navigation"), {
  loading: () => <div className="h-20 bg-background border-b" />,
});

const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => <div className="h-96 bg-muted" />,
});


const countries = [
  {
    name: "United States",
    flag: "🇺🇸",
    description: "Advanced BIM integration for all kinds of construction and AEC professionals.",
    services: ["BIM Modeling", "Clash Detection", "4D/5D Simulation"]
  },
  {
    name: "United Kingdom",
    flag: "🇬🇧",
    description: "Government-backed BIM Level 2 implementation and consulting.",
    services: ["BIM Level 2", "Digital Twins", "FM Integration"]
  },
  {
    name: "Scandinavia",
    flag: "🇸🇪",
    description: "Digital construction models and coordination for Nordic regions.",
    services: ["Digital Construction", "Prefab Solutions", "Green BIM"]
  },
  {
    name: "UAE",
    flag: "🇦🇪",
    description: "High-end BIM services for architecture and real estate mega-developments.",
    services: ["Mega Projects", "Smart Cities", "VDC Services"]
  },
  {
    name: "Saudi Arabia",
    flag: "🇸🇦",
    description: "BIM solutions for giga-projects in oil, gas, and infrastructure industries.",
    services: ["Infrastructure", "Oil & Gas", "Vision 2030 Projects"]
  },
  {
    name: "Australia",
    flag: "🇦🇺",
    description: "Expert BIM for transportation, healthcare, and education sectors.",
    services: ["Infrastructure", "Healthcare", "Education"]
  },
  {
    name: "Bangladesh",
    flag: "🇧🇩",
    description: "Comprehensive BIM support for public and private sector projects.",
    services: ["Public Sector", "Commercial", "Residential"]
  }
];

const stats = [
  { icon: Users, value: "200+", label: "Satisfied Clients" },
  { icon: Award, value: "800+", label: "Successful Projects" },
  { icon: Globe, value: "50+", label: "BIM Experts" },
  { icon: CheckCircle, value: "9+", label: "Successful Years" },
  { icon: Globe, value: "10+", label: "Countries Coverage" }
];

const benefits = [
  {
    icon: Globe,
    title: "Bilingual & Multi-standard Modeling",
    description: "Support for international standards and languages"
  },
  {
    icon: Clock,
    title: "24/7 Delivery Workflow",
    description: "Round-the-clock service across time zones"
  },
  {
    icon: Shield,
    title: "Flexible Integration with Client Systems",
    description: "Seamless integration with your existing workflows"
  },
  {
    icon: Zap,
    title: "High Standards of Data Security",
    description: "Enterprise-grade security for your projects"
  },
  {
    icon: Users,
    title: "Accelerated Project Turnarounds",
    description: "Fast delivery without compromising quality"
  }
];

export default function GlobalBIMServices() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section with Background Image */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/images/bim-services/global-bim-hero.jpg" 
            alt="Global BIM Services Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-sky-900/85 via-sky-700/75 to-blue-800/80" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            <Badge className="mb-6 px-4 py-2 text-sm" variant="secondary">
              Global BIM Excellence
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white">
              Global BIM Services
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Delivering world-class BIM services across continents with 24/7 support, multi-standard expertise, and seamless integration. From North America to the Middle East, Australia to Europe, we bring advanced BIM capabilities to your projects regardless of location or time zone.
            </p>
            
            <div className="mb-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
                  <h3 className="font-semibold text-white mb-2">Worldwide Coverage</h3>
                  <p className="text-sm text-white/80">Operating across 10+ countries with local expertise in international standards and regulations</p>
                </div>
                <div className="p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
                  <h3 className="font-semibold text-white mb-2">24/7 Delivery Workflow</h3>
                  <p className="text-sm text-white/80">Round-the-clock service ensuring continuous project progress across all time zones</p>
                </div>
                <div className="p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
                  <h3 className="font-semibold text-white mb-2">Multi-Standard Support</h3>
                  <p className="text-sm text-white/80">Expertise in AIA, ISO, BS, GB, and regional building codes and BIM protocols</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { value: "10+", label: "Countries Served" },
                { value: "800+", label: "Global Projects" },
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

      {/* Global Coverage Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-gray-900">
                Advancing BIM Excellence Worldwide
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our global presence ensures that no matter where your project is located, you receive the same high-quality BIM services backed by local expertise and international standards compliance. We understand regional requirements, building codes, and construction practices across diverse markets.
              </p>
            </div>

            {/* Countries We Serve */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
              {countries.map((country, index) => (
                <Card 
                  key={country.name}
                  className="h-full hover:shadow-2xl transition-all duration-300 group border-gray-200 hover:border-cyan-300"
                >
                  <CardContent className="p-6">
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{country.flag}</div>
                    <h3 className="font-bold text-xl mb-3 group-hover:text-cyan-500 transition-colors">
                      {country.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {country.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent" />
                        <p className="text-xs font-bold text-cyan-600 uppercase tracking-wider">Key Services</p>
                        <div className="h-px flex-1 bg-gradient-to-l from-cyan-500/50 to-transparent" />
                      </div>
                      {country.services.map((service) => (
                        <div key={service} className="flex items-start gap-3 text-sm text-gray-800">
                          <CheckCircle className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                          <span className="font-medium">{service}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Additional Global Capabilities */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold mb-6 text-center text-gray-900">Our Global Capabilities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-lg text-cyan-600 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Regional Expertise
                  </h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Our teams possess deep knowledge of local building codes, regulatory requirements, and construction practices across North America, Europe, Middle East, Asia Pacific, and Australia. This regional expertise ensures that your BIM models are not just technically accurate but also compliant with local standards and ready for seamless permitting and approval processes.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    We work with government-backed initiatives like BIM Level 2 in the UK, support Vision 2030 mega-projects in Saudi Arabia, and deliver advanced BIM integration for construction professionals across the United States and beyond.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-cyan-600 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Continuous Delivery
                  </h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    With strategically located teams across multiple time zones, we offer true 24/7 project delivery. When your team finishes their workday, ours begins—ensuring continuous progress on your projects. This "follow-the-sun" workflow dramatically reduces project timelines and enables rapid turnarounds on urgent deliverables.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Our cloud-based collaboration platforms and Common Data Environments (CDE) ensure seamless handoffs, real-time updates, and transparent communication regardless of geographic boundaries.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-cyan-600 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Standards & Compliance
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    We maintain expertise across international BIM standards including ISO 19650, AIA BIM protocols, British Standards (BS 1192), Chinese National Standards (GB), and regional variations. Our teams are trained in local measurement standards, classification systems (Uniclass, Omniclass, MasterFormat), and industry-specific requirements for healthcare, education, infrastructure, and commercial developments.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-cyan-600 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Multilingual Support
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    Our diverse, multilingual teams can communicate effectively in English, Arabic, Chinese, and Nordic languages, ensuring clear understanding of project requirements, technical specifications, and design intent. We provide bilingual documentation and support local collaboration with your architects, engineers, and contractors.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Globally */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
              Why Choose Us Globally
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Partner with a truly global BIM service provider committed to excellence. Our worldwide presence combines local market knowledge with international best practices, ensuring your projects benefit from proven methodologies adapted to regional requirements. We don't just deliver models—we deliver strategic BIM partnerships that drive project success across borders.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit.title}
                  className="text-center group"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-cyan-500 group-hover:to-cyan-400 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                    <benefit.icon className="text-cyan-600 group-hover:text-white transition-colors duration-300" size={36} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">{benefit.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to bring world-class BIM expertise to your next project?
            </h2>
            <p className="text-xl mb-4 text-cyan-50 leading-relaxed">
              Whether you're planning a mega-development in the Middle East, a sustainable building in Scandinavia, or infrastructure in North America, our global team is ready to support your vision with cutting-edge BIM services.
            </p>
            <p className="text-lg mb-8 text-cyan-100 leading-relaxed">
              Get in touch with us today—let's build the future of smart construction together, no matter where in the world your project is located.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" variant="outline" className="bg-white text-cyan-600 hover:bg-gray-100 border-0 hover:scale-105 transition-transform">
                  Contact Us
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" className="bg-cyan-700 hover:bg-cyan-800 text-white hover:scale-105 transition-transform">
                  Get a Quote
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
