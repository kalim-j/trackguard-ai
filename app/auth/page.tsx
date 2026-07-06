'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ShieldAlert, CheckSquare } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import Hero3DScene from '@/components/3d/Hero3DScene';
import CanvasErrorBoundary from '@/components/CanvasErrorBoundary';

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center gap-4 text-center">
        <div className="h-10 w-10 border-4 border-t-cyan-accent border-r-cyan-accent/30 border-b-cyan-accent/20 border-l-cyan-accent/10 rounded-full animate-spin"></div>
        <span className="text-sm font-mono text-cyan-accent">Verifying Security Credentials...</span>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-100px)] flex items-center justify-center overflow-hidden">
      {/* 3D Cinematic Background */}
      <CanvasErrorBoundary fallback={<div className="absolute inset-0 bg-navy-950" />}>
        <Hero3DScene />
      </CanvasErrorBoundary>
      
      {/* Dark Vignette Overlay */}
      <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-xs z-10" />

      {/* Central Glass Card */}
      <div className="relative z-20 glass-card p-8 sm:p-10 max-w-md w-full border border-cyan-500/25 flex flex-col items-center text-center gap-6 shadow-[0_0_40px_rgba(0,212,255,0.08)] mx-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2 group">
          <Shield className="h-8 w-8 text-cyan-accent" />
          <span className="font-mono text-xl font-bold tracking-wider text-white">TRACKGUARD AI</span>
        </div>

        {/* Hero Title */}
        <div className="flex flex-col gap-1.5 mt-2">
          <h2 className="text-xl font-bold text-gray-100">Monitor. Detect. Protect.</h2>
          <p className="text-xs text-gray-400 font-sans leading-relaxed">
            Authorized access only. Sign in to enter the railway wildlife warning and monitoring console.
          </p>
        </div>

        {/* Bullet features list */}
        <div className="w-full flex flex-col gap-2.5 bg-navy-950/50 rounded-xl p-4 border border-cyan-500/5 text-left text-xs text-gray-300">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-cyan-accent shrink-0" />
            <span>Real-time train positioning maps</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-cyan-accent shrink-0" />
            <span>5km proximity collision alerts feed</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-cyan-accent shrink-0" />
            <span>Thermal solar sensor health diagnostics</span>
          </div>
        </div>

        {/* Continue with Google Button */}
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-cyan-950 to-navy-900 border border-cyan-accent/50 rounded-lg text-sm font-bold text-cyan-accent hover:border-cyan-accent glow-cyan transition-all hover:scale-102"
        >
          {/* Custom Google logo symbol */}
          <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24" width="24" height="24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        {/* Terms disclosure */}
        <div className="flex flex-col gap-1.5 mt-2">
          <p className="text-[10px] text-gray-500 font-sans leading-normal">
            By signing in, you agree to access console data in compliance with railway safety protocols.
          </p>
          <span className="text-[10px] text-amber-500/80 font-mono font-medium flex items-center justify-center gap-1">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            Student project — simulated database mode.
          </span>
        </div>

      </div>
    </div>
  );
}
