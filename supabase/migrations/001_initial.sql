-- Clean reset database schema (drops any existing/partial tables from previous runs)
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS animal_detections CASCADE;
DROP TABLE IF EXISTS train_positions CASCADE;
DROP TABLE IF EXISTS sensors CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  role TEXT DEFAULT 'default',
  zone TEXT, -- which railway zone they manage
  last_login TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sensor nodes
CREATE TABLE sensors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_code TEXT UNIQUE NOT NULL, -- e.g. "TG-MAS-084"
  km_marker DECIMAL NOT NULL,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  zone TEXT NOT NULL, -- SR, NFR, SCR etc
  route TEXT NOT NULL, -- e.g. "Chennai-Salem"
  status TEXT DEFAULT 'active', -- active, alert, offline, maintenance
  last_ping TIMESTAMPTZ DEFAULT NOW(),
  battery_level INTEGER DEFAULT 100,
  signal_strength INTEGER DEFAULT 95,
  sensor_type TEXT DEFAULT 'thermal+vibration',
  installed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Animal detections (from iNaturalist/GBIF + demo data)
CREATE TABLE animal_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID REFERENCES sensors(id),
  animal_type TEXT NOT NULL,
  animal_emoji TEXT NOT NULL,
  confidence_score DECIMAL, -- AI confidence 0-100
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  km_marker DECIMAL NOT NULL,
  count INTEGER DEFAULT 1, -- number of animals
  data_source TEXT DEFAULT 'demo', -- iNaturalist / GBIF / sensor / demo
  source_url TEXT, -- link to original record
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active', -- active, cleared, false_alarm
  cleared_at TIMESTAMPTZ,
  notes TEXT
);

-- Train positions (from API or mock)
CREATE TABLE train_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  train_number TEXT NOT NULL,
  train_name TEXT NOT NULL,
  train_type TEXT, -- express, passenger, goods
  current_km DECIMAL,
  latitude DECIMAL,
  longitude DECIMAL,
  speed_kmh INTEGER,
  alp_name TEXT,
  alp_phone TEXT,
  direction TEXT, -- UP or DOWN
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  api_source TEXT DEFAULT 'mock' -- railone/whereismytrain/mock
);

-- Alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  detection_id UUID REFERENCES animal_detections(id),
  train_id UUID REFERENCES train_positions(id),
  severity TEXT NOT NULL, -- critical, warning, info
  distance_km DECIMAL, -- distance between animal and train
  fired_at TIMESTAMPTZ DEFAULT NOW(),
  alp_notified BOOLEAN DEFAULT false,
  station_notified BOOLEAN DEFAULT false,
  control_room_notified BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  false_alarm BOOLEAN DEFAULT false,
  recommended_speed INTEGER, -- speed AI recommends for train
  notes TEXT
);

-- Incidents (historical accident/near-miss records)
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  animal_type TEXT,
  km_marker DECIMAL,
  route TEXT,
  train_number TEXT,
  outcome TEXT, -- prevented, collision, near_miss
  data_source TEXT, -- WII report, news, manual entry
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable Row Level Security (safest for client-side Firebase + Supabase anon client queries)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE animal_detections DISABLE ROW LEVEL SECURITY;

-- Seed realistic incident data from WII/news sources
INSERT INTO incidents (date, animal_type, km_marker, route, outcome, data_source) VALUES
('2024-12-21', 'Elephant', 84.2, 'Assam-Guwahati', 'collision', 'News report'),
('2024-06-18', 'Elephant', 112.5, 'Jhargram-WB', 'collision', 'WII data'),
('2023-11-14', 'Cattle', 58.3, 'Chennai-Salem', 'prevented', 'Demo'),
('2023-08-22', 'Deer', 140.1, 'Vellore-Salem', 'near_miss', 'Demo'),
('2023-05-10', 'Tiger', 220.4, 'NFR corridor', 'prevented', 'WII data');
