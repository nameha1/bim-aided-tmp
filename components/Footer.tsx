import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img 
              src="/Logo-BIMaided.png" 
              alt="BIMaided Logo" 
              className="h-16 w-auto mb-4"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <h3 className="text-xl font-bold text-primary mb-4 hidden">BIMaided</h3>
            <p className="text-sm text-muted-foreground">
              Leading BIM solutions provider delivering excellence in Building Information Modeling services worldwide.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link href="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Services
              </Link>
              <Link href="/projects" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Projects
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
              <Link href="/career" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Career
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Employee Portal
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span>BIM Modeling</span>
              <span>Advanced BIM Services</span>
              <span>VDC Services</span>
              <span>Global BIM Services</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Mail size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <span>info@bimaided.com</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Phone size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <span>+880 1308-230988</span>
                  <span>+880 1672-843230</span>
                  <span>+880 1737-727342</span>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <span>ECB, Dhaka Cantonment, Dhaka-1206, Bangladesh</span>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                <p className="font-medium text-foreground">Open: Saturday-Thursday</p>
                <p>Time: 8:00 am – 9:00 pm</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BIMaided. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
