'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrainPosition, Alert } from '../lib/types';

export default function useTrainPositions() {
  const [trains, setTrains] = useState<TrainPosition[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchTrains = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await fetch('/api/trains/live');
      if (!res.ok) throw new Error('Failed to fetch live train positions');
      
      const data = await res.json();
      setTrains(data.trains || []);
      setAlerts(data.alerts || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred fetching train data');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchTrains();

    // Setup 30s refresh interval
    const interval = setInterval(() => {
      fetchTrains(true); // silent update in background
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchTrains]);

  return {
    trains,
    alerts,
    loading,
    error,
    lastUpdated,
    refresh: fetchTrains
  };
}
