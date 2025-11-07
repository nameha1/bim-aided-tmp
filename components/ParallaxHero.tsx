"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const ParallaxHero = () => {
  useEffect(() => {
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
      const parallaxElement = document.querySelector(".parallax-container");
      if (parallaxElement) {
        const height = parallaxElement.getBoundingClientRect().height;
        const percentage = Math.min(Math.max(window.pageYOffset / height, 0), 1);
        document.documentElement.style.setProperty("--pct", String(percentage));
      }
    };

    window.addEventListener("scroll", handleScroll, passiveSupported ? { passive: true } : false);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section className="parallax-hero relative min-h-screen overflow-hidden">
      {/* SVG Masks Resource */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 480 240"
        className="absolute top-0 left-0 w-0 h-0 overflow-hidden"
        focusable="false"
        aria-hidden="true"
      >
        <style>{`mask { fill: white; }`}</style>

        {/* City building masks - simplified version */}
        <mask id="m1">
          <path d="M480 215.9h-3.9v3.3l-18-.7V240H480zM405 240l-.6-85.5-4.4-3.6-6.9-.7h-6.2v.5l-17.7-.5v-1h-1.3v1l-.7-.1-.6 1-4.3.1v-1l-.7-.1v-1.3l-.5-.5h-1v.8l-1.5-.1v.7l-.6-.1v-1.3l-1.3.3v1.2l-1.8-.2-3.1-.1-1.8-1.5-1.9 1.2v.7l-6.3-.1-.8-.2.4 90.4zm-181.5 0v-86.5l1-1.2h.4v-9.5h2.6v-4.5l.7-.4v-5.1l3.9-1.1h.9v-1.2h-.7v-1.3l2.8-1v-2.7l1.3-.9h5.1v2.5l.8.1 1.3.9v3.7l3.2-.2v2l.3 3.4.4.2v4.6l2.3.1.3 6.7 1.1.2v2.6l.9.1v51.1l6.3.3.7.2v10l2.3.1v6.6l.7.1v10.3h.4v9.8zm-128.8 0l1.8-1.2v-1.5h.6v-.7l2.3-1.5h.4v-2.9l.8-.9h3.6v3.6h3l8.3.4v-25.4l2.4-1.3v-6.1l1.5-.7 3.4-.9v-4l.4-.4.4-3.1h2.6v-1.5l1.1-.5h1.9v-.5h.6v-2.6h1v-.7h7.8v3l-.5.5v.7l.5.1.5.7 2.2-.2v-.3h.6v.4l.5-.1.5-.4h.3v3.7l.7.1v5.8l4.6-.3.5 15.1 1.1.2.3 23.4zM0 224.5l5.2-3.3 34.4 2.6v2.6h1.2V240H0z" />
        </mask>
        <mask id="m2">
          <path d="M480 149h-10.9v64.1l-5.7.8v12.6h-6.6V175l-.6-.8v-1.5l-2-1.1-.8-.1v-1.2l.5-.8-2.7-1.8-1.9.1v-.4l-9-.2v.5l-1-.1v3.8l-1.2.1v1.3l-1.5-.2v52.2l-9.8-.4-.3 2.1h-1.9v-7.6l-.4-.5v-1.8l-1.1-1.3v-2.9l-1.3-1.7v-3.1l-1.2-1.7v-3.7l-3.3-3.6-1.5-.4v-2.8l-1.9-1.4-.2-1.7-2-.1v.6l-1.7.1v-1l-2.1-.1v1.3l-.5-.1-.3 1-.6.4v3.4h-1.8l.3 42.2h75zm-256.5 91v-9.5h-3.3v-35.2l-1.9-1.3v-2.7l-.5-.4v-2.3h-1.4l-2.8-4.8v-1.1h-3.3l-.7.5v1.2l-2.5 4.2h-.7l-1.3 1.1v-8.4l-10.2-.4v.3l-8-.3-3 1.8v25.5l-.5-.1v-6.7l-.8-.3-21.7-.9-3.8 2.5V240z" />
        </mask>
        <mask id="m3">
          <path d="M0 134.8h7.8V133h4.8v1.5l11.4-.1 3.2 1.5h4.3v4.7h1.3l-.2 47.2 6.7-2.3 2.4-.2h.6v-41.2l.3-.1v-4.7l-.2-.5-.6-1.7.6-.5.5-.8.5-.2.2-1.5 2.5-.8.3-.8 2.1-.2 4.9-.3h1.7l.3-.5h13.5l6.3 2.5.9.1v.9h4.4v7.9l.3.1v1.6l-.4.1.4 21.8.2.3.2 26.5h1.4v8.6l2-1.2h3.7v-39.5l1.4-.2 1.6-.4v-1.3l.4-.3v-7.1l.6-.2V149l.5-3.1.3-.7.6.1.4 3.6.5-.2v-1.4l.7-2.6.5.1.2 2 .2 2.2.3-.2v-2.2l.3-1.4h.7l.4 3.4.7-.4v-3h.8l.3 3.6.5-.1.5-2 .3-1.3.5.2v2.9l.6-.3v-2.7h.9v3.3l1.3.6v2h.4v7.1l.6.2v1.7l2-.1V240H0z" />
        </mask>

        {/* Background image using construction/BIM imagery */}
        <svg id="bg">
          <image
            width="480"
            height="240"
            xlinkHref="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop"
          />
        </svg>
        <svg id="p3">
          <use mask="url(#m3)" xlinkHref="#bg" />
        </svg>
        <svg id="p2">
          <use mask="url(#m2)" xlinkHref="#bg" />
        </svg>
        <svg id="p1">
          <use mask="url(#m1)" xlinkHref="#bg" />
        </svg>
      </svg>

      {/* Parallax Container */}
      <div className="parallax-container">
        <div className="parallax-wrapper">
          <div className="parallax-bg">
            <svg viewBox="0 0 480 240">
              <use xlinkHref="#bg" />
            </svg>
          </div>
          <div className="parallax-p3">
            <svg viewBox="0 0 480 240">
              <use xlinkHref="#p3" />
            </svg>
          </div>
          <div className="parallax-p2">
            <svg viewBox="0 0 480 240">
              <use xlinkHref="#p2" />
            </svg>
          </div>
          <div className="parallax-p1">
            <svg viewBox="0 0 480 240">
              <use xlinkHref="#p1" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight drop-shadow-2xl">
            <span className="inline-block animate-fade-in opacity-0 [animation-delay:0.2s] [animation-fill-mode:forwards]">
              Building the Future
            </span>
            <br />
            <span className="inline-block bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent animate-fade-in opacity-0 [animation-delay:0.6s] [animation-fill-mode:forwards]">
              with BIM Excellence
            </span>
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl mb-10 max-w-4xl mx-auto text-white drop-shadow-lg animate-fade-in leading-relaxed opacity-0 [animation-delay:0.4s] [animation-fill-mode:forwards]">
            Transform your construction projects with cutting-edge Building Information Modeling solutions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in opacity-0 [animation-delay:0.8s] [animation-fill-mode:forwards]">
            <Link href="/services">
              <Button
                size="lg"
                className="text-lg px-10 py-6 rounded-full bg-white text-primary hover:bg-white/90 shadow-2xl transition-all hover:scale-105 font-semibold"
              >
                Explore Services
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link href="/projects">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 py-6 rounded-full border-2 border-white/40 text-white bg-transparent hover:bg-white/10 hover:border-white/60 backdrop-blur-sm transition-all font-medium"
              >
                View Projects
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default ParallaxHero;
