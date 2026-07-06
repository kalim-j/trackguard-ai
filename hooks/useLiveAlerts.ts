'use client';

import { useState, useEffect, useCallback } from 'react';
import { Alert } from '../lib/types';
import { supabase } from '../lib/supabase';

export default function useLiveAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlertDetails = async (alertId: string): Promise<Alert | null> => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*, animal_detections(*), train_positions(*)')
        .eq('id', alertId)
        .single();
      
      if (!error && data) return data as Alert;
    } catch (e) {
      console.warn('Failed to fetch full alert details:', e);
    }
    return null;
  };

  const fetchActiveAlerts = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      // Fetch alerts with relation details
      const res = await fetch('/api/alerts?status=active&limit=30');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
        setError(null);
      } else {
        throw new Error('Failed to fetch alerts feed');
      }
    } catch (err: any) {
      console.error('Error fetching alerts feed:', err);
      setError(err.message || 'Error fetching active alerts');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveAlerts();

    // 1. Setup Supabase Realtime channel
    const channel = supabase
      .channel('alerts-channel')
      .on(
        'postgres_changes',
        { event: '*', table: 'alerts' },
        async (payload) => {
          console.log('Realtime alert change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Fetch complete relation info before inserting into UI feed
            const fullAlert = await fetchAlertDetails(payload.new.id);
            if (fullAlert) {
              setAlerts(prev => [fullAlert, ...prev].slice(0, 30));
            } else {
              // Fallback fetch of the whole list
              fetchActiveAlerts(false);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedAlert = payload.new as Alert;
            if (updatedAlert.resolved_at) {
              // If resolved, remove it from active list
              setAlerts(prev => prev.filter(a => a.id !== updatedAlert.id));
            } else {
              // Otherwise update the entry
              const fullAlert = await fetchAlertDetails(updatedAlert.id);
              if (fullAlert) {
                setAlerts(prev => prev.map(a => a.id === updatedAlert.id ? fullAlert : a));
              } else {
                fetchActiveAlerts(false);
              }
            }
          } else if (payload.eventType === 'DELETE') {
            setAlerts(prev => prev.filter(a => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // 2. Setup a 10s fallback polling loop in case Realtime fails/is unconfigured
    const polling = setInterval(() => {
      fetchActiveAlerts(false);
    }, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(polling);
    };
  }, [fetchActiveAlerts]);

  // Resolve alert handler
  const resolveAlert = async (alertId: string, userId?: string, isFalseAlarm = false, notes?: string) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: alertId,
          resolved_by: userId,
          false_alarm: isFalseAlarm,
          notes: notes || 'Resolved from alerts feed'
        })
      });

      if (res.ok) {
        // Optimistic UI update
        setAlerts(prev => prev.filter(a => a.id !== alertId));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to resolve alert:', e);
      return false;
    }
  };

  return {
    alerts,
    loading,
    error,
    resolveAlert,
    refresh: fetchActiveAlerts
  };
}
