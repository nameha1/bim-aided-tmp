"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Building2, Layers, Box, Globe, ArrowRight, CheckCircle2, Send } from "lucide-react";
import Footer from "@/components/Footer";

// Lazy load heavy components
const Navigation = lazy(() => import("@/components/Navigation"));
const ParallaxHero = lazy(() => import("@/components/ParallaxHero"));

// Loading components
const NavigationSkeleton = () => <div className="h-20 bg-background border-b" />;
const HeroSkeleton = () => <div className="h-screen bg-gradient-to-b from-primary/10 to-background" />;

export default function Landing() {
  const { toast } = useToast();
  
  // Static fallback projects - initialize with these
  const staticProjects = [
    {
      id: "1",
      title: "Downtown Business Center",
      category: "Commercial",
      description: "Complete BIM modeling and coordination for a 30-story mixed-use development.",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    },
    {
      id: "3",
      title: "National Sports Arena",
      category: "Cultural & Sports",
      description: "Advanced structural and MEP modeling for large-scale sports facility.",
      image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
    },
    {
      id: "5",
      title: "Metro Transit Station",
      category: "Infrastructure & Municipal",
      description: "Infrastructure BIM coordination for urban transit development.",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
    },
  ];
  
  const [featuredProjects, setFeaturedProjects] = useState<any[]>(staticProjects);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [submitTime, setSubmitTime] = useState<number>(0);
  
  const services = [
    {
      icon: Building2,
      title: "BIM Modeling",
      description: "Comprehensive 3D modeling services for architectural, structural, and MEP systems.",
      image: "/images/bim-services/BIM Modeling.jpeg",
      href: "/services/bim-modeling"
    },
    {
      icon: Layers,
      title: "Advanced BIM Services",
      description: "Clash detection, 4D/5D BIM, and facility management solutions.",
      image: "/images/bim-services/Advanced BIM.jpeg",
      href: "/services/advanced-bim"
    },
    {
      icon: Box,
      title: "VDC Services",
      description: "Virtual Design & Construction coordination for seamless project delivery.",
      image: "/images/bim-services/VDC.jpeg",
      href: "/services/vdc-services"
    },
    {
      icon: Globe,
      title: "Global BIM Services",
      description: "International BIM standards compliance and consulting services.",
      image: "/images/bim-services/Global BIM.jpeg",
      href: "/services/global-bim"
    },
    {
      icon: Layers,
      title: "Scan to BIM",
      description: "Convert laser scans and point clouds into accurate 3D BIM models for renovation, facility management, and more.",
  image: "/images/Scan to BIM.jpeg",
      href: "/services/scan-to-bim"
    },
  ];

  const stats = [
    { value: "200+", label: "Projects Completed" },
    { value: "20+", label: "Expert Team Members" },
    { value: "10+", label: "Years Experience" },
    { value: "98%", label: "Client Satisfaction" },
  ];

  // Helper function to truncate description to 30 words
  const truncateDescription = (text: string, maxWords: number = 30) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  // Fetch featured projects from database
  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        console.log('[Landing Page] Fetching featured projects from Firestore...');
        
        // Import Firebase functions dynamically
        const { getDocuments } = await import('@/lib/firebase/firestore');
        const { where, orderBy: firestoreOrderBy, limit: firestoreLimit } = await import('firebase/firestore');
        
        let { data, error } = await getDocuments('projects', [
          where('published', '==', true),
          firestoreOrderBy('created_at', 'desc'),
          firestoreLimit(3)
        ]);

        // If query fails (likely due to missing index), try without ordering
        if (error && error.message?.includes('index')) {
          console.warn('[Landing Page] ⚠️ Index required for ordering, fetching without orderBy');
          const fallbackResult = await getDocuments('projects', [
            where('published', '==', true),
            firestoreLimit(3)
          ]);
          data = fallbackResult.data;
          error = fallbackResult.error;
          
          // Sort in memory if we got data
          if (data && data.length > 0) {
            data = data.sort((a: any, b: any) => {
              const aTime = a.created_at?.toMillis?.() || 0;
              const bTime = b.created_at?.toMillis?.() || 0;
              return bTime - aTime;
            }).slice(0, 3);
          }
        }

        if (error) {
          console.error('[Landing Page] ❌ Error fetching projects:', error);
          console.log('[Landing Page] Keeping static fallback projects');
          return; // Keep the staticProjects that were set in useState
        }

        console.log('[Landing Page] ✅ Fetched from Firestore:', data?.length, 'projects');
        console.log('[Landing Page] Data:', data);

        if (data && data.length > 0) {
          // Use database projects if available
          console.log('[Landing Page] 📦 Raw project data from DB:', JSON.stringify(data, null, 2));
          const dbProjects = data.map((p: any) => {
            // Try image_url first, then gallery_image_1, then image, then fallback
            let imageUrl = p.image_url;
            
            if (!imageUrl || imageUrl === 'N/A') {
              console.log(`[Landing Page] ⚠️ No image_url for "${p.title}", checking gallery_image_1`);
              imageUrl = p.gallery_image_1;
            }
            
            if (!imageUrl || imageUrl === 'N/A') {
              console.log(`[Landing Page] ⚠️ No gallery_image_1 for "${p.title}", checking image field`);
              imageUrl = p.image;
            }
            
            if (!imageUrl || imageUrl === 'N/A') {
              console.log(`[Landing Page] ⚠️ No images found for "${p.title}", using fallback`);
              imageUrl = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920";
            }
            
            console.log(`[Landing Page] 🖼️ Project "${p.title}" - Final image: ${imageUrl}`);
            
            return {
              id: p.id,
              title: p.title,
              category: p.category,
              description: truncateDescription(p.description || ''),
              image: imageUrl,
            };
          });
          console.log('[Landing Page] 📊 Setting featured projects with database data');
          console.log('[Landing Page] 🖼️ Final mapped projects:', JSON.stringify(dbProjects, null, 2));
          setFeaturedProjects(dbProjects);
        } else {
          // Keep static projects if no database data
          console.log('[Landing Page] ⚠️ No projects found in database, keeping static fallback');
        }
      } catch (error) {
        console.error('[Landing Page] ❌ Exception in fetchFeaturedProjects:', error);
        console.log('[Landing Page] Keeping static fallback projects');
        // Keep the staticProjects that were set in useState
      }
    };

    fetchFeaturedProjects();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Set submit time on first interaction
    if (submitTime === 0) {
      setSubmitTime(Date.now());
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Spam detection function
  const detectSpam = (): { isSpam: boolean; reason: string } => {
    if (honeypot) {
      return { isSpam: true, reason: "Honeypot triggered" };
    }

    const timeTaken = Date.now() - submitTime;
    if (timeTaken < 3000) {
      return { isSpam: true, reason: "Form submitted too quickly" };
    }

    const spamKeywords = [
      'viagra', 'cialis', 'casino', 'lottery', 'prize', 'winner',
      'click here', 'buy now', 'limited time', 'act now', 'weight loss',
      'make money', 'work from home', 'bitcoin', 'cryptocurrency'
    ];
    
    const content = `${formData.name} ${formData.email} ${formData.subject} ${formData.message}`.toLowerCase();
    const foundSpamKeyword = spamKeywords.find(keyword => content.includes(keyword));
    if (foundSpamKeyword) {
      return { isSpam: true, reason: `Spam keyword detected: ${foundSpamKeyword}` };
    }

    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const links = formData.message.match(linkRegex) || [];
    if (links.length > 3) {
      return { isSpam: true, reason: "Too many links in message" };
    }

    const repeatedCharsRegex = /(.)\1{4,}/;
    if (repeatedCharsRegex.test(formData.message)) {
      return { isSpam: true, reason: "Excessive repeated characters" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return { isSpam: true, reason: "Invalid email format" };
    }

    if (formData.message.length < 10) {
      return { isSpam: true, reason: "Message too short" };
    }
    if (formData.message.length > 5000) {
      return { isSpam: true, reason: "Message too long" };
    }

    const capsRatio = (formData.message.match(/[A-Z]/g) || []).length / formData.message.length;
    if (capsRatio > 0.5 && formData.message.length > 20) {
      return { isSpam: true, reason: "Excessive capital letters" };
    }

    return { isSpam: false, reason: "" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const spamCheck = detectSpam();
      if (spamCheck.isSpam) {
        console.warn("Spam detected:", spamCheck.reason);
        toast({
          title: "Submission Failed",
          description: "Your message appears to be spam. If this is an error, please contact us directly.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Save inquiry to Firestore
      const { createDocument } = await import('@/lib/firebase/firestore');
      const { data: inquiryId, error: dbError } = await createDocument('contact_inquiries', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        created_at: new Date(),
      });

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error("Failed to save inquiry to database");
      }

      console.log("Inquiry saved to database:", inquiryId);

      try {
        const response = await fetch("/api/send-contact-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const emailResult = await response.json();

        if (!response.ok) {
          console.error("Email sending failed:", emailResult);
          toast({
            title: "Message Saved",
            description: "Your message was saved but email notification failed. We'll still respond to you!",
            variant: "default",
          });
        } else {
          console.log("Email sent successfully:", emailResult.messageId);
          toast({
            title: "Message Sent!",
            description: "We've received your inquiry and will get back to you as soon as possible.",
          });
        }
      } catch (emailError) {
        console.error("Email error:", emailError);
        toast({
          title: "Message Saved",
          description: "Your message was saved successfully. We'll respond to you soon!",
        });
      }

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setSubmitTime(0);

    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit your message. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Suspense fallback={<NavigationSkeleton />}>
        <Navigation />
      </Suspense>
      
      {/* Parallax Hero Section */}
      <Suspense fallback={<HeroSkeleton />}>
        <ParallaxHero />
      </Suspense>

      {/* Stats Section */}
  <section className="py-8 bg-secondary">
        <div className="w-full mx-auto px-6 lg:px-12 xl:px-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="w-full mx-auto px-6 lg:px-12 xl:px-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-xl text-muted-foreground mx-auto">
              Comprehensive BIM solutions tailored to your project needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Link key={index} href={service.href}>
                <Card 
                  className="border-border hover:shadow-2xl transition-all duration-500 group overflow-hidden animate-fade-in-up cursor-pointer h-full"
                  style={{ 
                    animationDelay: `${index * 150}ms`,
                    opacity: 0
                  }}
                >
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  </div>

                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="leading-relaxed">{service.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/services">
              <Button size="lg">
                Explore All Services
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 bg-secondary">
        <div className="w-full mx-auto px-6 lg:px-12 xl:px-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Featured Projects</h2>
            <p className="text-xl text-muted-foreground mx-auto">
              Showcasing our expertise across diverse building and infrastructure projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project, index) => (
              <Link key={index} href={`/projects/${project.id}`}>
                <Card className="border-border overflow-hidden group hover:shadow-xl transition-all cursor-pointer h-full">
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        console.error('[Landing Page] ❌ Image failed to load:', project.image);
                        console.error('[Landing Page] Error:', e);
                      }}
                      onLoad={() => {
                        console.log('[Landing Page] ✅ Image loaded successfully:', project.image);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full mb-2 inline-block">
                        {project.category}
                      </span>
                      <h3 className="text-white font-semibold text-lg line-clamp-2">{project.title}</h3>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/projects">
              <Button size="lg" variant="outline">
                View All Projects
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20">
        <div className="w-full mx-auto px-6 lg:px-12 xl:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Why Choose BIMaided?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                We deliver exceptional BIM services with a commitment to quality, innovation, and client satisfaction.
              </p>
              
              <div className="space-y-4">
                {[
                  "Industry-leading BIM expertise",
                  "Cutting-edge technology and tools",
                  "Dedicated project management",
                  "Global delivery capabilities",
                  "Proven track record of success",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="text-primary flex-shrink-0" size={24} />
                    <span className="text-lg">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link href="/about">
                  <Button size="lg">Learn More About Us</Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-3xl text-primary">10+</CardTitle>
                  <CardDescription>Years of Experience</CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-3xl text-primary">200+</CardTitle>
                  <CardDescription>Projects Delivered</CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-3xl text-primary">20+</CardTitle>
                  <CardDescription>Team Members</CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-3xl text-primary">98%</CardTitle>
                  <CardDescription>Client Satisfaction</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-secondary">
        <div className="w-full mx-auto px-6 lg:px-12 xl:px-20">
          <div className="w-full mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
              <p className="text-xl text-muted-foreground">
                Have a project in mind? Let's discuss how we can help
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column - Contact Information */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Send Us a Message</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                    Ready to transform your project with cutting-edge BIM solutions? Our team of experts is here to help bring your vision to life.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Whether you need BIM modeling, clash detection, VDC services, or any of our comprehensive solutions, we're committed to delivering exceptional results tailored to your needs.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="text-primary" size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Quick Response</h4>
                      <p className="text-muted-foreground">We typically respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="text-primary" size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Expert Consultation</h4>
                      <p className="text-muted-foreground">Free initial consultation for your project</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="text-primary" size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Global Reach</h4>
                      <p className="text-muted-foreground">Serving clients worldwide with 24/7 support</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">Prefer to reach us directly?</p>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Email:</span>
                        <a href="mailto:info@bimaided.com" className="text-primary hover:underline">
                          info@bimaided.com
                        </a>
                      </p>
                      <p className="flex items-center gap-2 text-sm pl-[52px]">
                        <a href="mailto:info.bimaided@gmail.com" className="text-primary hover:underline">
                          info.bimaided@gmail.com
                        </a>
                      </p>
                    </div>
                    <p className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Phone:</span>
                      <span>+880 1308-230988</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Contact Form */}
              <div>
                <Card className="p-8 shadow-xl">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Honeypot field */}
                    <input
                      type="text"
                      name="website"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                    />
                    
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium">
                        Phone Number <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+880 XXXX-XXXXXX"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">
                        Subject <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="What is this regarding?"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message <span className="text-destructive">*</span>
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us more about your project or inquiry..."
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="mr-2" size={18} />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </Card>
              </div>
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