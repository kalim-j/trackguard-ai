import { AnimalDetection } from './types';
import { calculateNearestKm, getTrackCoordinate } from './trackUtils';

// Hardcoded realistic seed data (always loaded)
const SEED_DETECTIONS: Omit<AnimalDetection, 'id'>[] = [
  {
    sensor_id: null,
    animal_type: "Elephant",
    animal_emoji: "🐘",
    confidence_score: 95,
    latitude: 12.9341,
    longitude: 79.3456,
    km_marker: 84.2,
    count: 3,
    data_source: "demo",
    source_url: null,
    detected_at: new Date(Date.now() - 5 * 60000).toISOString(), // 5 mins ago
    status: "active",
    cleared_at: null,
    notes: "Family of elephants spotted feeding near tracks."
  },
  {
    sensor_id: null,
    animal_type: "Cattle",
    animal_emoji: "🐄",
    confidence_score: 88,
    latitude: 12.7823,
    longitude: 79.6234,
    km_marker: 112.7,
    count: 4,
    data_source: "demo",
    source_url: null,
    detected_at: new Date(Date.now() - 15 * 60000).toISOString(),
    status: "active",
    cleared_at: null,
    notes: "Herd of cows grazing close to the level crossing."
  },
  {
    sensor_id: null,
    animal_type: "Deer",
    animal_emoji: "🦌",
    confidence_score: 82,
    latitude: 12.8934,
    longitude: 79.1567,
    km_marker: 58.5,
    count: 2,
    data_source: "demo",
    source_url: null,
    detected_at: new Date(Date.now() - 30 * 60000).toISOString(),
    status: "active",
    cleared_at: null,
    notes: "Spotted deer moving towards the tracks in the forest section."
  },
  {
    sensor_id: null,
    animal_type: "Wild Boar",
    animal_emoji: "🐗",
    confidence_score: 71,
    latitude: 11.9923,
    longitude: 78.8901,
    km_marker: 135.1,
    count: 1,
    data_source: "demo",
    source_url: null,
    detected_at: new Date(Date.now() - 45 * 60000).toISOString(),
    status: "active",
    cleared_at: null,
    notes: "Single boar crossing tracks."
  }
];

// Helper to match animal type to emoji
function getAnimalEmoji(name: string): string {
  const lowercase = name.toLowerCase();
  if (lowercase.includes('elephant') || lowercase.includes('elephas')) return '🐘';
  if (lowercase.includes('cattle') || lowercase.includes('bos') || lowercase.includes('cow')) return '🐄';
  if (lowercase.includes('deer') || lowercase.includes('axis')) return '🦌';
  if (lowercase.includes('tiger') || lowercase.includes('panthera')) return '🐅';
  if (lowercase.includes('boar') || lowercase.includes('sus') || lowercase.includes('pig')) return '🐗';
  return '🐾';
}

export async function fetchAnimalDetections(): Promise<AnimalDetection[]> {
  const detections: AnimalDetection[] = [];

  // Generate unique IDs for seeds
  const seedDetectionsWithIds = SEED_DETECTIONS.map((s, idx) => ({
    ...s,
    id: `seed-${idx}-${s.animal_type.toLowerCase().replace(' ', '-')}`
  })) as AnimalDetection[];

  detections.push(...seedDetectionsWithIds);

  // iNaturalist API URLs
  const inaturalistBaseUrl = process.env.INATURALIST_BASE_URL || 'https://api.inaturalist.org/v1';
  
  // Taxa of interest
  const taxaList = [
    { name: 'Elephant', query: 'Elephas maxima' },
    { name: 'Cattle', query: 'Bos taurus' },
    { name: 'Deer', query: 'Axis axis' },
    { name: 'Tiger', query: 'Panthera tigris' },
    { name: 'Wild Boar', query: 'Sus scrofa' }
  ];

  // Try iNaturalist
  try {
    // We'll query iNaturalist for Indian observations of these species.
    // To avoid too many queries, we fetch the most recent research grade observations.
    const speciesQuery = taxaList.map(t => encodeURIComponent(t.query)).join(',');
    const url = `${inaturalistBaseUrl}/observations?place_id=6681&quality_grade=research&per_page=15&q=${speciesQuery}&order=desc&order_by=created_at`;
    
    const res = await fetch(url, { next: { revalidate: 300 } }); // Cache for 5 minutes
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.results)) {
        data.results.forEach((obs: any, idx: number) => {
          if (obs.geojson && obs.geojson.coordinates) {
            const [lng, lat] = obs.geojson.coordinates;
            // Snap to our corridor
            const km = calculateNearestKm(lat, lng);
            // Re-interpolate coordinates along our line so they render within the 3D scene correctly
            const snappedCoords = getTrackCoordinate(km);
            
            // Add a small perpendicular offset so they are not exactly on top of the rails
            const offsetLat = snappedCoords.lat + (idx % 2 === 0 ? 0.0008 : -0.0008);
            const offsetLng = snappedCoords.lng + (idx % 2 === 0 ? -0.0008 : 0.0008);

            const animalName = obs.taxon?.preferred_common_name || obs.taxon?.name || 'Wild Animal';
            
            detections.push({
              id: `inat-${obs.id || idx}`,
              sensor_id: null,
              animal_type: animalName,
              animal_emoji: getAnimalEmoji(animalName),
              confidence_score: 75, // research grade default confidence
              latitude: parseFloat(offsetLat.toFixed(4)),
              longitude: parseFloat(offsetLng.toFixed(4)),
              km_marker: km,
              count: 1,
              data_source: "iNaturalist",
              source_url: obs.uri || `https://www.inaturalist.org/observations/${obs.id}`,
              detected_at: obs.time_observed_at || obs.created_at || new Date().toISOString(),
              status: "active",
              cleared_at: null,
              notes: `iNaturalist Sighting. Quality grade: ${obs.quality_grade || 'research'}.`
            });
          }
        });
      }
    }
  } catch (e) {
    console.warn('iNaturalist API failed, skipping...', e);
  }

  // Try GBIF API for biodiversity records (Catered to Elephants)
  const gbifBaseUrl = process.env.GBIF_BASE_URL || 'https://api.gbif.org/v1';
  try {
    const res = await fetch(`${gbifBaseUrl}/occurrence/search?country=IN&taxonKey=4829073&hasCoordinate=true&limit=10`, {
      next: { revalidate: 300 }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.results)) {
        data.results.forEach((rec: any, idx: number) => {
          const lat = rec.decimalLatitude;
          const lng = rec.decimalLongitude;
          if (lat && lng) {
            const km = calculateNearestKm(lat, lng);
            const snappedCoords = getTrackCoordinate(km);
            
            // Add a small perpendicular offset
            const offsetLat = snappedCoords.lat + (idx % 2 === 0 ? 0.0006 : -0.0006);
            const offsetLng = snappedCoords.lng + (idx % 2 === 0 ? -0.0006 : 0.0006);

            detections.push({
              id: `gbif-${rec.key || idx}`,
              sensor_id: null,
              animal_type: "Elephant",
              animal_emoji: "🐘",
              confidence_score: 80,
              latitude: parseFloat(offsetLat.toFixed(4)),
              longitude: parseFloat(offsetLng.toFixed(4)),
              km_marker: km,
              count: rec.individualCount || 1,
              data_source: "GBIF",
              source_url: `https://www.gbif.org/occurrence/${rec.key}`,
              detected_at: rec.eventDate || new Date().toISOString(),
              status: "active",
              cleared_at: null,
              notes: `GBIF Occurrence Record. Institution: ${rec.institutionCode || 'Unknown'}.`
            });
          }
        });
      }
    }
  } catch (e) {
    console.warn('GBIF API failed, skipping...', e);
  }

  return detections;
}
