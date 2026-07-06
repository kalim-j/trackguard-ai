'use client';

import React from 'react';
import { Alert, User } from '../../lib/types';
import { AlertTriangle, CheckCircle, BellRing, Navigation } from 'lucide-react';

interface AlertFeedProps {
  alerts: Alert[];
  onResolve: (alertId: string, isFalseAlarm: boolean) => Promise<void>;
  user: User | any;
}

export default function AlertFeed({ alerts, onResolve, user }: AlertFeedProps) {
  if (alerts.length === 0) {
    return (
      <div className="glass-card p-8 flex flex-col items-center justify-center text-center gap-3 border border-emerald-500/10 hover:border-emerald-500/20 transition-all duration-300">
        <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
          <CheckCircle className="h-6 w-6" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-gray-200">Railway Corridors Clear</h3>
          <p className="text-xs text-gray-500 max-w-[280px]">No wildlife animal intrusions detected within warning thresholds (10km) of active trains.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
      {alerts.map((alert) => {
        const animal = alert.animal_detections;
        const train = alert.train_positions;
        const isCritical = alert.severity === 'critical';

        return (
          <div
            key={alert.id}
            className={`glass-card p-5 border relative overflow-hidden transition-all duration-300 ${
              isCritical
                ? 'border-red-500/20 hover:border-red-500/40 bg-red-950/5'
                : 'border-amber-500/20 hover:border-amber-500/40 bg-amber-950/5'
            }`}
          >
            {/* Visual Flashing Side bar for critical alerts */}
            <div className={`absolute top-0 left-0 w-1.5 h-full ${
              isCritical ? 'bg-red-500 pulse-red' : 'bg-amber-400'
            }`} />

            <div className="flex flex-col gap-3 ml-1">
              {/* Header Status Row */}
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono ${
                  isCritical 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/20' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                }`}>
                  {isCritical ? '⚠️ CRITICAL (UNDER 5KM)' : '⚠️ WARNING (5KM - 10KM)'}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  {alert.fired_at ? new Date(alert.fired_at).toLocaleTimeString() : 'Live'}
                </span>
              </div>

              {/* Alert Context Details */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Animal & Proximity Info */}
                <div className="flex items-center gap-3">
                  <span className="text-3xl" title={`${animal?.animal_type || 'Animal'} Emoji`}>
                    {animal?.animal_emoji || '🐘'}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-200">
                      {animal?.animal_type || 'Elephant'} Intrusion
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1 font-mono">
                      Km Marker: {animal?.km_marker || '0'} · Distance: <strong className={isCritical ? 'text-red-400' : 'text-amber-400'}>{alert.distance_km} km</strong>
                    </span>
                  </div>
                </div>

                {/* Train details */}
                <div className="flex items-center gap-2 text-right sm:text-right shrink-0">
                  <div className="flex flex-col text-left sm:text-right">
                    <span className="text-xs font-semibold text-gray-300">
                      {train?.train_name || 'Express Train'}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      No: {train?.train_number} · Speed: {train?.speed_kmh} km/h
                    </span>
                  </div>
                </div>
              </div>

              {/* Pilot recommended actions */}
              <div className="bg-navy-950/60 rounded-lg p-3 border border-cyan-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-xs text-gray-400 flex items-center gap-1.5 leading-relaxed">
                  <BellRing className={`h-3.5 w-3.5 ${isCritical ? 'text-red-400 animate-bounce' : 'text-amber-400'}`} />
                  <span>
                    ALP Speed restriction recommendation: <strong className="text-cyan-accent font-mono text-xs">{alert.recommended_speed} km/h</strong> (Caution Order)
                  </span>
                </span>
                
                {/* System notification indicators */}
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono shrink-0">
                  <span className={alert.alp_notified ? 'text-emerald-400' : ''}>[ALP: {alert.alp_notified ? 'OK' : 'WAIT'}]</span>
                  <span className={alert.station_notified ? 'text-emerald-400' : ''}>[Station: OK]</span>
                </div>
              </div>

              {/* Action Resolution Buttons */}
              <div className="flex items-center justify-end gap-3 mt-1">
                <button
                  onClick={() => onResolve(alert.id, true)} // Mark as False Alarm
                  className="px-3.5 py-1.5 rounded-lg border border-gray-700 hover:border-amber-500/40 text-xs font-medium text-gray-400 hover:text-amber-400 transition-colors"
                >
                  False Alarm
                </button>
                <button
                  onClick={() => onResolve(alert.id, false)} // Resolve Alert
                  className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 hover:border-emerald-500/50 text-xs font-semibold text-emerald-400 transition-all shadow-[0_0_10px_rgba(16,185,129,0.05)]"
                >
                  Clear Intrusion
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
