import { NextResponse } from 'next/server';
import { fetchLiveTrainPositions } from '@/lib/trainApi';
import { calculateAlerts, syncAlertsToSupabase } from '@/lib/alertEngine';
import { supabase } from '@/lib/supabase';
import { TrainPosition, AnimalDetection } from '@/lib/types';

export async function GET() {
  try {
    // 1. Fetch live train positions (API or simulated)
    const liveTrains = await fetchLiveTrainPositions();
    const syncedTrains: TrainPosition[] = [];

    // 2. Cache/Upsert trains in Supabase train_positions
    for (const train of liveTrains) {
      try {
        // Find existing record by train_number
        const { data: existing, error: selectError } = await supabase
          .from('train_positions')
          .select('*')
          .eq('train_number', train.train_number)
          .maybeSingle();

        if (selectError) {
          syncedTrains.push(train);
          continue;
        }

        if (existing) {
          // Update position
          const { data: updated, error: updateError } = await supabase
            .from('train_positions')
            .update({
              latitude: train.latitude,
              longitude: train.longitude,
              current_km: train.current_km,
              speed_kmh: train.speed_kmh,
              last_updated: new Date().toISOString(),
              api_source: train.api_source
            })
            .eq('id', existing.id)
            .select()
            .single();

          if (!updateError && updated) {
            syncedTrains.push(updated as TrainPosition);
          } else {
            syncedTrains.push({ ...train, id: existing.id });
          }
        } else {
          // Insert new record
          const payload = {
            train_number: train.train_number,
            train_name: train.train_name,
            train_type: train.train_type,
            current_km: train.current_km,
            latitude: train.latitude,
            longitude: train.longitude,
            speed_kmh: train.speed_kmh,
            alp_name: train.alp_name,
            alp_phone: train.alp_phone,
            direction: train.direction,
            api_source: train.api_source
          };

          const { data: inserted, error: insertError } = await supabase
            .from('train_positions')
            .insert(payload)
            .select()
            .single();

          if (!insertError && inserted) {
            syncedTrains.push(inserted as TrainPosition);
          } else {
            syncedTrains.push(train);
          }
        }
      } catch (cacheErr) {
        console.warn(`Failed to sync train ${train.train_number} to Supabase:`, cacheErr);
        syncedTrains.push(train);
      }
    }

    // 3. Fetch active animal detections from DB (so we have valid UUIDs)
    let activeDetections: AnimalDetection[] = [];
    try {
      const { data: dbDetections, error: dbError } = await supabase
        .from('animal_detections')
        .select('*')
        .eq('status', 'active');

      if (!dbError && dbDetections) {
        activeDetections = dbDetections as AnimalDetection[];
      }
    } catch (e) {
      console.warn('Failed to fetch animal detections for alert calculation:', e);
    }

    // If DB is empty, fallback to local fetch of animals
    if (activeDetections.length === 0) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/animals/detections`);
        if (res.ok) {
          activeDetections = await res.json();
        }
      } catch (e) {
        console.warn('Failed to fetch fallback detections for alerts:', e);
      }
    }

    // 4. Run Alert Engine Proximity Calculations
    const calculatedAlerts = calculateAlerts(syncedTrains, activeDetections);

    // 5. Sync alerts to Supabase and return the results
    const syncedAlerts = await syncAlertsToSupabase(calculatedAlerts);

    return NextResponse.json({
      trains: syncedTrains,
      alerts: syncedAlerts.filter(a => a.severity === 'critical' || a.severity === 'warning'),
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Error in live trains API route:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
