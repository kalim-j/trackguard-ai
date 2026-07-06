'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimalDetection } from '../lib/types';

export default function useAnimalDetections() {
  const [detections, setDetections] = useState<AnimalDetection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/animals/detections');
      if (!res.ok) throw new Error('Failed to fetch animal detections');
      const data = await res.json();
      setDetections(data || []);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading animal detection data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDetections();
  }, [fetchDetections]);

  return {
    detections,
    loading,
    error,
    refresh: fetchDetections
  };
}
