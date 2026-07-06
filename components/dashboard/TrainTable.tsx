'use client';

import React from 'react';
import { TrainPosition } from '../../lib/types';
import { ShieldAlert, Phone, Compass, Timer } from 'lucide-react';

interface TrainTableProps {
  trains: TrainPosition[];
  onTriggerManualAlert?: (train: TrainPosition) => void;
  isAdmin?: boolean;
}

export default function TrainTable({ trains, onTriggerManualAlert, isAdmin = false }: TrainTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-cyan-500/10 text-xs text-gray-400 font-mono tracking-wider">
            <th className="py-3.5 px-4 font-semibold">Train Number & Name</th>
            <th className="py-3.5 px-4 font-semibold">Direction</th>
            <th className="py-3.5 px-4 font-semibold">Current Location</th>
            <th className="py-3.5 px-4 font-semibold text-right">Speed</th>
            <th className="py-3.5 px-4 font-semibold">Loco Pilot (ALP)</th>
            <th className="py-3.5 px-4 font-semibold">Source</th>
            <th className="py-3.5 px-4 font-semibold text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-cyan-500/5 text-sm text-gray-200">
          {trains.map((train) => (
            <tr 
              key={train.train_number}
              className="hover:bg-cyan-950/15 transition-colors group"
            >
              {/* Train Name & Number */}
              <td className="py-4 px-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-white tracking-wide">{train.train_name}</span>
                  <span className="text-[11px] text-gray-500 font-mono">No: {train.train_number} · Type: <span className="uppercase">{train.train_type || 'Express'}</span></span>
                </div>
              </td>

              {/* Direction */}
              <td className="py-4 px-4">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                  train.direction === 'UP' 
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' 
                    : 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                }`}>
                  {train.direction === 'UP' ? '⬆ UP (Salem)' : '⬇ DOWN (Chennai)'}
                </span>
              </td>

              {/* Current Km & Coordinates */}
              <td className="py-4 px-4">
                <div className="flex flex-col gap-0.5 font-mono text-xs">
                  <span className="text-gray-300 font-bold">Km {train.current_km}</span>
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Compass className="h-3 w-3 shrink-0 text-cyan-accent/60" /> 
                    {train.latitude.toFixed(4)}N, {train.longitude.toFixed(4)}E
                  </span>
                </div>
              </td>

              {/* Speed */}
              <td className="py-4 px-4 text-right">
                <div className="flex items-center justify-end gap-1 font-mono">
                  <Timer className="h-4.5 w-4.5 text-cyan-accent/70 shrink-0" />
                  <span className="font-bold text-gray-200">{train.speed_kmh} <span className="text-[10px] text-gray-500 font-normal">km/h</span></span>
                </div>
              </td>

              {/* ALP Contact */}
              <td className="py-4 px-4 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-gray-300">{train.alp_name || 'Rajesh Kumar'}</span>
                  {isAdmin ? (
                    <span className="text-gray-500 flex items-center gap-1 font-mono text-[10px]">
                      <Phone className="h-3 w-3 text-cyan-accent/50 shrink-0" /> {train.alp_phone || '+91-98765-43210'}
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-600 font-mono">Contact Locked</span>
                  )}
                </div>
              </td>

              {/* Source Badge */}
              <td className="py-4 px-4">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                  train.api_source === 'mock'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {train.api_source.toUpperCase()}
                </span>
              </td>

              {/* Action Trigger */}
              <td className="py-4 px-4 text-right">
                <button
                  onClick={() => onTriggerManualAlert && onTriggerManualAlert(train)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-red-500/25 hover:border-red-500/50 hover:bg-red-500/10 text-xs font-medium text-red-400 hover:text-red-300 transition-all opacity-85 hover:opacity-100"
                >
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                  <span>Alert Pilot</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
