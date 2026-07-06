'use client';

import React from 'react';
import { Sensor } from '../../lib/types';
import { Radio, Battery, Signal, ArrowUpRight } from 'lucide-react';

interface SensorGridProps {
  sensors: Sensor[] | any[];
  onSelectSensor?: (sensor: Sensor) => void;
}

export default function SensorGrid({ sensors, onSelectSensor }: SensorGridProps) {
  const getStatusBadge = (status: Sensor['status']) => {
    switch (status) {
      case 'alert':
        return <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-bold font-mono px-2 py-0.5 rounded-full pulse-red">ALERT</span>;
      case 'maintenance':
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold font-mono px-2 py-0.5 rounded-full">MAINTENANCE</span>;
      case 'offline':
        return <span className="bg-gray-500/20 text-gray-400 border border-gray-500/30 text-[9px] font-bold font-mono px-2 py-0.5 rounded-full">OFFLINE</span>;
      default:
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold font-mono px-2 py-0.5 rounded-full pulse-green">ACTIVE</span>;
    }
  };

  const getSignalStrength = (strength: number) => {
    if (strength > 80) return 'text-emerald-400';
    if (strength > 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-emerald-400';
    if (level > 20) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sensors.map((sensor) => (
        <div
          key={sensor.id || sensor.sensor_code}
          onClick={() => onSelectSensor && onSelectSensor(sensor)}
          className={`glass-card p-4 border flex flex-col gap-3 transition-all duration-300 relative group cursor-pointer ${
            sensor.status === 'alert' 
              ? 'border-red-500/20 hover:border-red-500/40 bg-red-950/5' 
              : 'border-cyan-500/10 hover:border-cyan-500/30 bg-navy-950/20'
          }`}
        >
          {/* Top Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-gray-300">
              <Radio className="h-4 w-4 text-cyan-accent" />
              <span className="text-xs font-bold font-mono">{sensor.sensor_code}</span>
            </div>
            {getStatusBadge(sensor.status)}
          </div>

          {/* Location details */}
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400 leading-normal">Route: {sensor.route}</span>
            <span className="text-[11px] text-gray-500 font-mono">Km Marker: {sensor.km_marker}</span>
          </div>

          {/* Stats footer bar */}
          <div className="flex items-center justify-between border-t border-cyan-500/5 pt-2.5 mt-1 text-[10px] text-gray-400 font-mono">
            <span className="flex items-center gap-1">
              <Battery className={`h-3.5 w-3.5 ${getBatteryColor(sensor.battery_level)}`} />
              <span>{sensor.battery_level}%</span>
            </span>
            
            <span className="flex items-center gap-1">
              <Signal className={`h-3.5 w-3.5 ${getSignalStrength(sensor.signal_strength)}`} />
              <span>{sensor.signal_strength} dBm</span>
            </span>

            <span className="text-cyan-accent/70 group-hover:text-cyan-accent flex items-center gap-0.5 text-[9px] hover:underline shrink-0 font-sans transition-colors">
              History <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
