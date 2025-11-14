"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
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


const countries = [
  {
    name: "United States",
    flag: "🇺🇸",
    description: "Advanced BIM integration for all kinds of construction and AEC professionals.",
    position: { x: 20, y: 35 }, // Percentage positions on map
    services: ["BIM Modeling", "Clash Detection", "4D/5D Simulation"]
  },
  {
    name: "United Kingdom",
    flag: "🇬🇧",
    description: "Government-backed BIM Level 2 implementation and consulting.",
    position: { x: 49, y: 30 },
    services: ["BIM Level 2", "Digital Twins", "FM Integration"]
  },
  {
    name: "Scandinavia",
    flag: "🇸🇪",
    description: "Digital construction models and coordination for Nordic regions.",
    position: { x: 54, y: 25 },
    services: ["Digital Construction", "Prefab Solutions", "Green BIM"]
  },
  {
    name: "UAE",
    flag: "🇦🇪",
    description: "High-end BIM services for architecture and real estate mega-developments.",
    position: { x: 60, y: 42 },
    services: ["Mega Projects", "Smart Cities", "VDC Services"]
  },
  {
    name: "Saudi Arabia",
    flag: "🇸🇦",
    description: "BIM solutions for giga-projects in oil, gas, and infrastructure industries.",
    position: { x: 58, y: 45 },
    services: ["Infrastructure", "Oil & Gas", "Vision 2030 Projects"]
  },
  {
    name: "Australia",
    flag: "🇦🇺",
    description: "Expert BIM for transportation, healthcare, and education sectors.",
    position: { x: 82, y: 70 },
    services: ["Infrastructure", "Healthcare", "Education"]
  },
  {
    name: "Bangladesh",
    flag: "🇧🇩",
    description: "Comprehensive BIM support for public and private sector projects.",
    position: { x: 70, y: 44 },
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
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [animatedCountries, setAnimatedCountries] = useState<Set<number>>(new Set());
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Animate countries one by one
    countries.forEach((_, index) => {
      setTimeout(() => {
        setAnimatedCountries(prev => new Set(prev).add(index));
      }, index * 200);
    });
    
    // Set map as loaded after a short delay
    setTimeout(() => setMapLoaded(true), 500);
  }, []);



  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-grid-pattern" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <nav className="flex items-center gap-2 text-sm mb-8 text-gray-300">
            <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-cyan-400 transition-colors">Services</Link>
            <span>/</span>
            <span className="text-white">Global BIM Services</span>
          </nav>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Global BIM Services
          </h1>
          <p className="text-xl text-white/80 max-w-3xl">
            Advancing BIM Excellence Worldwide
          </p>
        </div>
      </section>

      {/* Advancing BIM Excellence Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Advancing BIM Excellence Worldwide
          </h2>

          {/* Interactive Map */}
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 mb-16 shadow-2xl border border-slate-700 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, cyan 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }} />
            </div>
            
            <div className="relative w-full h-[500px] md:h-[650px]">
              {/* Simple Static World Map SVG */}
              <svg viewBox="0 0 1000 500" className="w-full h-full">
                <defs>
                  <linearGradient id="lineGradient">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                
                {/* Simplified World Map Continents */}
                <g fill="#334155" stroke="#475569" strokeWidth="1">
                  {/* North America */}
                  <path d="M 100,150 Q 120,120 150,110 L 180,100 L 210,110 L 220,140 L 225,170 L 220,200 L 200,230 L 170,240 L 140,235 L 110,215 L 95,185 Z M 150,135 L 165,130 L 175,140 L 172,155 L 162,160 L 152,155 Z" />
                  
                  {/* South America */}
                  <path d="M 210,300 L 230,295 L 250,310 L 260,340 L 265,380 L 260,420 L 245,450 L 225,460 L 210,455 L 195,435 L 188,400 L 190,360 L 200,325 Z" />
                  
                  {/* Europe */}
                  <path d="M 480,120 L 500,115 L 520,120 L 535,135 L 540,155 L 535,175 L 520,185 L 500,187 L 480,180 L 470,160 L 472,135 Z M 500,130 L 510,128 L 518,135 L 515,145 L 507,148 L 500,145 Z" />
                  
                  {/* Africa */}
                  <path d="M 490,225 L 515,220 L 540,230 L 560,255 L 575,295 L 580,340 L 580,385 L 570,425 L 550,450 L 525,458 L 500,450 L 480,420 L 475,380 L 475,335 L 480,290 L 487,250 Z" />
                  
                  {/* Asia */}
                  <path d="M 580,130 L 620,125 L 670,122 L 720,125 L 770,135 L 810,150 L 835,175 L 845,210 L 840,250 L 825,280 L 800,295 L 760,300 L 710,295 L 670,280 L 640,255 L 620,220 L 605,185 L 595,150 Z M 715,200 L 740,195 L 758,205 L 765,220 L 760,240 L 740,248 L 720,243 L 710,225 Z" />
                  
                  {/* Middle East */}
                  <path d="M 550,205 L 575,200 L 595,210 L 610,225 L 615,245 L 610,265 L 595,273 L 575,270 L 558,258 L 550,240 Z" />
                  
                  {/* Australia */}
                  <path d="M 800,350 L 830,345 L 860,355 L 880,375 L 890,405 L 885,435 L 870,455 L 845,462 L 820,460 L 795,445 L 785,415 L 785,380 Z" />
                  
                  {/* Antarctica (bottom) */}
                  <path d="M 100,480 L 900,480 L 900,495 L 100,495 Z" opacity="0.3" />
                </g>
                
                {/* Connection Lines */}
                {countries.map((country, index) => {
                  if (!animatedCountries.has(index)) return null;
                  const isHovered = hoveredCountry === country.name;
                  return (
                    <line
                      key={`line-${country.name}`}
                      x1="500"
                      y1="250"
                      x2={country.position.x * 10}
                      y2={country.position.y * 10}
                      stroke={isHovered ? "#06b6d4" : "url(#lineGradient)"}
                      strokeWidth={isHovered ? "2" : "1"}
                      strokeDasharray="5,5"
                      opacity={isHovered ? "0.8" : "0.4"}
                      className="transition-all duration-300"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        from="0"
                        to="20"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </line>
                  );
                })}
                
                {/* Center Hub */}
                <circle cx="500" cy="250" r="6" fill="#06b6d4" opacity="0.8" />
                <circle cx="500" cy="250" r="10" fill="none" stroke="#06b6d4" strokeWidth="2" opacity="0.4">
                  <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                </circle>
                
                {/* Country Markers */}
                {countries.map((country, index) => {
                  if (!animatedCountries.has(index)) return null;
                  const isHovered = hoveredCountry === country.name;
                  return (
                    <g key={country.name} className="cursor-pointer">
                      {/* Pulsing outer ring */}
                      <circle
                        cx={country.position.x * 10}
                        cy={country.position.y * 10}
                        r={isHovered ? 16 : 12}
                        fill="#06b6d4"
                        opacity="0.2"
                      >
                        <animate
                          attributeName="r"
                          values={isHovered ? "16;22;16" : "12;18;12"}
                          dur="2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.3;0;0.3"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      
                      {/* Middle ring */}
                      <circle
                        cx={country.position.x * 10}
                        cy={country.position.y * 10}
                        r="8"
                        fill="#06b6d4"
                        opacity={isHovered ? "0.4" : "0.2"}
                        className="transition-opacity duration-300"
                      />
                      
                      {/* Main marker */}
                      <circle
                        cx={country.position.x * 10}
                        cy={country.position.y * 10}
                        r={isHovered ? "6" : "4"}
                        fill="#06b6d4"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-all duration-300"
                        onMouseEnter={() => setHoveredCountry(country.name)}
                        onMouseLeave={() => setHoveredCountry(null)}
                      />
                    </g>
                  );
                })}
              </svg>
              
              {/* Hover Tooltip */}
              {hoveredCountry && (() => {
                const country = countries.find(c => c.name === hoveredCountry);
                if (!country) return null;
                
                return (
                  <div 
                    className="absolute w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-gray-200/50 pointer-events-none z-50"
                    style={{
                      left: `${country.position.x}%`,
                      top: `${country.position.y}%`,
                      transform: 'translate(-50%, -120%)',
                      animation: 'fadeInUp 0.3s ease-out forwards'
                    }}
                  >
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white/95 backdrop-blur-md rotate-45 border-b border-r border-gray-200/50" />
                    
                    <div className="relative">
                      <div className="text-5xl mb-4">{country.flag}</div>
                      <h3 className="font-bold text-xl text-gray-900 mb-3 bg-gradient-to-r from-cyan-600 to-cyan-500 bg-clip-text text-transparent">
                        {country.name}
                      </h3>
                      <p className="text-sm text-gray-700 mb-5 leading-relaxed">
                        {country.description}
                      </p>
                      <div className="space-y-2.5">
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
                      <div className="mt-5 pt-4 border-t border-gray-200">
                        <Button 
                          variant="link" 
                          className="text-cyan-500 hover:text-cyan-600 p-0 h-auto group/btn font-semibold"
                        >
                          Explore More
                          <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-10 pt-8 border-t border-slate-600/30">
              {countries.map((country) => {
                const isHovered = hoveredCountry === country.name;
                return (
                  <div
                    key={`legend-${country.name}`}
                    className={`flex items-center gap-2.5 px-4 py-2 rounded-full cursor-pointer transition-all duration-300 ${
                      isHovered 
                        ? 'bg-cyan-500/20 scale-105 shadow-lg shadow-cyan-500/20' 
                        : 'bg-slate-700/20 hover:bg-slate-700/30'
                    }`}
                    onMouseEnter={() => setHoveredCountry(country.name)}
                    onMouseLeave={() => setHoveredCountry(null)}
                  >
                    <div className={`relative transition-all duration-300 ${
                      isHovered ? 'scale-125' : ''
                    }`}>
                      <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        isHovered ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50' : 'bg-cyan-500'
                      }`} />
                      {isHovered && (
                        <div className="absolute inset-0 bg-cyan-400 rounded-full blur-sm opacity-60" />
                      )}
                    </div>
                    <span className={`text-sm font-medium transition-colors duration-300 ${
                      isHovered ? 'text-cyan-300' : 'text-gray-300'
                    }`}>
                      {country.flag} {country.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Country Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {countries.map((country, index) => (
              <Card 
                key={country.name}
                className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer group border-gray-200 hover:border-cyan-300"
                onMouseEnter={() => setHoveredCountry(country.name)}
                onMouseLeave={() => setHoveredCountry(null)}
              >
                <CardContent className="p-6">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{country.flag}</div>
                  <h3 className="font-bold text-xl mb-3 group-hover:text-cyan-500 transition-colors">
                    {country.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {country.description}
                  </p>
                  <Button 
                    variant="link" 
                    className="text-cyan-500 hover:text-cyan-600 p-0 h-auto group/btn"
                  >
                    Explore More
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Globally */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            Why Choose Us Globally
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Partner with a truly global BIM service provider committed to excellence
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-16">
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
      </section>

      {/* Statistics */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="w-14 h-14 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-cyan-500 transition-colors duration-300">
                  <stat.icon className="text-cyan-600 group-hover:text-white transition-colors duration-300" size={28} />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-cyan-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-600 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to bring world-class BIM expertise to your next project?
          </h2>
          <p className="text-xl mb-8 text-cyan-50 max-w-2xl mx-auto">
            Get in touch with us—let's build the future of smart construction together.
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
      </section>

      <Footer />
    </div>
  );
}
