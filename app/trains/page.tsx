'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Train, Info, ShieldAlert, Phone, Clock, Landmark, AlertTriangle } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import useTrainPositions from '@/hooks/useTrainPositions';
import { TRACK_ANCHORS } from '@/lib/trackUtils';

export default function TrainsMonitorPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Custom hook loading running trains
  const { trains, loading: trainsLoading, lastUpdated, refresh } = useTrainPositions();

  // Selected train for timeline view
  const [selectedTrain, setSelectedTrain] = useState<any>(null);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  // Set first train as default selection
  useEffect(() => {
    if (trains.length > 0 && !selectedTrain) {
      setSelectedTrain(trains[0]);
    }
  }, [trains, selectedTrain]);

  const handleTriggerCautionOrder = (train: any) => {
    alert(`DISPATCHED: Speed restriction caution order transmitted to ALP ${train.alp_name} on Train ${train.train_number}. Target Speed: 30 km/h.`);
  };

  const getStationEta = (stationKm: number, currentKm: number, speedKmh: number, direction: string) => {
    if (speedKmh <= 0) return 'Stalled';
    
    let distance = 0;
    if (direction === 'UP') {
      // UP trains travel from higher km markers towards 0 (Chennai)
      if (currentKm < stationKm) return 'Passed';
      distance = currentKm - stationKm;
    } else {
      // DOWN trains travel from lower km markers towards Salem (200)
      if (currentKm > stationKm) return 'Passed';
      distance = stationKm - currentKm;
    }

    const hours = distance / speedKmh;
    const minutes = Math.round(hours * 60);
    return `${minutes} mins`;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Train className="h-7 w-7 text-cyan-accent" />
            LIVE TRANIS POSITION LOGS
          </h1>
          <p className="text-xs text-gray-400 font-sans">
            Real-time speed and position telemetry tracking running trains across the Chennai-Salem corridor.
          </p>
        </div>

        <button 
          onClick={() => refresh()}
          className="flex items-center gap-1 text-[11px] font-bold font-mono bg-navy-900 border border-gray-700 hover:border-cyan-accent hover:text-cyan-accent text-gray-400 px-4 py-2 rounded-lg transition-colors shrink-0"
        >
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>Last refresh: {new Date(lastUpdated).toLocaleTimeString()}</span>
        </button>
      </div>

      {/* CORE SPLIT SCREEN DISPLAY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Trains list */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider font-mono">
            Active Train Telemetry ({trains.length})
          </h2>

          <div className="flex flex-col gap-4">
            {trains.map((train) => {
              const isSelected = selectedTrain?.train_number === train.train_number;
              return (
                <div
                  key={train.train_number}
                  onClick={() => setSelectedTrain(train)}
                  className={`glass-card p-5 border cursor-pointer transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative group ${
                    isSelected 
                      ? 'border-cyan-500/40 bg-cyan-950/5' 
                      : 'border-cyan-500/10 hover:border-cyan-500/25 bg-navy-950/20'
                  }`}
                >
                  {/* Left info */}
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-cyan-950/50 border border-cyan-500/20 flex items-center justify-center text-cyan-accent">
                      <Train className="h-5 w-5" />
                    </div>
                    
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-white text-base">{train.train_name}</span>
                      <span className="text-xs text-gray-400 font-mono">
                        Number: {train.train_number} · Type: <span className="uppercase">{train.train_type || 'Express'}</span>
                      </span>
                      <span className="text-[11px] text-gray-500 font-mono">
                        Last ping: {new Date(train.last_updated || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {/* Right telemetry stats */}
                  <div className="flex items-center gap-6 sm:text-right font-mono text-xs">
                    <div className="flex flex-col gap-0.5 text-left sm:text-right">
                      <span className="text-gray-500 text-[10px]">CURRENT MARKER</span>
                      <span className="text-gray-200 font-bold">Km {train.current_km}</span>
                    </div>
                    
                    <div className="flex flex-col gap-0.5 text-left sm:text-right">
                      <span className="text-gray-500 text-[10px]">SPEED TELEMETRY</span>
                      <span className="text-cyan-accent font-bold">{train.speed_kmh} km/h</span>
                    </div>
                  </div>

                  {/* Indicator bar if selected */}
                  {isSelected && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-accent glow-cyan" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Train Route Timeline details */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider font-mono">
            Corridor Progress Timeline
          </h2>

          {selectedTrain ? (
            <div className="glass-card p-6 border border-cyan-500/25 flex flex-col gap-6 bg-navy-950/20 relative animate-in fade-in duration-200">
              
              {/* Header Details */}
              <div className="flex flex-col gap-1 border-b border-cyan-500/10 pb-4">
                <span className="text-xs text-cyan-accent font-mono tracking-wider font-bold uppercase">TRAIN ROUTE TRACKER</span>
                <h3 className="text-lg font-bold text-white leading-normal">{selectedTrain.train_name}</h3>
                <span className="text-xs text-gray-400 font-mono">Number: {selectedTrain.train_number} ({selectedTrain.direction} Bound)</span>
              </div>

              {/* Locomotive Pilot Details */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-navy-950/50 p-4 rounded-xl border border-cyan-500/5">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">ALP pilot Name</span>
                  <span className="text-gray-200 font-bold">{selectedTrain.alp_name || 'Rajesh Kumar'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500">VHF radio Contact</span>
                  {isAdmin ? (
                    <span className="text-cyan-accent font-bold flex items-center gap-1">
                      <Phone className="h-3 w-3 shrink-0" /> {selectedTrain.alp_phone || '+91-98765-43210'}
                    </span>
                  ) : (
                    <span className="text-gray-500 italic">Credentials Restricted</span>
                  )}
                </div>
              </div>

              {/* Graphical Timeline */}
              <div className="flex flex-col gap-6 mt-1 font-mono text-xs pl-2.5">
                <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">STATIONS AND ETAs</span>
                
                <div className="relative flex flex-col gap-6 pl-5 border-l border-cyan-500/20">
                  {TRACK_ANCHORS.map((station, index) => {
                    const isPassed = selectedTrain.direction === 'UP' 
                      ? selectedTrain.current_km < station.km 
                      : selectedTrain.current_km > station.km;
                    
                    const isHere = Math.abs(selectedTrain.current_km - station.km) < 18; // approximate check
                    
                    return (
                      <div key={index} className="relative flex items-center justify-between">
                        {/* Node circle on line */}
                        <div className={`absolute -left-[26px] h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${
                          isHere 
                            ? 'bg-cyan-accent border-cyan-accent animate-pulse scale-110' 
                            : isPassed 
                            ? 'bg-cyan-950 border-cyan-500/40' 
                            : 'bg-navy-950 border-gray-700'
                        }`} />
                        
                        <div className="flex flex-col">
                          <span className={`font-semibold ${isHere ? 'text-cyan-accent font-bold' : isPassed ? 'text-gray-400' : 'text-gray-200'}`}>
                            {station.name}
                          </span>
                          <span className="text-[10px] text-gray-500">Km {station.km}</span>
                        </div>

                        <span className="text-[10px] text-gray-400">
                          {isHere ? 'Arriving' : isPassed ? 'Passed' : getStationEta(station.km, selectedTrain.current_km, selectedTrain.speed_kmh, selectedTrain.direction)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions dispatch caution order */}
              <div className="flex flex-col gap-2.5 mt-2 border-t border-cyan-500/10 pt-4">
                <button
                  onClick={() => handleTriggerCautionOrder(selectedTrain)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-lg text-xs font-bold text-red-400 transition-colors"
                >
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  Issue Speed Order (Caution)
                </button>
              </div>

            </div>
          ) : (
            <div className="glass-card p-8 border border-cyan-500/10 text-center flex flex-col items-center justify-center gap-2 h-full min-h-[250px]">
              <Landmark className="h-8 w-8 text-gray-600" />
              <h3 className="font-semibold text-gray-400 text-sm mt-1">Select a Train</h3>
              <p className="text-xs text-gray-500 max-w-[200px]">Choose an active train route from the list to pull station timings and ETAs.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
