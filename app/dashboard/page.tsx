'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Shield, ShieldAlert, Radio, Train, Activity, RefreshCw, Layers } from 'lucide-react';

import useAuth from '@/hooks/useAuth';
import useTrainPositions from '@/hooks/useTrainPositions';
import useAnimalDetections from '@/hooks/useAnimalDetections';
import useLiveAlerts from '@/hooks/useLiveAlerts';
import { getTrackCoordinate } from '@/lib/trackUtils';

import MetricCard from '@/components/dashboard/MetricCard';
import AlertFeed from '@/components/dashboard/AlertFeed';
import TrainTable from '@/components/dashboard/TrainTable';
import SensorGrid from '@/components/dashboard/SensorGrid';
import { Sensor } from '@/lib/types';

// Dynamically import 3D track scene to prevent SSR issues (WebGL relies on browser context)
const TrackScene3D = dynamic(() => import('@/components/3d/TrackScene3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-navy-900 border border-cyan-500/10 rounded-2xl flex flex-col items-center justify-center gap-3 text-cyan-accent text-xs font-mono">
      <div className="h-8 w-8 border-2 border-t-cyan-accent border-r-cyan-accent/30 border-b-cyan-accent/20 border-l-cyan-accent/10 rounded-full animate-spin"></div>
      Loading 3D Digital Twin environment...
    </div>
  )
});

// Dynamically import 2D leaflet map to prevent SSR window reference crashes
const FallbackMap2D = dynamic(() => import('@/components/dashboard/FallbackMap2D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[350px] bg-navy-900 border border-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-accent text-xs font-mono">
      Loading 2D Map Layer...
    </div>
  )
});

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Custom Hooks
  const { trains, alerts: rawAlerts, loading: trainsLoading, lastUpdated, refresh: refreshTrains } = useTrainPositions();
  const { detections, loading: animalsLoading, refresh: refreshAnimals } = useAnimalDetections();
  const { alerts: liveAlerts, resolveAlert, refresh: refreshLiveAlerts } = useLiveAlerts();

  // Local state for UI toggles
  const [mapMode, setMapMode] = useState<'3d' | '2d'>('3d');
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  // Keep track of last-updated seconds timer
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      setSecondsAgo(diff);
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  // Generate 18 solar-powered sensor nodes geographical data
  const sensors: Sensor[] = useMemo(() => {
    const list = [];
    for (let i = 0; i < 18; i++) {
      const km = (200 / 17) * i;
      const code = `TG-MAS-${String(Math.floor(km)).padStart(3, '0')}`;
      const coords = getTrackCoordinate(km);
      
      // Determine simulated statuses matching trackScene3D
      let status: Sensor['status'] = 'active';
      if (km > 50 && km < 60) status = 'maintenance';
      else if (km > 170 && km < 185) status = 'offline';

      // Check if this sensor is currently under intrusion alert
      const hasAlert = liveAlerts.some(alert => {
        const alertKm = alert.animal_detections?.km_marker;
        if (alertKm === undefined) return false;
        return Math.abs(alertKm - km) < 15;
      });

      if (hasAlert) {
        status = 'alert';
      }
      
      list.push({
        id: `sensor-${i}`,
        sensor_code: code,
        km_marker: parseFloat(km.toFixed(1)),
        latitude: parseFloat(coords.lat.toFixed(4)),
        longitude: parseFloat(coords.lng.toFixed(4)),
        zone: 'SR',
        route: 'Chennai-Salem Corridor',
        status,
        battery_level: status === 'offline' ? 0 : 98 - (i % 3) * 6,
        signal_strength: status === 'offline' ? 0 : 95 - (i % 2) * 4,
        sensor_type: 'thermal+vibration',
        installed_at: new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString(),
        last_ping: new Date(Date.now() - (status === 'offline' ? 450 * 60000 : 30 * 1000)).toISOString()
      });
    }
    return list;
  }, [liveAlerts]);

  // Handle manual alerts
  const handleTriggerManualAlert = async (train: any) => {
    alert(`Caution order dispatched to Train ${train.train_number} (${train.train_name}). ALP notified via VHF Wireless.`);
  };

  // Resolve an alert
  const handleResolveAlert = async (alertId: string, isFalseAlarm: boolean) => {
    const res = await resolveAlert(alertId, user?.dbId, isFalseAlarm, isFalseAlarm ? 'Marked as false alarm.' : 'Intrusion cleared.');
    if (res) {
      refreshAnimals();
      refreshTrains();
    }
  };

  const handleManualRefresh = () => {
    refreshTrains();
    refreshAnimals();
    refreshLiveAlerts();
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center gap-4 text-center">
        <div className="h-10 w-10 border-4 border-t-cyan-accent border-r-cyan-accent/30 border-b-cyan-accent/20 border-l-cyan-accent/10 rounded-full animate-spin"></div>
        <span className="text-sm font-mono text-cyan-accent">Checking credentials...</span>
      </div>
    );
  }

  // Determine if using real live APIs or simulated fallback
  const isLiveApi = trains.some(t => t.api_source !== 'mock');
  const onlineSensors = sensors.filter(s => s.status === 'active' || s.status === 'alert').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
      
      {/* Top Title & Badges Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Shield className="h-7 w-7 text-cyan-accent" />
            CONTROL ROOM DASHBOARD
          </h1>
          <p className="text-xs text-gray-400 font-sans">
            Early intrusion warnings for Chennai-Salem Rail Corridor.
          </p>
        </div>

        {/* Live Status Indicators */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* API badge */}
          <span className={`text-[10px] font-bold font-mono px-3 py-1 rounded-full border flex items-center gap-1.5 ${
            isLiveApi 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isLiveApi ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
            {isLiveApi ? '🟢 LIVE RAIL API' : '🟡 DEMO RAIL DATA'}
          </span>

          {/* iNat badge */}
          <span className="text-[10px] font-bold font-mono bg-cyan-950/60 text-cyan-accent border border-cyan-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
            📍 iNaturalist + Seed Data
          </span>

          {/* Refresh Action */}
          <button 
            onClick={handleManualRefresh}
            className="flex items-center gap-1 text-[10px] font-bold font-mono bg-navy-900 border border-gray-700 hover:border-cyan-accent hover:text-cyan-accent text-gray-400 px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            <RefreshCw className="h-3 w-3 shrink-0" />
            <span>Updated {secondsAgo}s ago</span>
          </button>
        </div>
      </div>

      {/* METRIC OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="ACTIVE WARNINGS"
          value={liveAlerts.length}
          icon={ShieldAlert}
          subtext="Unresolved intrusions near tracks"
          glowColor={liveAlerts.length > 0 ? 'red' : 'green'}
        />
        <MetricCard
          title="RUNNING TRAINS"
          value={trains.length}
          icon={Train}
          subtext="Monitored on Salem corridor"
          glowColor="cyan"
        />
        <MetricCard
          title="SENSOR NETWORK HEALTH"
          value={`${onlineSensors}/${sensors.length}`}
          icon={Radio}
          subtext={`${Math.floor((onlineSensors / sensors.length) * 100)}% online nodes`}
          glowColor={onlineSensors === sensors.length ? 'green' : 'yellow'}
        />
        <MetricCard
          title="ANIMAL INTRUSIONS"
          value={detections.filter(d => d.status === 'active').length}
          icon={Activity}
          subtext="Confirmed species occurrences"
          glowColor={detections.length > 0 ? 'yellow' : 'cyan'}
        />
      </div>

      {/* DIGITAL TWIN / MAP SECTION */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider font-mono">
            Spatial Early Warning Visualization
          </h2>
          
          {/* Map view toggle */}
          <div className="flex items-center bg-navy-900 border border-gray-800 rounded-lg p-0.5 z-10">
            <button
              onClick={() => setMapMode('3d')}
              className={`flex items-center gap-1 px-3 py-1 text-[11px] font-semibold font-mono rounded ${
                mapMode === '3d' ? 'bg-cyan-accent text-navy-950' : 'text-gray-400 hover:text-white'
              }`}
            >
              3D Digital Twin
            </button>
            <button
              onClick={() => setMapMode('2d')}
              className={`flex items-center gap-1 px-3 py-1 text-[11px] font-semibold font-mono rounded ${
                mapMode === '2d' ? 'bg-cyan-accent text-navy-950' : 'text-gray-400 hover:text-white'
              }`}
            >
              2D Mapping
            </button>
          </div>
        </div>

        {/* Map Rendering Container */}
        {/* On desktop screens we render based on selection, on screens < 768px we automatically force 2D map for performance! */}
        <div className="w-full">
          <div className="hidden md:block">
            {mapMode === '3d' ? (
              <div className="h-[430px]">
                <TrackScene3D trains={trains} animals={detections} alerts={liveAlerts} />
              </div>
            ) : (
              <div className="h-[400px]">
                <FallbackMap2D trains={trains} animals={detections} sensors={sensors} />
              </div>
            )}
          </div>
          {/* Mobile forces 2D Leaflet */}
          <div className="block md:hidden h-[350px]">
            <FallbackMap2D trains={trains} animals={detections} sensors={sensors} />
          </div>
        </div>
      </div>

      {/* SUB-DASHBOARD (ACTIVE FEED & ACTIVE TRAIN LISTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Active alerts feed */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider font-mono">
            Active Warning Logs ({liveAlerts.length})
          </h2>
          <AlertFeed 
            alerts={liveAlerts} 
            onResolve={handleResolveAlert}
            user={user}
          />
        </div>

        {/* Right: Running trains status table */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider font-mono">
            Live Train Monitor
          </h2>
          <div className="glass-card p-5 border border-cyan-500/10">
            <TrainTable 
              trains={trains} 
              onTriggerManualAlert={handleTriggerManualAlert}
              isAdmin={user.role === 'admin'}
            />
          </div>
        </div>

      </div>

      {/* FOOTER SECTION: SENSORS STATUS GRID */}
      <div className="flex flex-col gap-4 mt-4">
        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider font-mono">
          IoT Sensory Node Health Map
        </h2>
        <SensorGrid sensors={sensors} />
      </div>

    </div>
  );
}
