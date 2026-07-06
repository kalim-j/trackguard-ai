'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Radio, AlertCircle, Plus, Info, Battery, Signal, Clock, ShieldCheck } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { getTrackCoordinate } from '@/lib/trackUtils';
import { Sensor } from '@/lib/types';
import SensorGrid from '@/components/dashboard/SensorGrid';

// Dynamically load leaflet 2D map to prevent SSR crashes
const FallbackMap2D = dynamic(() => import('@/components/dashboard/FallbackMap2D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[350px] bg-navy-900 border border-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-accent text-xs font-mono">
      Loading Sensor Location Matrix...
    </div>
  )
});

export default function SensorsConsolePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Selected sensor state for history lookup panel
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  // Generate 18 sensors coordinate and stats maps
  const sensors: Sensor[] = useMemo(() => {
    const list = [];
    for (let i = 0; i < 18; i++) {
      const km = (200 / 17) * i;
      const code = `TG-MAS-${String(Math.floor(km)).padStart(3, '0')}`;
      const coords = getTrackCoordinate(km);
      
      let status: Sensor['status'] = 'active';
      if (km > 50 && km < 60) status = 'maintenance';
      else if (km > 170 && km < 185) status = 'offline';

      list.push({
        id: `sensor-${i}`,
        sensor_code: code,
        km_marker: parseFloat(km.toFixed(1)),
        latitude: parseFloat(coords.lat.toFixed(4)),
        longitude: parseFloat(coords.lng.toFixed(4)),
        zone: 'SR',
        route: 'Chennai-Salem Corridor',
        status,
        battery_level: status === 'offline' ? 0 : 96 - (i % 3) * 6,
        signal_strength: status === 'offline' ? 0 : 95 - (i % 2) * 5,
        sensor_type: 'thermal+vibration',
        installed_at: new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString(),
        last_ping: new Date(Date.now() - (status === 'offline' ? 450 * 60000 : 30 * 1000)).toISOString()
      });
    }
    return list;
  }, []);

  // Filter offline sensors for top warning banner list
  const offlineSensors = sensors.filter(s => s.status === 'offline');
  const maintenanceSensors = sensors.filter(s => s.status === 'maintenance');

  // Handle sensor details slide-out select
  const handleSelectSensor = (sensor: Sensor) => {
    setSelectedSensor(sensor);
  };

  const getStatusColor = (status: Sensor['status']) => {
    switch (status) {
      case 'alert': return 'text-red-400';
      case 'maintenance': return 'text-amber-400';
      case 'offline': return 'text-gray-400';
      default: return 'text-emerald-400';
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center gap-4 text-center">
        <div className="h-10 w-10 border-4 border-t-cyan-accent border-r-cyan-accent/30 border-b-cyan-accent/20 border-l-cyan-accent/10 rounded-full animate-spin"></div>
        <span className="text-sm font-mono text-cyan-accent">Checking credentials...</span>
      </div>
    );
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
      
      {/* Title Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Radio className="h-7 w-7 text-cyan-accent" />
          IoT SENSOR MANAGEMENT NETWORK
        </h1>
        <p className="text-xs text-gray-400 font-sans">
          Health logs, signal diagnostics, and battery levels for the 18 active thermal/vibration nodes.
        </p>
      </div>

      {/* OFFLINE & MAINTENANCE WARNING NOTICE BANNERS */}
      {(offlineSensors.length > 0 || maintenanceSensors.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offlineSensors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-red-400 font-mono uppercase tracking-wider">OFFLINE HARDWARE SENSORS ALERT</span>
                <span className="text-[11px] text-gray-300">
                  {offlineSensors.map(s => s.sensor_code).join(', ')} failed to ping. Batteries depletion or wiring severance suspected. Dispatched ground team.
                </span>
              </div>
            </div>
          )}

          {maintenanceSensors.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider">ROUTINE MAINTENANCE SCHEDULED</span>
                <span className="text-[11px] text-gray-300">
                  {maintenanceSensors.map(s => s.sensor_code).join(', ')} require solar panel scraping and calibration checks. Target completion: 48 hours.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CORE DISPLAY (2D GEO MAP & DETAIL SLIDE OUT PANEL) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Location map */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider font-mono">
            Sensor Grid Locations
          </h2>
          <div className="h-[350px]">
            <FallbackMap2D trains={[]} animals={[]} sensors={sensors} />
          </div>
        </div>

        {/* Right Column: Dynamic sensor details panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider font-mono">
            Active Node Inspector
          </h2>

          {selectedSensor ? (
            <div className="glass-card p-6 border border-cyan-500/20 flex flex-col gap-5 bg-navy-950/20 relative animate-in fade-in duration-200">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-cyan-500/10 pb-3">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 font-mono">CODE ID</span>
                  <span className="text-base font-extrabold font-mono text-white">{selectedSensor.sensor_code}</span>
                </div>
                <span className={`text-xs font-bold uppercase ${getStatusColor(selectedSensor.status)} font-mono`}>
                  {selectedSensor.status}
                </span>
              </div>

              {/* Geographical Coordinates */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-500">Km Marker</span>
                  <span className="text-gray-200 font-bold">Km {selectedSensor.km_marker}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-500">Route Zone</span>
                  <span className="text-gray-200">SR / {selectedSensor.zone}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-500">Latitude</span>
                  <span className="text-gray-300">{selectedSensor.latitude}°N</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-500">Longitude</span>
                  <span className="text-gray-300">{selectedSensor.longitude}°E</span>
                </div>
              </div>

              {/* Hardware diagnostics */}
              <div className="flex flex-col gap-3 bg-navy-950/50 p-4 rounded-xl border border-cyan-500/5">
                <span className="text-[10px] font-bold text-gray-400 font-mono tracking-wider uppercase">TELEMETRY DIAGNOSTICS</span>
                
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Battery className="h-4 w-4" /> Battery
                  </span>
                  <span className={selectedSensor.battery_level < 20 ? 'text-red-400 font-bold' : 'text-gray-200'}>
                    {selectedSensor.battery_level}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Signal className="h-4 w-4" /> Signal Strength
                  </span>
                  <span className="text-gray-200">{selectedSensor.signal_strength} dBm</span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Clock className="h-4 w-4" /> Last Ping Received
                  </span>
                  <span className="text-gray-300 text-[11px]">
                    {new Date(selectedSensor.last_ping).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Sighting event history logs */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-gray-400 font-mono tracking-wider uppercase">PAST sightings INDEX</span>
                <div className="text-xs text-gray-400 leading-normal italic py-1 border-t border-cyan-500/5">
                  {selectedSensor.status === 'alert' 
                    ? "⚠️ [ALERT CURRENTLY ACTIVE] Intruding herd nearby." 
                    : selectedSensor.status === 'offline'
                    ? "❌ [OFFLINE] Diagnostics link severed."
                    : "✔️ No animal intrusion triggers logged in the past 24 hours."}
                </div>
              </div>

              {/* Close detail inspector button */}
              <button 
                onClick={() => setSelectedSensor(null)}
                className="w-full text-center text-xs text-gray-500 hover:text-cyan-accent py-2 transition-colors border-t border-cyan-500/10 font-medium"
              >
                Close Inspector
              </button>
            </div>
          ) : (
            <div className="glass-card p-8 border border-cyan-500/10 text-center flex flex-col items-center justify-center gap-2 h-full min-h-[220px]">
              <Info className="h-8 w-8 text-gray-600" />
              <h3 className="font-semibold text-gray-400 text-sm mt-1">Select a Sensor Node</h3>
              <p className="text-xs text-gray-500 max-w-[220px]">Click on any sensor in the grid or map below to pull full signal battery diagnostic readouts.</p>
            </div>
          )}
        </div>

      </div>

      {/* CORE SENSORS GRID GRID */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider font-mono">
            Grid Log Directory ({sensors.length} Nodes)
          </h2>

          {/* Add sensor button - Admin only */}
          {isAdmin ? (
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-accent text-navy-950 rounded-lg text-xs font-bold transition-all hover:scale-103 shadow-[0_0_15px_rgba(0,212,255,0.2)]">
              <Plus className="h-4 w-4" />
              Deploy New Node
            </button>
          ) : (
            <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" /> Admin Configuration Locked
            </span>
          )}
        </div>

        <SensorGrid sensors={sensors} onSelectSensor={handleSelectSensor} />
      </div>

    </div>
  );
}
