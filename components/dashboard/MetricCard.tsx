'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtext: string;
  glowColor?: 'cyan' | 'red' | 'green' | 'yellow';
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
  subtext,
  glowColor = 'cyan'
}: MetricCardProps) {
  const getGlowClass = () => {
    switch (glowColor) {
      case 'red': return 'border-red-500/20 hover:border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.03)] hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]';
      case 'green': return 'border-emerald-500/20 hover:border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.03)] hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]';
      case 'yellow': return 'border-amber-500/20 hover:border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.03)] hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]';
      default: return 'border-cyan-500/12 hover:border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.03)] hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]';
    }
  };

  const getIconColor = () => {
    switch (glowColor) {
      case 'red': return 'text-red-400';
      case 'green': return 'text-emerald-400';
      case 'yellow': return 'text-amber-400';
      default: return 'text-cyan-accent';
    }
  };

  return (
    <div className={`glass-card p-6 flex flex-col gap-2 transition-all duration-300 border ${getGlowClass()}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-400 tracking-wide font-sans">{title}</span>
        <Icon className={`h-5 w-5 ${getIconColor()} shrink-0`} />
      </div>
      
      <div className="flex flex-col gap-0.5 mt-1">
        <span className="text-3xl font-bold font-mono tracking-tight text-white">{value}</span>
        <span className="text-xs text-gray-500 font-sans tracking-wide leading-relaxed">{subtext}</span>
      </div>
    </div>
  );
}
