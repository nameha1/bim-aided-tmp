import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-cyan-900 via-cyan-800 to-cyan-900 border-t border-sky-500/20 mt-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 bg-grid-pattern" />
      
      {/* Gradient Overlays */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-sky-500/10 to-transparent" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
      <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img 
              src="/Logo-BIMaided.png" 
              alt="BIM aided Logo" 
              className="h-16 w-auto mb-4"
            />
            <p className="text-sm text-gray-300">
              Leading BIM solutions provider delivering excellence in Building Information Modeling services worldwide.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link href="/services" className="text-sm text-gray-300 hover:text-sky-400 transition-colors">
                Services
              </Link>
              <Link href="/projects" className="text-sm text-gray-300 hover:text-sky-400 transition-colors">
                Projects
              </Link>
              <Link href="/about" className="text-sm text-gray-300 hover:text-sky-400 transition-colors">
                About Us
              </Link>
              <Link href="/career" className="text-sm text-gray-300 hover:text-sky-400 transition-colors">
                Career
              </Link>
              <Link href="/contact" className="text-sm text-gray-300 hover:text-sky-400 transition-colors">
                Contact
              </Link>
              <Link href="/login" className="text-sm text-gray-300 hover:text-sky-400 transition-colors">
                Employee Portal
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Services</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-300">
              <span>BIM Modeling</span>
              <span>Advanced BIM Services</span>
              <span>VDC Services</span>
              <span>Global BIM Services</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Contact</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2 text-sm text-gray-300">
                <Mail size={16} className="text-sky-400 mt-0.5 flex-shrink-0" />
                <span>info@bimaided.com</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-300">
                <Phone size={16} className="text-sky-400 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <span className="whitespace-nowrap">+880 1308-230988</span>
                  <span className="whitespace-nowrap">+880 1672-843230</span>
                  <span className="whitespace-nowrap">+880 1737-727342</span>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-300">
                <MapPin size={16} className="text-sky-400 mt-0.5 flex-shrink-0" />
                <span className="break-words">House# 7, Level 1, Road 1/B, Dhaka 1229</span>
              </div>
              <div className="text-sm text-gray-300 mt-2">
                <p className="font-medium text-white">Open: Saturday-Thursday</p>
                <p>Time: 8:00 am – 9:00 pm</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-sky-500/20 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} BIMaided. All rights reserved.</p>
          <p className="mt-2">
            Developed by{" "}
            <a 
              href="https://www.zeelto.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 transition-colors"
            >
              Zeelto
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
