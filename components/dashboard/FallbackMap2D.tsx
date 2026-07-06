'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TrainPosition, AnimalDetection, Sensor } from '../../lib/types';
import { TRACK_ANCHORS } from '../../lib/trackUtils';

// Leaflet standard marker icon fix
const fixLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

interface FallbackMap2DProps {
  trains: TrainPosition[];
  animals: AnimalDetection[];
  sensors: Sensor[] | any[];
}

export default function FallbackMap2D({ trains, animals, sensors }: FallbackMap2DProps) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  // Draw track polyline
  const trackPath = TRACK_ANCHORS.map(anchor => [anchor.lat, anchor.lng] as [number, number]);

  // Center coordinate of the map (Katpadi Jn area)
  const centerPosition: [number, number] = [12.8340, 79.1350];

  // Custom icons using emojis for high visual appeal
  const createEmojiIcon = (emoji: string) => {
    return L.divIcon({
      html: `<div style="font-size: 24px; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.5));">${emoji}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
      className: 'emoji-marker'
    });
  };

  return (
    <div className="w-full h-full min-h-[350px] relative rounded-xl overflow-hidden border border-cyan-500/15 shadow-xl">
      <MapContainer
        center={centerPosition}
        zoom={8.5}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Dark style Map Tiles from CartoDB */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* RAIL TRACK CORRIDOR POLYLINE */}
        <Polyline
          positions={trackPath}
          pathOptions={{ color: '#00D4FF', weight: 4, opacity: 0.8, dashArray: '5, 10' }}
        />

        {/* SENSOR NODES (Small circular indicators) */}
        {sensors.map((sensor) => {
          const isAlert = sensor.status === 'alert';
          const color = isAlert ? '#FF3B3B' : sensor.status === 'maintenance' ? '#FFB347' : sensor.status === 'offline' ? '#777777' : '#00FF88';
          return (
            <CircleMarker
              key={sensor.sensor_code}
              center={[sensor.latitude, sensor.longitude]}
              radius={5}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.8,
                weight: 1
              }}
            >
              <Popup>
                <div className="text-xs font-sans text-gray-200">
                  <h4 className="font-bold text-white font-mono">{sensor.sensor_code}</h4>
                  <p>Route: {sensor.route}</p>
                  <p>Status: <span className="uppercase font-bold" style={{ color }}>{sensor.status}</span></p>
                  <p>Battery: {sensor.battery_level}% · Signal: {sensor.signal_strength}dBm</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* ACTIVE TRAIN MARKERS */}
        {trains.map((train) => (
          <Marker
            key={train.train_number}
            position={[train.latitude, train.longitude]}
            icon={createEmojiIcon('🚂')}
          >
            <Popup>
              <div className="text-xs font-sans text-gray-200">
                <h4 className="font-bold text-cyan-accent">{train.train_name}</h4>
                <p className="font-mono">Train No: {train.train_number}</p>
                <p>Speed: <strong>{train.speed_kmh} km/h</strong></p>
                <p className="font-mono">Km: {train.current_km}</p>
                <p>ALP: {train.alp_name}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ACTIVE ANIMAL DETECTIONS */}
        {animals.map((animal) => (
          <Marker
            key={animal.id}
            position={[animal.latitude, animal.longitude]}
            icon={createEmojiIcon(animal.animal_emoji)}
          >
            <Popup>
              <div className="text-xs font-sans text-gray-200">
                <h4 className="font-bold text-red-400">🚨 {animal.animal_type} Sighting</h4>
                <p className="font-mono">Km Marker: {animal.km_marker}</p>
                <p>Confidence: {animal.confidence_score}%</p>
                <p className="text-[10px] text-amber-500 font-bold font-mono">DEMO DATA — Source: {animal.data_source}</p>
                {animal.notes && <p className="text-gray-400 mt-1 italic">"{animal.notes}"</p>}
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>
    </div>
  );
}
