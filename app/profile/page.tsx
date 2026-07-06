'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Shield, Radio, Volume2, ShieldCheck, Mail, LogOut, ToggleLeft, ToggleRight } from 'lucide-react';
import useAuth from '@/hooks/useAuth';

export default function UserProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  // Notification toggles states
  const [notifyVhf, setNotifyVhf] = useState(true);
  const [notifySms, setNotifySms] = useState(true);
  const [notifyAudio, setNotifyAudio] = useState(true);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const handleSavePreferences = () => {
    alert('Alert communication channels saved successfully.');
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center gap-4 text-center">
        <div className="h-10 w-10 border-4 border-t-cyan-accent border-r-cyan-accent/30 border-b-cyan-accent/20 border-l-cyan-accent/10 rounded-full animate-spin"></div>
        <span className="text-sm font-mono text-cyan-accent">Retrieving security profile...</span>
      </div>
    );
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'System Administrator';
      case 'station_master': return 'Station Master';
      case 'forest_officer': return 'Forest Officer';
      case 'researcher': return 'Scientific Researcher';
      default: return 'Locomotive Pilot (ALP)';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 flex flex-col gap-8">
      
      {/* Title Header */}
      <div className="flex flex-col gap-1 border-b border-cyan-500/10 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <UserIcon className="h-7 w-7 text-cyan-accent" />
          PILOT PROFILE CONSOLE
        </h1>
        <p className="text-xs text-gray-400 font-sans">
          Manage system role scopes, active railway zones, and notification buzzer limits.
        </p>
      </div>

      {/* CORE INFO AND PREFERENCES SPLIT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Avatar & Role */}
        <div className="md:col-span-5 flex flex-col items-center text-center gap-4 glass-card p-8 border border-cyan-500/10 bg-navy-950/20">
          
          {/* Avatar frame */}
          <div className="relative group">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Pilot Avatar'}
                className="h-24 w-24 rounded-full border-2 border-cyan-accent shadow-[0_0_20px_rgba(0,212,255,0.15)] group-hover:scale-102 transition-all"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-navy-800 border-2 border-cyan-accent flex items-center justify-center text-cyan-accent text-3xl font-bold">
                {user.displayName?.charAt(0) || 'P'}
              </div>
            )}
            
            {/* Pulsing online badge */}
            <span className="absolute bottom-1.5 right-1.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-navy-950 pulse-green"></span>
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <h2 className="text-xl font-bold text-white tracking-wide">{user.displayName || 'Authorized User'}</h2>
            <span className="text-xs text-cyan-accent font-semibold font-sans uppercase tracking-wider">{getRoleLabel(user.role)}</span>
          </div>

          {/* Details metadata */}
          <div className="w-full flex flex-col gap-2 mt-4 pt-4 border-t border-cyan-500/5 text-xs text-left font-mono">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Identity Email</span>
              <span className="text-gray-300 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-cyan-accent/60" /> {user.email}
              </span>
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <span className="text-gray-500">Assigned Zone</span>
              <span className="text-gray-300 font-bold">{user.zone || 'Southern Railway (SR)'}</span>
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <span className="text-gray-500">Clearance status</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> SECURED
              </span>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/35 hover:border-red-500/50 rounded-lg text-xs font-bold text-red-400 transition-colors mt-4"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out of Portal
          </button>
        </div>

        {/* Right Column: Preferences config */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider font-mono">
            Caution Dispatch Channels
          </h2>

          <div className="glass-card p-6 border border-cyan-500/10 flex flex-col gap-6 bg-navy-950/20">
            
            {/* VHF Wireless Radio dispatch preference */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-0.5 max-w-md">
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Radio className="h-4 w-4 text-cyan-accent shrink-0" /> VHF Wireless Radio Link
                </span>
                <span className="text-xs text-gray-400 leading-relaxed">
                  Automatically relay critical intrusion warning caution orders to the ALP pilot's cab over the regional VHF wireless frequency.
                </span>
              </div>
              <button 
                onClick={() => setNotifyVhf(!notifyVhf)}
                className="text-cyan-accent hover:text-cyan-400 focus:outline-none shrink-0"
              >
                {notifyVhf ? <ToggleRight className="h-9 w-9" /> : <ToggleLeft className="h-9 w-9 text-gray-600" />}
              </button>
            </div>

            {/* GSM-R SMS alerts */}
            <div className="flex items-start justify-between gap-4 border-t border-cyan-500/5 pt-5">
              <div className="flex flex-col gap-0.5 max-w-md">
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-cyan-accent shrink-0" /> GSM-R SMS Emergency Alerts
                </span>
                <span className="text-xs text-gray-400 leading-relaxed">
                  Dispatch direct cellular network SMS notifications detailing GPS coordinates to ground forest patrol squads and level crossing staff.
                </span>
              </div>
              <button 
                onClick={() => setNotifySms(!notifySms)}
                className="text-cyan-accent hover:text-cyan-400 focus:outline-none shrink-0"
              >
                {notifySms ? <ToggleRight className="h-9 w-9" /> : <ToggleLeft className="h-9 w-9 text-gray-600" />}
              </button>
            </div>

            {/* Audio Buzzer desktop alerts */}
            <div className="flex items-start justify-between gap-4 border-t border-cyan-500/5 pt-5">
              <div className="flex flex-col gap-0.5 max-w-md">
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Volume2 className="h-4 w-4 text-cyan-accent shrink-0" /> Cabin Console Audio Buzzer
                </span>
                <span className="text-xs text-gray-400 leading-relaxed">
                  Trigger an audible alarm buzzer on the dashboard console whenever a critical level 5km collision warning event is registered.
                </span>
              </div>
              <button 
                onClick={() => setNotifyAudio(!notifyAudio)}
                className="text-cyan-accent hover:text-cyan-400 focus:outline-none shrink-0"
              >
                {notifyAudio ? <ToggleRight className="h-9 w-9" /> : <ToggleLeft className="h-9 w-9 text-gray-600" />}
              </button>
            </div>

            {/* Save Action */}
            <div className="border-t border-cyan-500/10 pt-5 mt-2 flex items-center justify-end">
              <button
                onClick={handleSavePreferences}
                className="px-6 py-2.5 bg-cyan-accent hover:bg-cyan-400 text-navy-950 font-bold rounded-lg text-xs transition-all hover:scale-102"
              >
                Save Alarm Preferences
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
