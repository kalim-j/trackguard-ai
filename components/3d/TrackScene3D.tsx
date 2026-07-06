'use client';

import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sky } from '@react-three/drei';
import * as THREE from 'three';
import WAP7Locomotive from './WAP7Locomotive';
import SensorNode3D from './SensorNode3D';
import AnimalMarker3D from './AnimalMarker3D';
import { TrainPosition, AnimalDetection, Alert } from '../../lib/types';

interface TrackScene3DProps {
  trains: TrainPosition[];
  animals: AnimalDetection[];
  alerts: Alert[];
}

export default function TrackScene3D({ trains, animals, alerts }: TrackScene3DProps) {
  // 1. Define the 3D rail track path (coincides with km markers 0 to 200)
  // X coordinates from -70 (km 0) to 70 (km 200). Gently winding on Z axis.
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-70, 0.15, 0),     // km 0 (Chennai)
      new THREE.Vector3(-45, 0.15, -4),    // km 36
      new THREE.Vector3(-20, 0.15, 4),     // km 72
      new THREE.Vector3(5, 0.15, -2),      // km 108
      new THREE.Vector3(30, 0.15, 5),      // km 144
      new THREE.Vector3(55, 0.15, -3),     // km 180
      new THREE.Vector3(70, 0.15, 0)       // km 200 (Salem)
    ]);
  }, []);

  // 2. Sample points along the track to render railway sleepers (ties)
  const sleepers = useMemo(() => {
    const samples = 150;
    const items = [];
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const point = curve.getPointAt(t);
      
      // Determine orientation (look at next point on track)
      const tangent = curve.getTangentAt(t);
      const angle = Math.atan2(tangent.x, tangent.z);
      
      items.push({
        id: `sleeper-${i}`,
        position: [point.x, 0.05, point.z] as [number, number, number],
        rotation: [0, angle + Math.PI / 2, 0] as [number, number, number]
      });
    }
    return items;
  }, [curve]);

  // 3. Define 18 sensor locations along the track sides (spaced evenly every ~11km)
  const sensors = useMemo(() => {
    const count = 18;
    const list = [];
    for (let i = 0; i < count; i++) {
      const km = (200 / (count - 1)) * i;
      const t = km / 200;
      const trackPos = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      
      // Compute perpendicular offset direction to place sensors at track sides
      const perpX = -tangent.z;
      const perpZ = tangent.x;
      const offsetAmt = 1.1; // meters off-center
      
      // Alternate left and right side of tracks
      const sideMultiplier = i % 2 === 0 ? 1 : -1;
      const sensorX = trackPos.x + perpX * offsetAmt * sideMultiplier;
      const sensorZ = trackPos.z + perpZ * offsetAmt * sideMultiplier;

      const code = `TG-MAS-${String(Math.floor(km)).padStart(3, '0')}`;
      
      list.push({
        code,
        km,
        position: [sensorX, 0, sensorZ] as [number, number, number]
      });
    }
    return list;
  }, [curve]);

  // Helper to determine sensor state from alerts
  const getSensorStatus = (sensorKm: number) => {
    // If there is a critical or warning alert within 15km of this sensor, mark it ALERT
    const activeAlert = alerts.some(alert => {
      const alertKm = alert.animal_detections?.km_marker;
      if (alertKm === undefined) return false;
      return Math.abs(alertKm - sensorKm) < 15;
    });

    if (activeAlert) return 'alert';
    
    // Simulate one sensor offline and one under maintenance for high realism
    if (sensorKm > 50 && sensorKm < 60) return 'maintenance';
    if (sensorKm > 170 && sensorKm < 185) return 'offline';
    
    return 'active';
  };

  // 4. Sample rails geometry (Tube along curve)
  const leftRailCurve = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const perpX = -tangent.z;
      const perpZ = tangent.x;
      pts.push(new THREE.Vector3(p.x + perpX * 0.42, p.y + 0.05, p.z + perpZ * 0.42));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, [curve]);

  const rightRailCurve = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const perpX = -tangent.z;
      const perpZ = tangent.x;
      pts.push(new THREE.Vector3(p.x - perpX * 0.42, p.y + 0.05, p.z - perpZ * 0.42));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, [curve]);

  return (
    <div className="w-full h-full bg-navy-950 rounded-2xl overflow-hidden border border-cyan-500/15 shadow-2xl relative">
      
      {/* Dynamic 3D Scene Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 glass-card px-4 py-2 text-xs flex items-center gap-3">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> Active route: Chennai-Salem</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-300">Drag to Orbit, Scroll to Zoom</span>
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 15, 25], fov: 40 }}
      >
        <fog attach="fog" near={15} far={120} color="#050A18" />
        
        {/* Cinematic night sky environment */}
        <color attach="background" args={["#050A18"]} />
        <ambientLight intensity={0.15} color="#0A0F1E" />
        
        {/* Soft Moonlight */}
        <directionalLight
          castShadow
          position={[-20, 30, 10]}
          intensity={0.6}
          color="#8FA3C7"
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={200}
          shadow-camera-left={-80}
          shadow-camera-right={80}
          shadow-camera-top={40}
          shadow-camera-bottom={-40}
        />

        {/* Ambient Stars */}
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0.5} fade speed={1} />
        
        {/* Soft Sky Dome */}
        <Sky distance={450000} sunPosition={[0, -0.05, 1]} azimuth={0.25} turbidity={8} rayleigh={0.5} />

        {/* 3D GROUND / FOREST FLOOR */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.05, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#0A1810" roughness={0.95} metalness={0.05} />
        </mesh>

        {/* BALLAST / GRAVEL ROADBED (Centered box trailing the curve) */}
        <mesh position={[0, 0.02, 0]} receiveShadow>
          <boxGeometry args={[145, 0.08, 2.4]} />
          <meshStandardMaterial color="#555555" roughness={0.8} />
        </mesh>

        {/* RAIL SLEEPERS */}
        {sleepers.map((sl) => (
          <mesh key={sl.id} position={sl.position} rotation={sl.rotation} castShadow receiveShadow>
            <boxGeometry args={[1.5, 0.06, 0.2]} />
            <meshStandardMaterial color="#3C2A1A" roughness={0.9} />
          </mesh>
        ))}

        {/* STEEL TRACK RAILS */}
        {/* Left Rail */}
        <mesh castShadow receiveShadow>
          <tubeGeometry args={[leftRailCurve, 200, 0.025, 6, false]} />
          <meshStandardMaterial color="#B0B0B0" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Right Rail */}
        <mesh castShadow receiveShadow>
          <tubeGeometry args={[rightRailCurve, 200, 0.025, 6, false]} />
          <meshStandardMaterial color="#B0B0B0" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* 18 SENSOR NODES */}
        {sensors.map((s) => (
          <SensorNode3D
            key={s.code}
            position={s.position}
            status={getSensorStatus(s.km)}
            code={s.code}
          />
        ))}

        {/* ACTIVE TRAINS */}
        {trains.map((train) => {
          // Map train's km marker (0 to 200) to curve progress (0 to 1)
          const progress = train.current_km / 200;
          return (
            <WAP7Locomotive
              key={train.train_number}
              speed={train.speed_kmh}
              progress={progress}
              curve={curve}
              trainNumber={train.train_number}
              trainName={train.train_name}
              isNight={true}
            />
          );
        })}

        {/* ANIMAL MARKERS */}
        {animals.map((anim) => {
          const t = anim.km_marker / 200;
          const trackPos = curve.getPointAt(t);
          
          // Render at their actual snapped coordinate location relative to track
          // We can offset slightly off-track using their actual lat/lng difference
          // Or draw them at snapped 3D coordinates. Let's place them slightly off-track
          // using their offset coordinates generated in animalData
          // The coordinates mapping: x axis represents track progress, z axis represents width
          // Let's position them at the snapped curve point, but offset in Z based on their custom offsets
          const perpX = -curve.getTangentAt(t).z;
          const perpZ = curve.getTangentAt(t).x;
          
          // Generate a deterministic offset based on their database ID
          const offsetSign = anim.id.charCodeAt(5) % 2 === 0 ? 1 : -1;
          const animX = trackPos.x + perpX * 1.35 * offsetSign;
          const animZ = trackPos.z + perpZ * 1.35 * offsetSign;

          return (
            <AnimalMarker3D
              key={anim.id}
              position={[animX, 0, animZ]}
              emoji={anim.animal_emoji}
              type={anim.animal_type}
              confidence={Number(anim.confidence_score)}
              count={anim.count}
              dataSource={anim.data_source}
            />
          );
        })}

        {/* SCENE CONTROLS */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2.05} // prevent going below ground
          minDistance={5}
          maxDistance={90}
          target={[0, 1, 0]}
        />
      </Canvas>
    </div>
  );
}
