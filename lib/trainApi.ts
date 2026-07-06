import { TrainPosition } from './types';

// Hardcoded mock trains for Chennai-Salem corridor
const MOCK_TRAINS: Omit<TrainPosition, 'id' | 'last_updated'>[] = [
  { 
    train_number: "16101", 
    train_name: "Chennai–Coimbatore Intercity Exp", 
    speed_kmh: 82, 
    current_km: 81.2, 
    latitude: 12.9716, 
    longitude: 79.1583,
    alp_name: "Rajesh Kumar", 
    alp_phone: "+91-98765-43210",
    direction: "UP", 
    train_type: "express",
    api_source: "mock"
  },
  { 
    train_number: "12673", 
    train_name: "Cheran SF Express",
    speed_kmh: 91, 
    current_km: 108.5, 
    latitude: 12.9342, 
    longitude: 79.3725,
    alp_name: "Suresh Babu", 
    alp_phone: "+91-98765-43211",
    direction: "UP", 
    train_type: "superfast",
    api_source: "mock"
  },
  { 
    train_number: "22553", 
    train_name: "Erode Passenger",
    speed_kmh: 54, 
    current_km: 52.3, 
    latitude: 12.8406, 
    longitude: 79.7139,
    alp_name: "Murugan S", 
    alp_phone: "+91-98765-43212",
    direction: "DOWN", 
    train_type: "passenger",
    api_source: "mock"
  },
  { 
    train_number: "08412", 
    train_name: "Salem Goods Special",
    speed_kmh: 45, 
    current_km: 135.7, 
    latitude: 11.9850, 
    longitude: 78.8350,
    alp_name: "Venkat R", 
    alp_phone: "+91-98765-43213",
    direction: "UP", 
    train_type: "goods",
    api_source: "mock"
  }
];

export async function fetchLiveTrainPositions(): Promise<TrainPosition[]> {
  const railradarApiKey = process.env.RAILRADAR_API_KEY;
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const indianRailKey = process.env.INDIAN_RAIL_API_KEY;

  const now = new Date().toISOString();

  // PRIORITY 1: RailRadar API (Primary)
  if (railradarApiKey) {
    try {
      const res = await fetch('https://api.railradar.in/v1/trains/running', {
        headers: { 
          'Authorization': `Bearer ${railradarApiKey}`,
          'x-api-key': railradarApiKey
        },
        next: { revalidate: 30 }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.trains)) {
          return data.trains.map((t: any, idx: number) => ({
            id: `railradar-${t.trainNo || idx}`,
            train_number: t.trainNo || `TR-${idx}`,
            train_name: t.trainName || 'Express Train',
            train_type: t.trainType || 'express',
            current_km: t.currentKm || 0,
            latitude: Number(t.lat) || 12.9716,
            longitude: Number(t.lng) || 79.1583,
            speed_kmh: Number(t.speed) || 70,
            alp_name: t.alpName || 'Unknown ALP',
            alp_phone: t.alpPhone || '+91-XXXXX-XXXXX',
            direction: t.direction === 'DOWN' ? 'DOWN' : 'UP',
            last_updated: now,
            api_source: 'railradar'
          }));
        }
      }
    } catch (e) {
      console.warn('RailRadar API failed, trying RapidAPI...', e);
    }
  }

  // PRIORITY 2: RapidAPI (Backup 1)
  if (rapidApiKey) {
    try {
      const results: TrainPosition[] = [];
      const departureDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
      
      for (const t of MOCK_TRAINS) {
        try {
          const res = await fetch(`https://indian-railway-irctc.p.rapidapi.com/api/trains/v1/train/status?departure_date=${departureDate}&isH5=true&client=web&deviceIdentifier=Mozilla%2520Firefox-138.0.0.0&train_number=${t.train_number}`, {
            headers: {
              'Content-Type': 'application/json',
              'x-rapid-api': 'rapid-api-database',
              'x-rapidapi-host': 'indian-railway-irctc.p.rapidapi.com',
              'x-rapidapi-key': rapidApiKey
            },
            next: { revalidate: 30 }
          });
          if (res.ok) {
            const data = await res.json();
            const statusInfo = data.data || data;
            const speed = Number(statusInfo.speed || statusInfo.currentSpeed) || t.speed_kmh;
            const currentKm = Number(statusInfo.currentKm) || t.current_km;
            const lat = Number(statusInfo.lat || statusInfo.latitude) || t.latitude;
            const lng = Number(statusInfo.lng || statusInfo.longitude) || t.longitude;

            results.push({
              id: `rapidapi-${t.train_number}`,
              train_number: t.train_number,
              train_name: statusInfo.trainName || t.train_name,
              train_type: t.train_type,
              current_km: currentKm,
              latitude: lat,
              longitude: lng,
              speed_kmh: speed,
              alp_name: t.alp_name,
              alp_phone: t.alp_phone,
              direction: t.direction,
              last_updated: now,
              api_source: 'rapidapi'
            });
          }
        } catch (err) {
          console.warn(`RapidAPI query failed for train ${t.train_number}:`, err);
        }
      }
      if (results.length > 0) return results;
    } catch (e) {
      console.warn('RapidAPI backup failed, trying Indian Rail API...', e);
    }
  }

  // PRIORITY 3: Indian Rail API (Backup 2)
  if (indianRailKey) {
    try {
      const results: TrainPosition[] = [];
      for (const t of MOCK_TRAINS) {
        try {
          const res = await fetch(`https://indianrailapi.com/api/v2/LiveTrain/apikey/${indianRailKey}/TrainNumber/${t.train_number}/`, {
            next: { revalidate: 30 }
          });
          if (res.ok) {
            const data = await res.json();
            results.push({
              id: `indianrail-${t.train_number}`,
              train_number: t.train_number,
              train_name: data.TrainName || t.train_name,
              train_type: t.train_type,
              current_km: data.CurrentKm || t.current_km,
              latitude: Number(data.Latitude) || t.latitude,
              longitude: Number(data.Longitude) || t.longitude,
              speed_kmh: Number(data.CurrentSpeed) || t.speed_kmh,
              alp_name: t.alp_name,
              alp_phone: t.alp_phone,
              direction: t.direction,
              last_updated: now,
              api_source: 'indianrail'
            });
          }
        } catch (err) {
          console.warn(`Indian Rail API failed for train ${t.train_number}`);
        }
      }
      if (results.length > 0) return results;
    } catch (e) {
      console.warn('Indian Rail API general failure, using full mock fallback...', e);
    }
  }

  // PRIORITY 4: Full mock fallback with slight dynamic movements
  const timeOffset = Date.now() / 1000;
  
  return MOCK_TRAINS.map((train) => {
    const speedInKmPerSecond = train.speed_kmh / 3600;
    const movement = (timeOffset * speedInKmPerSecond) % 40;
    
    let currentKm = train.current_km;
    let lat = train.latitude;
    let lng = train.longitude;

    if (train.direction === 'UP') {
      currentKm = Math.max(10, train.current_km - movement);
      lat = train.latitude - (movement * 0.004);
      lng = train.longitude - (movement * 0.005);
    } else {
      currentKm = Math.min(190, train.current_km + movement);
      lat = train.latitude + (movement * 0.004);
      lng = train.longitude + (movement * 0.005);
    }

    return {
      id: `mock-${train.train_number}`,
      train_number: train.train_number,
      train_name: train.train_name,
      train_type: train.train_type,
      current_km: parseFloat(currentKm.toFixed(1)),
      latitude: parseFloat(lat.toFixed(4)),
      longitude: parseFloat(lng.toFixed(4)),
      speed_kmh: train.speed_kmh,
      alp_name: train.alp_name,
      alp_phone: train.alp_phone,
      direction: train.direction,
      last_updated: now,
      api_source: 'mock'
    } as TrainPosition;
  });
}
