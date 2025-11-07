"use client";

import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Link from "next/link";

export default function Contact() {
  const { toast } = useToast();
  const { executeRecaptcha } = useGoogleReCaptcha();
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Set submit time on first interaction (spam bots submit too fast)
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
    // 1. Honeypot check (hidden field that bots fill)
    if (honeypot) {
      return { isSpam: true, reason: "Honeypot triggered" };
    }

    // 2. Time-based check (submission too fast - likely bot)
    const timeTaken = Date.now() - submitTime;
    if (timeTaken < 3000) { // Less than 3 seconds
      return { isSpam: true, reason: "Form submitted too quickly" };
    }

    // 3. Check for spam keywords
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

    // 4. Check for excessive links (more than 3 links is suspicious)
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const links = formData.message.match(linkRegex) || [];
    if (links.length > 3) {
      return { isSpam: true, reason: "Too many links in message" };
    }

    // 5. Check for repeated characters (aaaaa, 11111)
    const repeatedCharsRegex = /(.)\1{4,}/;
    if (repeatedCharsRegex.test(formData.message)) {
      return { isSpam: true, reason: "Excessive repeated characters" };
    }

    // 6. Check for email format validity
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return { isSpam: true, reason: "Invalid email format" };
    }

    // 7. Check message length (too short or suspiciously long)
    if (formData.message.length < 10) {
      return { isSpam: true, reason: "Message too short" };
    }
    if (formData.message.length > 5000) {
      return { isSpam: true, reason: "Message too long" };
    }

    // 8. Check for all caps message (SPAM OFTEN USES CAPS)
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
      // Run spam detection
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

      // Execute reCAPTCHA verification
      if (!executeRecaptcha) {
        console.error("reCAPTCHA not loaded");
        toast({
          title: "Error",
          description: "Security verification is loading. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const recaptchaToken = await executeRecaptcha("contact_form");
      console.log("reCAPTCHA token generated");

      // Verify reCAPTCHA token with backend
      try {
        const verifyResponse = await fetch("/api/verify-recaptcha", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: recaptchaToken }),
        });

        const verifyResult = await verifyResponse.json();

        if (!verifyResponse.ok || !verifyResult.success) {
          console.error("reCAPTCHA verification failed:", verifyResult);
          toast({
            title: "Security Check Failed",
            description: "Failed security verification. Please try again.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        console.log("reCAPTCHA verified. Score:", verifyResult.score);

        // Check score (0.0 = bot, 1.0 = human)
        if (verifyResult.score < 0.5) {
          console.warn("Low reCAPTCHA score:", verifyResult.score);
          toast({
            title: "Suspicious Activity Detected",
            description: "Your submission appears suspicious. Please contact us directly if you need assistance.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      } catch (recaptchaError) {
        console.error("reCAPTCHA verification error:", recaptchaError);
        // Continue anyway - don't block legitimate users if verification service is down
      }
      // Step 1: Save to Supabase database
      const { data: inquiry, error: dbError } = await supabase
        .from("contact_inquiries")
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          status: "new"
        })
        .select()
        .single();

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error("Failed to save inquiry to database");
      }

      console.log("Inquiry saved to database:", inquiry.id);

      // Step 2: Send email notification
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
          // Don't throw error - inquiry is already saved
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
        // Email failed but inquiry is saved
        toast({
          title: "Message Saved",
          description: "Your message was saved successfully. We'll respond to you soon!",
        });
      }

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

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
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-primary/10 via-background to-secondary/20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} />
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, currentColor 1px, transparent 1px),
              radial-gradient(circle at 80% 50%, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl text-muted-foreground">
              Get in touch with our team. We're here to help with your BIM needs.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold mb-2">Email Us</h3>
              <a 
                href="mailto:design.bimaided@gmail.com" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                design.bimaided@gmail.com
              </a>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold mb-2">Call Us</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>+880 1308-230988</p>
                <p>+880 1672-843230</p>
                <p>+880 1737-727342</p>
              </div>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold mb-2">Visit Us</h3>
              <p className="text-sm text-muted-foreground">
                ECB, Dhaka Cantonment<br />
                Dhaka-1206, Bangladesh
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold mb-2">Working Hours</h3>
              <p className="text-sm text-muted-foreground">
                Saturday - Thursday<br />
                8:00 AM - 9:00 PM
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Send Us a Message</h2>
              <p className="text-xl text-muted-foreground">
                Fill out the form below and we'll get back to you shortly
              </p>
            </div>

            <Card className="p-8 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot field - hidden from users, bots will fill it */}
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full sm:w-auto"
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
                  
                  <p className="text-xs text-muted-foreground text-center sm:text-right">
                    This site is protected by reCAPTCHA and the Google{" "}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">
                      Privacy Policy
                    </a>{" "}
                    and{" "}
                    <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">
                      Terms of Service
                    </a>{" "}
                    apply.
                  </p>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Card className="overflow-hidden">
              <div className="w-full h-[400px] md:h-[500px]">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3649.742153860274!2d90.41639304708292!3d23.827766302575217!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c70062d47fad%3A0xe6259197d5c56fdf!2sBIMaided!5e0!3m2!1sen!2sbd!4v1762355962923!5m2!1sen!2sbd" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="BIMaided Location"
                />
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
