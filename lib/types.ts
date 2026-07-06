export interface User {
  id: string;
  firebase_uid: string;
  email: string;
  display_name: string | null;
  photo_url: string | null;
  role: 'admin' | 'station_master' | 'forest_officer' | 'researcher' | 'default';
  zone: string | null;
  last_login: string;
  created_at: string;
}

export interface Sensor {
  id: string;
  sensor_code: string;
  km_marker: number;
  latitude: number;
  longitude: number;
  zone: string;
  route: string;
  status: 'active' | 'alert' | 'offline' | 'maintenance';
  last_ping: string;
  battery_level: number;
  signal_strength: number;
  sensor_type: string;
  installed_at: string;
}

export interface AnimalDetection {
  id: string;
  sensor_id: string | null;
  animal_type: string;
  animal_emoji: string;
  confidence_score: number;
  latitude: number;
  longitude: number;
  km_marker: number;
  count: number;
  data_source: 'demo' | 'iNaturalist' | 'GBIF' | 'sensor';
  source_url: string | null;
  detected_at: string;
  status: 'active' | 'cleared' | 'false_alarm';
  cleared_at: string | null;
  notes: string | null;
}

export interface TrainPosition {
  id: string;
  train_number: string;
  train_name: string;
  train_type: string | null;
  current_km: number;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  alp_name: string | null;
  alp_phone: string | null;
  direction: 'UP' | 'DOWN';
  last_updated: string;
  api_source: 'mock' | 'railradar' | 'rapidapi' | 'indianrail';
}

export interface Alert {
  id: string;
  detection_id: string;
  train_id: string;
  severity: 'critical' | 'warning' | 'info';
  distance_km: number;
  fired_at: string;
  alp_notified: boolean;
  station_notified: boolean;
  control_room_notified: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  false_alarm: boolean;
  recommended_speed: number | null;
  notes: string | null;
  
  // Joined relation details
  animal_detections?: AnimalDetection;
  train_positions?: TrainPosition;
}

export interface Incident {
  id: string;
  date: string;
  animal_type: string | null;
  km_marker: number | null;
  route: string | null;
  train_number: string | null;
  outcome: 'prevented' | 'collision' | 'near_miss';
  data_source: string | null;
  source_url: string | null;
  created_at: string;
}
