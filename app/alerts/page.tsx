'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Download, SlidersHorizontal, RefreshCcw, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import useAuth from '@/hooks/useAuth';

export default function AlertsHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Local state for filters
  const [severity, setSeverity] = useState<string>('');
  const [status, setStatus] = useState<string>(''); // '' | 'active' | 'resolved'
  const [animalType, setAnimalType] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/alerts?limit=20&page=${page}`;
      if (severity) url += `&severity=${severity}`;
      if (status) url += `&status=${status}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        let filteredAlerts = data.alerts || [];

        // Apply local filtering for animal type if set (since DB structure returns joined rows)
        if (animalType) {
          filteredAlerts = filteredAlerts.filter((a: any) => 
            a.animal_detections?.animal_type?.toLowerCase().includes(animalType.toLowerCase())
          );
        }

        setAlerts(filteredAlerts);
        setTotalCount(data.count || filteredAlerts.length);
      }
    } catch (e) {
      console.error('Failed to fetch alerts:', e);
    } finally {
      setLoading(false);
    }
  }, [page, severity, status, animalType]);

  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [fetchAlerts, user]);

  const handleResolve = async (alertId: string, isFalseAlarm: boolean) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: alertId,
          resolved_by: user?.dbId,
          false_alarm: isFalseAlarm,
          notes: isFalseAlarm ? 'Marked as false alarm by pilot.' : 'Corridor cleared of wildlife.'
        })
      });

      if (res.ok) {
        fetchAlerts();
      }
    } catch (e) {
      console.error('Failed to resolve alert:', e);
    }
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (alerts.length === 0) return;
    
    // Header
    const headers = ['Alert ID', 'Fired At', 'Severity', 'Distance (km)', 'Animal', 'Emoji', 'Train No', 'Speed (kmh)', 'Status', 'Resolved At', 'Notes'];
    const rows = alerts.map(a => [
      a.id,
      a.fired_at,
      a.severity,
      a.distance_km,
      a.animal_detections?.animal_type || 'Unknown',
      a.animal_detections?.animal_emoji || '',
      a.train_positions?.train_number || 'Unknown',
      a.train_positions?.speed_kmh || 0,
      a.resolved_at ? 'Resolved' : 'Active',
      a.resolved_at || 'N/A',
      a.notes || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `trackguard_alerts_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center gap-4 text-center">
        <div className="h-10 w-10 border-4 border-t-cyan-accent border-r-cyan-accent/30 border-b-cyan-accent/20 border-l-cyan-accent/10 rounded-full animate-spin"></div>
        <span className="text-sm font-mono text-cyan-accent">Checking credentials...</span>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / 20));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
      
      {/* Page Title & Exports */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-cyan-accent" />
            ALERT HISTORY LOGS
          </h1>
          <p className="text-xs text-gray-400 font-sans">
            Audit logs and incident outcomes across all monitored routes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 border border-gray-700 hover:border-cyan-accent hover:text-cyan-accent text-gray-300 text-xs font-bold font-mono rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          
          <button 
            onClick={fetchAlerts}
            className="p-2 bg-navy-900 border border-gray-700 hover:border-cyan-accent text-gray-400 hover:text-cyan-accent rounded-lg transition-colors"
            title="Refresh Feed"
          >
            <RefreshCcw className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* FILTER BAR MODULE */}
      <div className="glass-card p-5 border border-cyan-500/10 bg-navy-950/20 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono font-bold shrink-0">
          <SlidersHorizontal className="h-4 w-4 text-cyan-accent" />
          FILTERS
        </div>

        {/* Severity */}
        <select
          value={severity}
          onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
          className="bg-navy-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs font-mono text-gray-300 focus:outline-none focus:border-cyan-accent"
        >
          <option value="">All Severities</option>
          <option value="critical">Critical (&lt; 5km)</option>
          <option value="warning">Warning (5km - 10km)</option>
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="bg-navy-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs font-mono text-gray-300 focus:outline-none focus:border-cyan-accent"
        >
          <option value="">All Statuses</option>
          <option value="active">Active Alerts</option>
          <option value="resolved">Resolved Logs</option>
        </select>

        {/* Animal Search */}
        <input
          type="text"
          placeholder="Filter by animal name..."
          value={animalType}
          onChange={(e) => { setAnimalType(e.target.value); setPage(1); }}
          className="bg-navy-900 border border-gray-800 rounded-lg px-4 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-cyan-accent max-w-xs w-full sm:w-auto"
        />

        {/* Reset filters button */}
        {(severity || status || animalType) && (
          <button
            onClick={() => { setSeverity(''); setStatus(''); setAnimalType(''); setPage(1); }}
            className="text-xs text-gray-500 hover:text-cyan-accent font-medium font-sans"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* HISTORICAL LOGS TABLE */}
      <div className="glass-card overflow-hidden border border-cyan-500/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-cyan-500/10 bg-navy-900/40 text-xs text-gray-400 font-mono tracking-wider">
                <th className="py-3.5 px-5">Time Fired</th>
                <th className="py-3.5 px-5">Severity</th>
                <th className="py-3.5 px-5">Animal Detection</th>
                <th className="py-3.5 px-5">Train Position</th>
                <th className="py-3.5 px-5 text-right">Proximity</th>
                <th className="py-3.5 px-5">Outcome & Actions</th>
                <th className="py-3.5 px-5 text-right">Database State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/5 text-xs sm:text-sm text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 font-mono">
                    Searching database indices...
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 font-sans">
                    No historical logs matching query constraints.
                  </td>
                </tr>
              ) : (
                alerts.map((a) => {
                  const isCritical = a.severity === 'critical';
                  const isResolved = !!a.resolved_at;
                  return (
                    <tr key={a.id} className="hover:bg-cyan-950/5 transition-colors">
                      {/* Time */}
                      <td className="py-4.5 px-5 font-mono text-xs text-gray-400">
                        {new Date(a.fired_at).toLocaleString()}
                      </td>

                      {/* Severity */}
                      <td className="py-4.5 px-5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                          isCritical
                            ? 'bg-red-500/15 text-red-400 border border-red-500/25'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                        }`}>
                          {a.severity.toUpperCase()}
                        </span>
                      </td>

                      {/* Animal */}
                      <td className="py-4.5 px-5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl" title={`${a.animal_detections?.animal_type} Emoji`}>
                            {a.animal_detections?.animal_emoji}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-gray-200">{a.animal_detections?.animal_type || 'Elephant'}</span>
                            <span className="text-[10px] text-gray-500 font-mono">Km: {a.animal_detections?.km_marker || '0'} · Conf: {a.animal_detections?.confidence_score}%</span>
                          </div>
                        </div>
                      </td>

                      {/* Train */}
                      <td className="py-4.5 px-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-gray-200">{a.train_positions?.train_name || 'Goods Train'}</span>
                          <span className="text-[10px] text-gray-500 font-mono">No: {a.train_positions?.train_number} · Speed: {a.train_positions?.speed_kmh}km/h</span>
                        </div>
                      </td>

                      {/* Proximity */}
                      <td className="py-4.5 px-5 text-right font-mono font-bold text-xs text-white">
                        {a.distance_km} km
                      </td>

                      {/* Outcome / Notes */}
                      <td className="py-4.5 px-5 max-w-xs truncate">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-gray-300 italic">"{a.notes || 'No comments.'}"</span>
                          {isResolved && (
                            <span className="text-[10px] text-gray-500 font-mono">
                              Resolved: {new Date(a.resolved_at).toLocaleDateString()} {a.false_alarm && '(False Alarm)'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action buttons / Resolved badge */}
                      <td className="py-4.5 px-5 text-right">
                        {isResolved ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold font-sans bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-md">
                            <ShieldCheck className="h-4 w-4 shrink-0" />
                            Resolved
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleResolve(a.id, true)}
                              className="px-2 py-1 border border-gray-700 hover:border-amber-500/30 text-[10px] text-gray-400 hover:text-amber-400 rounded transition-colors"
                            >
                              False Alarm
                            </button>
                            <button
                              onClick={() => handleResolve(a.id, false)}
                              className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-[10px] text-emerald-400 rounded transition-all"
                            >
                              Resolve
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION TOOL BAR */}
      <div className="flex items-center justify-between text-xs text-gray-500 font-mono mt-2">
        <span>
          Showing page {page} of {totalPages} ({totalCount} total alerts found)
        </span>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-0.5 px-3 py-1.5 border border-gray-800 hover:border-cyan-accent text-gray-400 hover:text-cyan-accent rounded-lg disabled:opacity-40 disabled:hover:border-gray-800 disabled:hover:text-gray-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Previous
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-0.5 px-3 py-1.5 border border-gray-800 hover:border-cyan-accent text-gray-400 hover:text-cyan-accent rounded-lg disabled:opacity-40 disabled:hover:border-gray-800 disabled:hover:text-gray-400 transition-colors"
          >
            Next <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
