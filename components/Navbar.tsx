'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from './AuthProvider';

export default function Navbar() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', protected: true },
    { name: 'Alerts', path: '/alerts', protected: true },
    { name: 'Analytics', path: '/analytics', protected: true },
    { name: 'Sensors', path: '/sensors', protected: true },
    { name: 'Trains', path: '/trains', protected: true },
    { name: 'Admin', path: '/admin', protected: true, adminOnly: true },
  ];

  // Filters visible nav items based on user authentication and role
  const visibleNavItems = navItems.filter(item => {
    if (!item.protected) return true;
    if (!user) return false;
    if (item.adminOnly && user.role !== 'admin') return false;
    return true;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'station_master': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'forest_officer': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'researcher': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'station_master': return 'Station Master';
      case 'forest_officer': return 'Forest Officer';
      case 'researcher': return 'Researcher';
      default: return 'ALP/Public';
    }
  };

  return (
    <nav className="glass-card !rounded-none border-t-0 border-x-0 bg-navy-950/80 backdrop-blur-md sticky top-[37px] z-40 px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <Shield className="h-7 w-7 text-cyan-accent group-hover:scale-110 transition-transform" />
          <span className="font-mono text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-accent">
            TRACKGUARD AI
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`text-sm font-medium transition-colors hover:text-cyan-accent relative py-1 ${
                  isActive ? 'text-cyan-accent' : 'text-gray-300'
                }`}
              >
                {item.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-accent glow-cyan rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop Auth and User Profile */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2.5 py-0.5 rounded-full border ${getRoleColor(user.role)} font-mono`}>
                {getRoleLabel(user.role)}
              </span>
              <Link href="/profile" className="flex items-center gap-2 group">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="h-8 w-8 rounded-full border border-cyan-accent/30 group-hover:border-cyan-accent transition-colors"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-navy-800 flex items-center justify-center border border-cyan-accent/30 text-cyan-accent group-hover:border-cyan-accent transition-colors">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-200 group-hover:text-cyan-accent transition-colors">
                  {user.displayName || 'Pilot'}
                </span>
              </Link>
              <button 
                onClick={signOut}
                className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-navy-900 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-950 to-navy-900 border border-cyan-accent/40 rounded-lg text-sm font-semibold hover:border-cyan-accent hover:from-cyan-900 hover:to-navy-850 text-cyan-accent glow-cyan transition-all"
            >
              <LogIn className="h-4 w-4" />
              Portal Access
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="md:hidden flex items-center gap-4">
          {user && (
            <Link href="/profile" className="shrink-0">
              <img 
                src={user.photoURL || ''} 
                alt="Profile" 
                className="h-7 w-7 rounded-full border border-cyan-accent/30"
              />
            </Link>
          )}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-300 hover:text-cyan-accent"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-cyan-500/10 flex flex-col gap-3 pb-2 animate-in slide-in-from-top-3 duration-250">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-cyan-950/40 text-cyan-accent border-l-2 border-cyan-accent' 
                    : 'text-gray-300 hover:bg-navy-900 hover:text-cyan-accent'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          
          <div className="border-t border-cyan-500/10 pt-3 px-3 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Zone: {user.zone || 'None'}</span>
                  <span className="text-sm font-semibold text-gray-200">{user.displayName}</span>
                </div>
                <button 
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1 text-xs text-red-400 hover:underline py-1"
                >
                  <LogOut className="h-4.5 w-4.5" /> Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => {
                  signInWithGoogle();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-cyan-950 to-navy-900 border border-cyan-accent/40 rounded-lg text-sm font-semibold text-cyan-accent hover:border-cyan-accent"
              >
                <LogIn className="h-4 w-4" /> Portal Access
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
