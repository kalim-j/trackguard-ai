'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Eye, ShieldAlert, Check, X, ArrowRight, Activity, ChevronDown, Lock } from 'lucide-react';
import Hero3DScene from '@/components/3d/Hero3DScene';
import CanvasErrorBoundary from '@/components/CanvasErrorBoundary';
import { useAuth } from '@/components/AuthProvider';

export default function LandingPage() {
  const { user, signInWithGoogle } = useAuth();

  const stats = [
    { value: '5 KM', label: 'Early Warning Radius' },
    { value: '99.5%', label: 'AI Detection Rate' },
    { value: '1,122', label: 'Route Kms Protected' },
    { value: '24/7', label: 'Automated Pings' },
  ];

  const steps = [
    {
      icon: Eye,
      title: "1. Detect",
      desc: "IoT seismic sensors and thermal camera arrays monitor track vibrations and body heat signatures within a 50m corridor.",
    },
    {
      icon: Activity,
      title: "2. Classify",
      desc: "On-site edge AI processors evaluate data signatures, identifying the animal species, herd size, and proximity vector.",
    },
    {
      icon: ShieldAlert,
      title: "3. Alert",
      desc: "Instant warning notifications and GPS coordinates are transmitted directly to the Locomotive Pilot's cab console.",
    },
  ];

  const comparison = [
    { feature: "Early Warning Distance", trackguard: "Up to 5 km (25x more time)", gajraj: "150 meters", traditional: "Visual range only" },
    { feature: "Multi-Species AI", trackguard: "Yes (Elephants, Big Cats, Cattle, Boars)", gajraj: "Elephants only", traditional: "No" },
    { feature: "ALP Cabin Dashboard", trackguard: "Real-time Hud & Caution advisory", gajraj: "Buzzer alert to station master", traditional: "None" },
    { feature: "Geographic Mapping", trackguard: "3D Digital Twin tracking", gajraj: "Static text grids", traditional: "Manual reports" },
    { feature: "Automated Caution Orders", trackguard: "Yes (Auto speed recommendations)", gajraj: "Manual station call", traditional: "Manual relay" },
  ];

  const coverageAnimals = [
    { name: "Asian Elephant", emoji: "🐘", threat: "Critical", habitat: "Western Ghats & NFR" },
    { name: "Bengal Tiger", emoji: "🐅", threat: "Critical", habitat: "Central Reserves" },
    { name: "Spotted Deer", emoji: "🦌", threat: "High Risk", habitat: "All Corridors" },
    { name: "Indian Leopard", emoji: "🐆", threat: "High Risk", habitat: "Forest Corridors" },
    { name: "Indian Bison", emoji: "🐂", threat: "High Risk", habitat: "Southern Ranges" },
    { name: "Wild Boar", emoji: "🐗", threat: "Moderate", habitat: "All Corridors" },
    { name: "Sloth Bear", emoji: "🐻", threat: "High Risk", habitat: "Rocky Forests" },
    { name: "King Cobra", emoji: "🐍", threat: "Low Risk", habitat: "Dense Undergrowths" },
    { name: "Golden Jackal", emoji: "🦊", threat: "Moderate", habitat: "Corridor Fringes" },
    { name: "Grey Langur", emoji: "🐒", threat: "Moderate", habitat: "Canopy Segments" },
  ];

  return (
    <div className="relative min-h-screen bg-navy-950 text-gray-200">
      
      {/* SECTION 1: HERO VIEWPORT */}
      <section className="relative w-full h-[95vh] flex items-center justify-start overflow-hidden">
        {/* Full Viewport 3D Canvas Background */}
        <CanvasErrorBoundary fallback={<div className="absolute inset-0 bg-navy-950" />}>
          <Hero3DScene />
        </CanvasErrorBoundary>

        {/* Ambient Overlay Vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/80 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-navy-950 to-transparent z-10" />

        {/* Pulsing Live indicator overlay */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full text-red-400 text-xs font-mono font-bold pulse-red">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
          🔴 LIVE CORRIDOR FEED
        </div>

        {/* Hero Landing Text */}
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 w-full z-20 pt-12">
          <div className="max-w-2xl flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-1.5 bg-cyan-950/60 border border-cyan-400/40 text-cyan-accent text-xs font-bold font-mono px-3.5 py-1 rounded-full uppercase tracking-wider glow-cyan">
              <Shield className="h-3.5 w-3.5" />
              AI-Powered Railway Safety
            </span>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Protecting Every Animal. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-cyan-accent">
                On Every Railway Track.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-sans max-w-lg">
              TrackGuard AI monitors forest railway corridors in real time, detecting wildlife intrusions 5km ahead of transit trains. Instantly dispatches automatic cautionary limits to loco pilots to prevent collisions.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <Link 
                href={user ? "/dashboard" : "/auth"}
                className="flex items-center gap-1.5 px-6 py-3 bg-cyan-accent hover:bg-cyan-400 text-navy-950 font-bold rounded-lg text-sm transition-all hover:scale-105 shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)] shrink-0"
              >
                View Live Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              
              <a 
                href="#how-it-works"
                className="px-6 py-3 border border-gray-700 hover:border-gray-500 rounded-lg text-sm font-semibold text-gray-300 hover:text-white transition-colors shrink-0"
              >
                Learn How It Works
              </a>
            </div>

            {/* Stats list */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mt-12 pt-8 border-t border-cyan-500/10 w-full max-w-xl">
              {stats.map((st, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <span className="text-2xl font-bold font-mono text-white">{st.value}</span>
                  <span className="text-[10px] text-gray-500 tracking-wide font-sans">{st.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-[10px] text-gray-500 animate-bounce">
          <span>Scroll Down</span>
          <ChevronDown className="h-4 w-4" />
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 sm:px-8 py-24 border-t border-cyan-500/5">
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <span className="text-xs font-bold text-cyan-accent font-mono uppercase tracking-widest">Architectural Flow</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How TrackGuard AI Protects Wildlife</h2>
          <p className="text-sm text-gray-400 max-w-md font-sans">
            A three-tier early warning system combining physical IoT edge sensors, classification servers, and real-time ALP pilot alerts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((st, index) => {
            const StepIcon = st.icon;
            return (
              <div 
                key={index}
                className="glass-card p-8 border border-cyan-500/10 hover:border-cyan-500/25 transition-all duration-300 flex flex-col gap-4 relative group"
              >
                <div className="h-12 w-12 rounded-lg bg-cyan-950/50 flex items-center justify-center border border-cyan-500/20 text-cyan-accent group-hover:scale-110 transition-transform">
                  <StepIcon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-wide">{st.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">{st.desc}</p>
                
                {/* Visual Connector lines */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-[54px] -right-[22px] w-[44px] h-[1px] border-t border-dashed border-cyan-500/20 z-10" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: COMPARISON MATRIX */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 py-16 border-t border-cyan-500/5">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <span className="text-xs font-bold text-cyan-accent font-mono uppercase tracking-widest">Industry Standard</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Why TrackGuard AI Stands Out</h2>
        </div>

        <div className="glass-card overflow-hidden border border-cyan-500/15">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-cyan-500/15 bg-navy-900/50 text-xs text-gray-400 font-mono tracking-wider">
                  <th className="py-4 px-6 font-semibold">Features</th>
                  <th className="py-4 px-6 font-bold text-cyan-accent">TrackGuard AI 🛡️</th>
                  <th className="py-4 px-6 font-semibold">Gajraj System</th>
                  <th className="py-4 px-6 font-semibold">No System</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/5 text-xs sm:text-sm text-gray-300">
                {comparison.map((row, idx) => (
                  <tr key={idx} className="hover:bg-cyan-950/5 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-200">{row.feature}</td>
                    <td className="py-4 px-6 text-cyan-accent font-semibold">{row.trackguard}</td>
                    <td className="py-4 px-6 text-gray-400">{row.gajraj}</td>
                    <td className="py-4 px-6 text-gray-500">{row.traditional}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Cyan Warning Banner highlight */}
          <div className="bg-cyan-950/40 border-t border-cyan-500/15 p-4 text-center text-xs text-cyan-accent font-medium tracking-wide leading-relaxed">
            🚀 <strong>25x More Warning Time:</strong> TrackGuard dispatches warnings at 5km (approx 3 minutes warning at 100km/h), compared to Gajraj's 150m (approx 5 seconds warning).
          </div>
        </div>
      </section>

      {/* SECTION 4: WILDLIFE ANIMAL COVERAGE */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 py-20 border-t border-cyan-500/5">
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <span className="text-xs font-bold text-cyan-accent font-mono uppercase tracking-widest">Species Protection Scope</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Full Wildlife Protection Matrix</h2>
          <p className="text-sm text-gray-400 max-w-md font-sans">
            AI signatures are modeled for a diverse array of species migrating near forest corridors.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {coverageAnimals.map((animal, i) => (
            <div 
              key={i} 
              className="glass-card p-5 border border-cyan-500/10 hover:border-cyan-500/25 transition-all duration-300 flex flex-col items-center text-center gap-2 group hover:-translate-y-1"
            >
              <span className="text-4xl group-hover:scale-115 transition-transform" title={`${animal.name} Emoji`}>{animal.emoji}</span>
              <span className="text-xs font-bold text-gray-200 mt-1">{animal.name}</span>
              
              <div className="flex items-center gap-1.5 mt-2 w-full justify-between text-[10px] font-mono border-t border-cyan-500/5 pt-2">
                <span className="text-gray-500">Threat:</span>
                <span className={animal.threat === 'Critical' ? 'text-red-400 font-bold' : 'text-amber-400'}>{animal.threat}</span>
              </div>
              <div className="flex items-center gap-1.5 w-full justify-between text-[10px] font-mono">
                <span className="text-gray-500">Zone:</span>
                <span className="text-gray-400">{animal.habitat}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: ACCREDITATION & DISCLOSURE */}
      <section className="bg-navy-900/40 border-y border-cyan-500/5 py-16 text-center">
        <div className="max-w-4xl mx-auto px-6 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-white tracking-wide uppercase">About Our Data & Sources</h3>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-sans">
            Animal sighting locations and species lists featured on this dashboard are retrieved from public biodiversity data aggregates provided by the <strong className="text-gray-200">iNaturalist Observation API</strong> and the <strong className="text-gray-200">Global Biodiversity Information Facility (GBIF) API</strong>, along with historical accident reports from the <strong className="text-gray-200">Wildlife Institute of India (WII)</strong>. 
          </p>
          <div className="text-xs text-amber-400/90 font-medium bg-amber-500/5 border border-amber-500/15 py-3.5 px-5 rounded-lg max-w-xl mx-auto leading-relaxed">
            ℹ️ This is an academic research demonstration built by a Computer Science Engineering student. No actual physical IoT sensory poles are installed on operational Indian Railways tracks.
          </div>
          <div className="flex items-center justify-center gap-6 text-xs font-semibold text-cyan-accent">
            <a href="https://www.inaturalist.org" target="_blank" rel="noopener noreferrer" className="hover:underline">iNaturalist Database</a>
            <a href="https://www.gbif.org" target="_blank" rel="noopener noreferrer" className="hover:underline">GBIF occurrence API</a>
          </div>
        </div>
      </section>

      {/* SECTION 6: CTA TO ACCESS PORTAL */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 py-24 flex flex-col items-center">
        <div className="glass-card p-12 max-w-2xl w-full border border-cyan-500/20 text-center flex flex-col items-center gap-6 shadow-[0_0_35px_rgba(0,212,255,0.06)] relative overflow-hidden">
          
          {/* Subtle light background pulse */}
          <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-cyan-500/5 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-cyan-500/5 blur-3xl" />

          <Shield className="h-10 w-10 text-cyan-accent animate-pulse shrink-0" />
          
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Access the Control Room</h2>
            <p className="text-xs sm:text-sm text-gray-400 font-sans max-w-md mx-auto leading-relaxed">
              Log in with your Google account to access the real-time train positions monitor, early warnings logs, analytics, and sensor health nodes.
            </p>
          </div>

          {user ? (
            <div className="flex flex-col items-center gap-4">
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Logged in as: {user.displayName} ({user.role})
              </span>
              <Link
                href="/dashboard"
                className="px-8 py-3.5 bg-cyan-accent hover:bg-cyan-400 text-navy-950 font-bold rounded-lg text-sm transition-all hover:scale-105 shadow-[0_0_20px_rgba(0,212,255,0.2)]"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={signInWithGoogle}
                className="flex items-center justify-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-cyan-950 to-navy-900 border border-cyan-accent/50 rounded-lg text-sm font-bold text-cyan-accent hover:border-cyan-accent glow-cyan transition-all hover:scale-103"
              >
                Continue with Google
              </button>
              <span className="text-[10px] text-gray-500 font-sans tracking-wide max-w-xs leading-normal">
                By logging in you agree to our terms. Sighting locations and early warnings are simulated for demonstration.
              </span>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
