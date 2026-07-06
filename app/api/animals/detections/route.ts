import { NextResponse } from 'next/server';
import { fetchAnimalDetections } from '@/lib/animalData';
import { supabase } from '@/lib/supabase';
import { AnimalDetection } from '@/lib/types';

export async function GET() {
  try {
    // 1. Try to fetch active detections from Supabase
    const { data: dbDetections, error: dbError } = await supabase
      .from('animal_detections')
      .select('*')
      .eq('status', 'active');

    if (!dbError && dbDetections && dbDetections.length > 0) {
      return NextResponse.json(dbDetections as AnimalDetection[]);
    }

    // 2. If Supabase is empty or fetch fails/is unconfigured, fetch from APIs + Seed
    const apiDetections = await fetchAnimalDetections();

    // 3. Try to cache the detections in Supabase if we can write to it
    // To do this, we clean the custom string IDs and let Postgres generate UUIDs
    try {
      const { data: sensors } = await supabase.from('sensors').select('id, km_marker');
      
      const insertPayload = apiDetections.map(det => {
        // Find nearest sensor if any
        let sensorId = null;
        if (sensors && sensors.length > 0) {
          const closestSensor = sensors.reduce((prev, curr) => {
            return Math.abs(Number(curr.km_marker) - det.km_marker) < Math.abs(Number(prev.km_marker) - det.km_marker) ? curr : prev;
          });
          if (Math.abs(Number(closestSensor.km_marker) - det.km_marker) < 15) {
            sensorId = closestSensor.id;
          }
        }

        return {
          sensor_id: sensorId,
          animal_type: det.animal_type,
          animal_emoji: det.animal_emoji,
          confidence_score: det.confidence_score,
          latitude: det.latitude,
          longitude: det.longitude,
          km_marker: det.km_marker,
          count: det.count,
          data_source: det.data_source,
          source_url: det.source_url,
          detected_at: det.detected_at,
          status: 'active',
          notes: det.notes
        };
      });

      if (insertPayload.length > 0) {
        const { data: inserted, error: insertError } = await supabase
          .from('animal_detections')
          .insert(insertPayload)
          .select();

        if (!insertError && inserted && inserted.length > 0) {
          return NextResponse.json(inserted as AnimalDetection[]);
        }
      }
    } catch (cacheErr) {
      console.warn('Could not cache animal detections in Supabase:', cacheErr);
    }

    // Fallback directly to the API data (with custom string IDs) if DB writes fail
    return NextResponse.json(apiDetections);
  } catch (err: any) {
    console.error('Error in animal detections API route:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
