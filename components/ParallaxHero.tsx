"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const ParallaxHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  // Hero images for the slider
  const heroImages = [
    {
      url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop",
      alt: "Modern BIM Construction"
    },
    {
      url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
      alt: "Architectural Excellence"
    },
    {
      url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2070&auto=format&fit=crop",
      alt: "Infrastructure Development"
    }
  ];

  useEffect(() => {
    // Auto-slide functionality
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(slideInterval);
  }, [heroImages.length]);

  useEffect(() => {
    // Parallax scroll effect
    let passiveSupported = false;
    try {
      window.addEventListener(
        "test",
        null as any,
        Object.defineProperty({}, "passive", {
          get: function () {
            passiveSupported = true;
          },
        })
      );
    } catch (err) {}

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, passiveSupported ? { passive: true } : false);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Calculate parallax transform values
  const parallaxTransform = scrollY * 0.5;

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image Slider */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${image.url})`,
                transform: `translateY(${parallaxTransform}px) scale(1.1)`,
                transition: 'transform 0.1s ease-out',
              }}
            />
          </div>
        ))}
        
        {/* Blue Overlay with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/85 via-sky-700/75 to-blue-800/80 z-20" />
        
        {/* Additional Pattern Overlay */}
        <div className="absolute inset-0 z-20 opacity-10 bg-grid-pattern" />
      </div>

      {/* Content Overlay with Parallax */}
      <div className="relative z-30 flex items-center justify-center min-h-screen">
        <div 
          className="container mx-auto px-4 text-center text-white py-20"
          style={{
            transform: `translateY(${parallaxTransform * 0.3}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 md:mb-3 px-4 sm:px-12 md:px-16 font-[var(--font-roboto)]" style={{ letterSpacing: '0', lineHeight: '1.1' }}>
            <span className="block mb-1 md:mb-2">
              <span className="typing-wrapper">
                <span className="typing-text drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                  Building the Future
                </span>
              </span>
            </span>
            <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl bg-gradient-to-r from-white via-blue-100 to-white/90 bg-clip-text text-transparent animate-fade-in [animation-delay:2.5s] [animation-fill-mode:forwards] drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]" style={{ lineHeight: '1.1' }}>
              with BIM Excellence
            </span>
          </h1>

          {/* Subtitle */}
          <div className="animate-fade-in [animation-delay:3s] [animation-fill-mode:forwards] mb-8 md:mb-12 px-4">
            <p className="text-sm sm:text-base md:text-lg lg:text-xl max-w-4xl mx-auto text-white/95 leading-relaxed mb-2 md:mb-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              Transform your construction projects with cutting-edge Building Information Modeling solutions.
            </p>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-blue-100 font-medium drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              Expert BIM Services • Global Standards • Proven Excellence
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-center animate-fade-in [animation-delay:3.5s] [animation-fill-mode:forwards] px-4">
            <Link href="/services">
              <Button
                size="lg"
                className="text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-12 py-5 sm:py-6 md:py-7 rounded-full bg-white text-sky-600 hover:bg-blue-50 shadow-[0_10px_40px_rgba(0,0,0,0.3)] transition-all hover:scale-105 font-semibold hover:shadow-[0_10px_50px_rgba(14,165,233,0.5)] border-2 border-white w-full sm:w-auto"
              >
                Explore Our Services
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
            <Link href="/projects">
              <Button
                size="lg"
                variant="outline"
                className="text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-12 py-5 sm:py-6 md:py-7 rounded-full border-2 border-white/60 text-white bg-white/10 hover:bg-white/20 hover:border-white backdrop-blur-md transition-all font-semibold shadow-[0_10px_40px_rgba(0,0,0,0.2)] hover:scale-105 w-full sm:w-auto"
              >
                View Our Work
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Slider Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-3">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide 
                ? 'w-12 h-3 bg-white' 
                : 'w-3 h-3 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 animate-bounce z-30">
        <div className="w-6 h-10 rounded-full border-2 border-white/40 flex justify-center p-2 backdrop-blur-sm">
          <div className="w-1 h-3 bg-white/60 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default ParallaxHero;
