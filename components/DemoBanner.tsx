'use client';

import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';

export default function DemoBanner() {
  return (
    <div className="bg-gradient-to-r from-amber-600/90 to-amber-700/90 border-b border-amber-500/30 text-white py-2 px-4 text-center text-xs font-medium flex items-center justify-center gap-2 backdrop-blur-md sticky top-0 z-50 shadow-md">
      <AlertTriangle className="h-4 w-4 text-amber-300 animate-pulse shrink-0" />
      <span>
        <strong>DEMO MODE:</strong> All animal sightings and train tracking logs on this platform are sourced from public databases (iNaturalist / GBIF) or simulated for demonstration. No live sensors are deployed on active railway corridors.
      </span>
      <div className="hidden sm:flex items-center gap-3 ml-2 shrink-0">
        <a 
          href="https://www.inaturalist.org" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="underline hover:text-amber-200 flex items-center gap-0.5"
        >
          iNaturalist <ExternalLink className="h-3 w-3" />
        </a>
        <a 
          href="https://www.gbif.org" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="underline hover:text-amber-200 flex items-center gap-0.5"
        >
          GBIF <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
