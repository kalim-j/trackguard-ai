import { Alert, TrainPosition, AnimalDetection } from './types';
import { haversineDistance } from './trackUtils';
import { supabase } from './supabase';

/**
 * Calculates early warning alerts in-memory based on proximity between trains and animal detections.
 */
export function calculateAlerts(trains: TrainPosition[], animals: AnimalDetection[]): Alert[] {
  const alerts: Alert[] = [];
  const activeAnimals = animals.filter(a => a.status === 'active');

  activeAnimals.forEach(animal => {
    trains.forEach(train => {
      // Calculate distance between train and animal
      const distance = haversineDistance(
        animal.latitude,
        animal.longitude,
        train.latitude,
        train.longitude
      );

      // Early warning ranges:
      // Critical: < 5km
      // Warning: 5km to 10km
      // Info: > 10km (not logged as active warning, but calculated for tracking)
      if (distance < 10) {
        const severity = distance < 5 ? 'critical' : 'warning';
        
        // Recommended speed
        let recommendedSpeed = 110;
        if (severity === 'critical') {
          recommendedSpeed = train.train_type === 'goods' ? 15 : 20; // very low speed / caution
        } else if (severity === 'warning') {
          recommendedSpeed = 45; // reduced speed
        }

        alerts.push({
          id: `alert-${animal.id}-${train.id}`, // temp in-memory ID
          detection_id: animal.id,
          train_id: train.id,
          severity,
          distance_km: parseFloat(distance.toFixed(2)),
          fired_at: new Date().toISOString(),
          alp_notified: severity === 'critical', // automatically notify ALP if critical
          station_notified: true,
          control_room_notified: severity === 'critical',
          resolved_at: null,
          resolved_by: null,
          false_alarm: false,
          recommended_speed: recommendedSpeed,
          notes: `Early warning alert: ${animal.animal_type} detected at km marker ${animal.km_marker}. Train speed is ${train.speed_kmh} km/h.`,
          
          // Attach joins for client consumption
          animal_detections: animal,
          train_positions: train
        });
      }
    });
  });

  return alerts;
}

/**
 * Syncs the calculated alerts with Supabase database.
 * Creates new alerts if they don't already exist for unresolved train-animal pairs.
 */
export async function syncAlertsToSupabase(calculatedAlerts: Alert[]): Promise<Alert[]> {
  const syncedAlerts: Alert[] = [];

  for (const alert of calculatedAlerts) {
    try {
      // 1. Check if both ids are valid UUIDs (or if they are mock string IDs)
      // Since iNaturalist and mock lists use custom string prefixes, if we are in mock mode
      // we just use the in-memory alerts directly without DB writes.
      const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      if (!isUuid(alert.detection_id) || !isUuid(alert.train_id)) {
        // Skip DB sync for non-UUID (mock/demo) records, just return as-is
        syncedAlerts.push(alert);
        continue;
      }

      // 2. Query existing active (unresolved) alerts for this detection and train
      const { data: existing, error: selectError } = await supabase
        .from('alerts')
        .select('*')
        .eq('detection_id', alert.detection_id)
        .eq('train_id', alert.train_id)
        .is('resolved_at', null)
        .maybeSingle();

      if (selectError) {
        console.warn('Error fetching existing alerts from Supabase:', selectError.message);
        syncedAlerts.push(alert);
        continue;
      }

      if (existing) {
        // Update distance if changed
        const { data: updated, error: updateError } = await supabase
          .from('alerts')
          .update({ distance_km: alert.distance_km })
          .eq('id', existing.id)
          .select()
          .single();

        if (!updateError && updated) {
          syncedAlerts.push({
            ...alert,
            id: updated.id,
            distance_km: updated.distance_km,
            fired_at: updated.fired_at,
            alp_notified: updated.alp_notified,
            station_notified: updated.station_notified,
            control_room_notified: updated.control_room_notified,
            notes: updated.notes
          });
        } else {
          syncedAlerts.push({
            ...alert,
            id: existing.id
          });
        }
      } else {
        // Insert new alert
        const payload = {
          detection_id: alert.detection_id,
          train_id: alert.train_id,
          severity: alert.severity,
          distance_km: alert.distance_km,
          alp_notified: alert.alp_notified,
          station_notified: alert.station_notified,
          control_room_notified: alert.control_room_notified,
          recommended_speed: alert.recommended_speed,
          notes: alert.notes
        };

        const { data: inserted, error: insertError } = await supabase
          .from('alerts')
          .insert(payload)
          .select()
          .single();

        if (insertError) {
          console.warn('Failed to insert new alert in Supabase:', insertError.message);
          syncedAlerts.push(alert);
        } else if (inserted) {
          syncedAlerts.push({
            ...alert,
            id: inserted.id,
            fired_at: inserted.fired_at
          });
        }
      }
    } catch (e) {
      console.error('Exception in alert syncing:', e);
      syncedAlerts.push(alert);
    }
  }

  return syncedAlerts;
}
