import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

const roboto = Roboto({
  weight: ['400', '700', '900'],
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: "BIMaided - Creating Excellence",
  description: "BIMaided official website - Creating Excellence in BIM Services",
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  // Performance optimizations
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://bimaided.com'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/Logo-BIMaided.png" as="image" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="dns-prefetch" href="https://firebase.googleapis.com" />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://firebase.googleapis.com" />
      </head>
      <body className={`${inter.className} ${roboto.variable} overflow-x-hidden`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
