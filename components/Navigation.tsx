import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", path: "/" },
    { 
      name: "Services", 
      path: "/services",
      hasSubmenu: true,
      submenu: [
        { name: "BIM Modeling", path: "/services/bim-modeling", description: "3D modeling for Architecture, Structure & MEP" },
        { name: "Advanced BIM", path: "/services/advanced-bim", description: "Clash detection & 4D/5D simulation" },
        { name: "VDC Services", path: "/services/vdc-services", description: "Virtual design & construction planning" },
        { name: "Global BIM", path: "/services/global-bim", description: "International BIM coordination" },
      ]
    },
    { name: "Projects", path: "/projects" },
    { name: "About Us", path: "/about" },
    { name: "Career", path: "/career" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed w-full top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img 
              src="/Logo-BIMaided.png" 
              alt="BIMaided Logo" 
              className="h-14 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="text-2xl font-bold text-primary hidden">BIMaided</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.hasSubmenu ? (
                <div 
                  key={link.path}
                  className="relative group"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <Link
                    href={link.path}
                    className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                      isActive(link.path) || link.submenu?.some(sub => isActive(sub.path))
                        ? "text-primary"
                        : "text-foreground/70"
                    }`}
                  >
                    {link.name}
                    <ChevronDown className="h-4 w-4" />
                  </Link>
                  
                  {/* Mega Menu Dropdown */}
                  {servicesOpen && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[90vw] max-w-[600px] z-50">
                      <div className="bg-background border border-border rounded-lg shadow-xl p-6">
                        <div className="grid grid-cols-2 gap-4">
                          {link.submenu?.map((sublink) => (
                            <Link
                              key={sublink.path}
                              href={sublink.path}
                              className={`p-4 rounded-lg transition-colors ${
                                isActive(sublink.path)
                                  ? "bg-primary/10 text-primary"
                                  : "hover:bg-primary/5"
                              }`}
                            >
                              <div className="font-semibold mb-1 text-foreground">{sublink.name}</div>
                              <div className="text-sm text-muted-foreground">{sublink.description}</div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(link.path) ? "text-primary" : "text-foreground/70"
                  }`}
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                link.hasSubmenu ? (
                  <div key={link.path} className="flex flex-col gap-2">
                    <Link
                      href={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        isActive(link.path) ? "text-primary" : "text-foreground/70"
                      }`}
                    >
                      {link.name}
                    </Link>
                    <div className="pl-4 flex flex-col gap-2">
                      {link.submenu?.map((sublink) => (
                        <Link
                          key={sublink.path}
                          href={sublink.path}
                          onClick={() => setIsOpen(false)}
                          className={`text-sm transition-colors hover:text-primary ${
                            isActive(sublink.path) ? "text-primary" : "text-foreground/60"
                          }`}
                        >
                          {sublink.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      isActive(link.path) ? "text-primary" : "text-foreground/70"
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
