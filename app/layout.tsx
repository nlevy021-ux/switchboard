// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Switchboard - Find the Perfect AI Tool for Your Task",
  description: "Switchboard helps you find the perfect AI tool for any task. Route your requests to the right AI platform, manage projects, and discover workflows that streamline your work.",
  keywords: ["AI tool finder", "AI router", "AI workflow planner", "best AI tool", "AI tool discovery"],
  authors: [{ name: "Switchboard" }],
  openGraph: {
    title: "Switchboard - Find the Perfect AI Tool for Your Task",
    description: "Route your requests to the right AI platform and discover workflows that streamline your work.",
    type: "website",
    siteName: "Switchboard",
  },
  twitter: {
    card: "summary_large_image",
    title: "Switchboard - Find the Perfect AI Tool for Your Task",
    description: "Route your requests to the right AI platform and discover workflows that streamline your work.",
  },
  icons: {
    icon: "/images/logo1.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="w-full border-b-2 border-blue-500/30 relative overflow-hidden" style={{ backgroundColor: '#0a0a06' }}>
          {/* Subtle circuit board pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `
              linear-gradient(rgba(96, 165, 250, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(96, 165, 250, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}></div>
          
          {/* Connection line */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500 opacity-30"></div>
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              {/* Logo and Title */}
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0 relative" style={{ width: 'auto', height: '100%' }}>
                  <Image 
                    src="/images/logo1.png" 
                    alt="Switchboard Logo" 
                    width={80}
                    height={80}
                    className="h-10 sm:h-14 md:h-16 lg:h-20 w-auto object-contain"
                    unoptimized
                  />
                </div>
                <Link 
                  href="/" 
                  className="font-bold text-lg sm:text-xl md:text-2xl text-white hover:text-blue-400 transition-colors"
                >
                  Switchboard
                </Link>
              </div>
              
              {/* Navigation with connection lines */}
              <nav className="flex items-center gap-6 sm:gap-8">
                <div className="flex items-center gap-6 sm:gap-8">
                  <Link 
                    href="/" 
                    className="text-sm sm:text-base font-medium text-gray-300 hover:text-blue-400 transition-colors relative group"
                  >
                    <span className="relative z-10">Home</span>
                    {/* Connection line on hover */}
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                  <Link 
                    href="/projects" 
                    className="text-sm sm:text-base font-medium text-gray-300 hover:text-blue-400 transition-colors relative group"
                  >
                    <span className="relative z-10">Projects</span>
                    {/* Connection line on hover */}
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </div>
                {/* Status indicator dots - interactive */}
                <div className="hidden sm:flex items-center gap-2 ml-4 pl-4 border-l border-gray-700">
                  <div className="group relative">
                    <div className="w-2 h-2 bg-green-500 rounded-full opacity-80 cursor-pointer hover:opacity-100 hover:scale-125 transition-all animate-pulse"></div>
                    <div className="absolute right-0 top-6 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded border border-gray-700">
                      System Online
                    </div>
                  </div>
                  <div className="group relative">
                    <div className="w-2 h-2 bg-blue-500 rounded-full opacity-80 cursor-pointer hover:opacity-100 hover:scale-125 transition-all"></div>
                    <div className="absolute right-0 top-6 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded border border-gray-700">
                      AI Models Connected
                    </div>
                  </div>
                  <div className="group relative">
                    <div className="w-2 h-2 bg-purple-500 rounded-full opacity-80 cursor-pointer hover:opacity-100 hover:scale-125 transition-all"></div>
                    <div className="absolute right-0 top-6 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded border border-gray-700">
                      Routing Active
                    </div>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </header>
        {children}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
