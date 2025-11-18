import Link from "next/link";
import { Mail, Phone, MapPin, Linkedin, Facebook } from "lucide-react";

const Footer = () => {
	return (
		<footer
			aria-labelledby="footer-heading"
			className="relative mt-20 bg-blue-50/50 text-gray-800 border-t border-blue-100"
		>
			<div className="relative z-10 w-full mx-auto px-6 lg:px-12 xl:px-20 py-8">
				<h2 id="footer-heading" className="sr-only">
					Footer
				</h2>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div className="md:max-w-[160px]">
						<img src="/Logo-BIMaided.png" alt="BIMaided logo" className="h-14 w-auto mb-4" />
						<p className="text-base text-gray-600">Leading BIM solutions provider delivering excellence worldwide.</p>
					</div>

					<nav aria-label="Quick links" className="mt-6 md:mt-0">
						<h3 className="font-semibold text-lg mb-4 text-gray-900">Quick Links</h3>
						<ul className="space-y-2">
							<li>
								<Link href="/services" className="text-base text-gray-600 hover:text-sky-600">
									Services
								</Link>
							</li>
							<li>
								<Link href="/projects" className="text-base text-gray-600 hover:text-sky-600">
									Projects
								</Link>
							</li>
							<li>
								<Link href="/about" className="text-base text-gray-600 hover:text-sky-600">
									About Us
								</Link>
							</li>
							<li>
								<Link href="/career" className="text-base text-gray-600 hover:text-sky-600">
									Career
								</Link>
							</li>
						</ul>
					</nav>

					<div className="mt-6 md:mt-0">
						<h3 className="font-semibold text-lg mb-4 text-gray-900">Services</h3>
						<ul className="space-y-2 text-base text-gray-600">
							<li>
								<Link href="/services/bim-modeling" className="hover:text-sky-600">
									BIM Modeling
								</Link>
							</li>
							<li>
								<Link href="/services/advanced-bim" className="hover:text-sky-600">
									Advanced BIM Services
								</Link>
							</li>
							<li>
								<Link href="/services/vdc-services" className="hover:text-sky-600">
									VDC Services
								</Link>
							</li>
							<li>
								<Link href="/services/global-bim" className="hover:text-sky-600">
									Global BIM Services
								</Link>
							</li>
						</ul>
					</div>

					<div className="md:max-w-[220px] mt-6 md:mt-0">
						<h3 className="font-semibold text-lg mb-4 text-gray-900">Contact</h3>
						<div className="space-y-2 text-base text-gray-600">
							<div className="flex items-center gap-2">
								<Mail size={16} className="text-gray-500 flex-shrink-0" />
								<a href="mailto:info@bimaided.com" className="hover:text-sky-600">
									info@bimaided.com
								</a>
							</div>
							<div className="flex items-center gap-2">
								<Phone size={16} className="text-gray-500 flex-shrink-0" />
								<div className="text-sm leading-snug">+880 1308-230988, +880 1672-843230</div>
							</div>
							<div className="flex items-start gap-2">
								<MapPin size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
								<div className="text-sm leading-snug">
									House 7, Level 1, Road 1/B, Nikunjo-2, Dhaka-1229, Bangladesh
								</div>
							</div>
							
							{/* Social Icons */}
							<div className="flex items-center gap-3 pt-2">
								<a
									href="https://linkedin.com/company/bimaided/"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="LinkedIn"
									className="text-gray-600 hover:text-sky-600 bg-gray-100 hover:bg-sky-50 rounded-full p-2 transition-colors"
								>
									<Linkedin size={18} />
								</a>
								<a
									href="https://www.facebook.com/BIMaided/"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Facebook"
									className="text-gray-600 hover:text-sky-600 bg-gray-100 hover:bg-sky-50 rounded-full p-2 transition-colors"
								>
									<Facebook size={18} />
								</a>
							</div>
						</div>
					</div>
				</div>

				{/* sitemap for crawlers & users */}
				<div className="mt-4 border-t border-gray-200 pt-3">
					<div className="flex flex-col md:flex-row items-center justify-center gap-2">
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-3 text-sm">
								<a href="/" className="text-gray-600 hover:text-sky-600">
									Home
								</a>
								<span className="hidden md:inline-block">•</span>
								<a href="/services" className="text-gray-600 hover:text-sky-600">
									Services
								</a>
								<span className="hidden md:inline-block">•</span>
								<a href="/projects" className="text-gray-600 hover:text-sky-600">
									Projects
								</a>
								<span className="hidden md:inline-block">•</span>
								<a href="/about" className="text-gray-600 hover:text-sky-600">
									About
								</a>
							</div>
						</div>
					</div>

					<p className="mt-2 text-center text-gray-500 text-sm">
						&copy; {new Date().getFullYear()} BIMaided. All rights reserved. Developed by{' '}
						<a href="https://www.zeelto.com" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700">
							Zeelto
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;

