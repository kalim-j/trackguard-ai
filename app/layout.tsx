import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import DemoBanner from "@/components/DemoBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap"
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "TrackGuard AI 🛡️ - Railway Animal Intrusion Detection System",
  description: "AI-powered railway animal intrusion detection and alert monitoring dashboard. Early warnings up to 5km protecting every animal on every track.",
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-navy-950 text-gray-100 antialiased`}
      >
        <AuthProvider>
          <DemoBanner />
          <Navbar />
          <main className="min-h-[calc(100vh-100px)]">
            {children}
          </main>
          
          {/* Global Footer */}
          <footer className="border-t border-cyan-500/10 py-6 text-center text-xs text-gray-500 bg-navy-950/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span>© {new Date().getFullYear()} TrackGuard AI. Academic Project.</span>
              <span>CSE Student Project • Rathinam Technical Campus, Coimbatore</span>
              <span className="text-gray-600">No live sensors deployed. Data for demo purposes.</span>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
