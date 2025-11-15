import Link from "next/link";
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from "lucide-react";

const Footer = () => {
	return (
		<footer
			aria-labelledby="footer-heading"
			className="relative mt-20 text-white"
			style={{
				background: "linear-gradient(180deg, #0a7dce 0%, #0a8ed8 40%, #0a67b3 100%)",
			}}
		>
			{/* subtle pattern overlay */}
			<div
				aria-hidden
				className="absolute inset-0"
				style={{
					backgroundImage:
						'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 40px)',
					mixBlendMode: 'overlay',
					opacity: 0.06,
				}}
			/>

			<div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
				<h2 id="footer-heading" className="sr-only">
					Footer
				</h2>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					<div className="md:max-w-[160px]">
						<img src="/Logo-BIMaided.png" alt="BIMaided logo" className="h-14 w-auto mb-4" />
						<p className="text-base text-white/90">Leading BIM solutions provider delivering excellence worldwide.</p>
					</div>

					<nav aria-label="Quick links" className="mt-6 md:mt-0">
						<h3 className="font-semibold text-lg mb-4">Quick Links</h3>
						<ul className="space-y-2">
							<li>
								<Link href="/services" className="text-base text-white/90 hover:text-white">
									Services
								</Link>
							</li>
							<li>
								<Link href="/projects" className="text-base text-white/90 hover:text-white">
									Projects
								</Link>
							</li>
							<li>
								<Link href="/about" className="text-base text-white/90 hover:text-white">
									About Us
								</Link>
							</li>
							<li>
								<Link href="/career" className="text-base text-white/90 hover:text-white">
									Career
								</Link>
							</li>
						</ul>
					</nav>

					<div className="mt-6 md:mt-0">
						<h3 className="font-semibold text-lg mb-4">Services</h3>
						<ul className="space-y-2 text-base text-white/90">
							<li>BIM Modeling</li>
							<li>Advanced BIM Services</li>
							<li>VDC Services</li>
							<li>Global BIM Services</li>
						</ul>
					</div>

					<div className="md:max-w-[180px] mt-6 md:mt-0">
						<h3 className="font-semibold text-lg mb-4">Contact</h3>
						<div className="space-y-3 text-base text-white/90">
							<div className="flex items-center gap-2">
								<Mail size={16} className="text-white/80" />
								<a href="mailto:info@bimaided.com" className="hover:text-white">
									info@bimaided.com
								</a>
							</div>
							<div className="flex items-start gap-2">
								<Phone size={16} className="text-white/80 mt-1" />
								<div>
									<div>+880 1308-230988</div>
									<div>+880 1672-843230</div>
								</div>
							</div>
							<div className="flex items-start gap-2">
								<MapPin size={16} className="text-white/80 mt-1" />
								<div>House# 7, Level 1, Road 1/B, Dhaka 1229</div>
							</div>
						</div>
					</div>
				</div>

				{/* sitemap for crawlers & users */}
				<div className="mt-10 border-t border-white/10 pt-8">
					<div className="flex flex-col md:flex-row items-center justify-between gap-6">
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-3">
								<a href="/" className="text-white/90 hover:text-white">
									Home
								</a>
								<span className="hidden md:inline-block">•</span>
								<a href="/services" className="text-white/90 hover:text-white">
									Services
								</a>
								<span className="hidden md:inline-block">•</span>
								<a href="/projects" className="text-white/90 hover:text-white">
									Projects
								</a>
								<span className="hidden md:inline-block">•</span>
								<a href="/about" className="text-white/90 hover:text-white">
									About
								</a>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<a
								href="#"
								aria-label="LinkedIn"
								className="text-white/90 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition-colors"
							>
								<Linkedin size={18} />
							</a>
							<a
								href="#"
								aria-label="Twitter"
								className="text-white/90 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition-colors"
							>
								<Twitter size={18} />
							</a>
							<a
								href="#"
								aria-label="Facebook"
								className="text-white/90 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition-colors"
							>
								<Facebook size={18} />
							</a>
						</div>
					</div>

					<p className="mt-6 text-center md:text-right text-white/80 text-sm">
						&copy; {new Date().getFullYear()} BIMaided. All rights reserved. Developed by{' '}
						<a href="https://www.zeelto.com" target="_blank" rel="noopener noreferrer" className="text-white/90 hover:text-white">
							Zeelto
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;

