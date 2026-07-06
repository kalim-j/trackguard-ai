export interface Coordinate {
  lat: number;
  lng: number;
}

// Geographic anchors along the Chennai-Salem route (approx. 200 km)
export const TRACK_ANCHORS: { km: number; lat: number; lng: number; name: string }[] = [
  { km: 0, lat: 13.0827, lng: 80.2707, name: "Chennai Central" },
  { km: 36, lat: 12.9812, lng: 79.9123, name: "Arakkonam Jn" },
  { km: 72, lat: 12.9320, lng: 79.5410, name: "Walajah Road Jn" },
  { km: 108, lat: 12.8340, lng: 79.1350, name: "Katpadi Jn (Vellore)" },
  { km: 144, lat: 12.4500, lng: 78.5800, name: "Jolarpettai Jn" },
  { km: 180, lat: 12.0100, lng: 78.2200, name: "Morappur" },
  { km: 200, lat: 11.6643, lng: 78.1460, name: "Salem Jn" }
];

// Haversine formula for physical distance in kilometers
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get interpolated coordinate { lat, lng } at a specific km marker
export function getTrackCoordinate(km: number): Coordinate {
  // Clamp km between 0 and 200
  const targetKm = Math.max(0, Math.min(200, km));

  // Find the anchors we are between
  let startAnchor = TRACK_ANCHORS[0];
  let endAnchor = TRACK_ANCHORS[TRACK_ANCHORS.length - 1];

  for (let i = 0; i < TRACK_ANCHORS.length - 1; i++) {
    if (targetKm >= TRACK_ANCHORS[i].km && targetKm <= TRACK_ANCHORS[i+1].km) {
      startAnchor = TRACK_ANCHORS[i];
      endAnchor = TRACK_ANCHORS[i+1];
      break;
    }
  }

  const segmentKmLength = endAnchor.km - startAnchor.km;
  if (segmentKmLength === 0) return { lat: startAnchor.lat, lng: startAnchor.lng };

  const fraction = (targetKm - startAnchor.km) / segmentKmLength;
  
  // Linear interpolation between the two anchor points
  const lat = startAnchor.lat + fraction * (endAnchor.lat - startAnchor.lat);
  const lng = startAnchor.lng + fraction * (endAnchor.lng - startAnchor.lng);

  return { lat, lng };
}

// Projects an arbitrary lat/lng onto the track and returns the nearest km marker
export function calculateNearestKm(lat: number, lng: number): number {
  let nearestKm = 0;
  let minDistance = Infinity;

  // Scan the track at 0.5 km resolution to find the closest point
  for (let km = 0; km <= 200; km += 0.5) {
    const trackPos = getTrackCoordinate(km);
    const dist = haversineDistance(lat, lng, trackPos.lat, trackPos.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestKm = km;
    }
  }

  return parseFloat(nearestKm.toFixed(1));
}
