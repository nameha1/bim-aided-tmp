"use client";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Eye, Award } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section - uses image at public/images/about-team-1.jpg */}
      <section
        className="pt-32 pb-16 bg-cover bg-center"
        style={{ backgroundImage: `url('/images/about-team-1.jpg')` }}
        aria-label="BIMaided team hero"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center py-20">
            <h1 className="text-5xl font-bold mb-6 text-white drop-shadow-lg">About BIMaided</h1>
            <p className="text-xl text-white drop-shadow-lg">
              Leading the future of construction through innovative BIM solutions
            </p>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Founded with a vision to revolutionize the construction industry, BIMaided has grown into a trusted partner for organizations worldwide. With over 15 years of experience, we specialize in delivering comprehensive Building Information Modeling solutions that transform how projects are designed, built, and managed.
              </p>
              <p>
                Our team of dedicated BIM professionals combines technical expertise with industry knowledge to deliver exceptional results. We work closely with architects, engineers, contractors, and owners to ensure seamless project coordination and successful outcomes.
              </p>
              <p>
                From small-scale renovations to large infrastructure projects, we bring the same level of commitment and excellence to every engagement. Our global delivery model ensures that we can support projects anywhere in the world while maintaining the highest quality standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-border text-center">
              <CardHeader>
                <div className="w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="text-primary" size={32} />
                </div>
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To empower construction professionals with cutting-edge BIM solutions that enhance collaboration, reduce costs, and deliver exceptional project outcomes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border text-center">
              <CardHeader>
                <div className="w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Eye className="text-primary" size={32} />
                </div>
                <CardTitle>Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To be the global leader in BIM services, recognized for innovation, quality, and commitment to advancing the construction industry.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border text-center">
              <CardHeader>
                <div className="w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Award className="text-primary" size={32} />
                </div>
                <CardTitle>Our Values</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Excellence, integrity, innovation, and collaboration guide everything we do. We're committed to delivering value and building lasting partnerships.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Team</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our diverse team of BIM professionals brings together expertise from architecture, engineering, and construction management
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">15+</div>
              <div className="text-muted-foreground">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">20+</div>
              <div className="text-muted-foreground">Countries Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Projects Delivered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Photos + Text Section
          Layout: on md+ screens show two columns: left = text, right = 3 images stacked (alternative layout)
          Uses images: public/images/about-team-2.jpg, about-team-3.jpg, about-team-4.jpg
      */}
      <section className="py-12 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Meet the Team</h3>
              <p className="text-muted-foreground mb-6">
                A snapshot from our studio — collaboration, focus and craft. Below are moments captured while our team works on modeling, coordination and reviews.
              </p>

              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>• Cross-discipline coordination and clash resolution</li>
                <li>• Detailed modeling and drawing production</li>
                <li>• Project reviews and client collaboration</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <figure className="overflow-hidden rounded-lg bg-white shadow-sm">
                <img src="/images/about-team-2.jpg" alt="Modeling and coordination" className="w-full h-40 object-cover" />
              </figure>

              <figure className="overflow-hidden rounded-lg bg-white shadow-sm">
                <img src="/images/about-team-3.jpg" alt="Focused drafting" className="w-full h-40 object-cover" />
              </figure>

              <figure className="overflow-hidden rounded-lg bg-white shadow-sm">
                <img src="/images/about-team-4.jpg" alt="Project review" className="w-full h-40 object-cover" />
              </figure>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
