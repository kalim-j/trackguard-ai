'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import WAP7Locomotive from './WAP7Locomotive';
import AnimalMarker3D from './AnimalMarker3D';

// Automated camera controller for a slow, sweep orbit
function CameraSweeper() {
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    const radius = 30 + Math.sin(elapsed * 0.03) * 5; // gentle radius breathing
    
    // Slow circular orbit
    state.camera.position.x = Math.sin(elapsed * 0.04) * radius;
    state.camera.position.z = Math.cos(elapsed * 0.04) * radius;
    
    // Smooth elevation change
    state.camera.position.y = 12 + Math.sin(elapsed * 0.06) * 3;
    
    // Focus in the middle of our visual stage
    state.camera.lookAt(0, 0.5, 0);
  });
  return null;
}

// Looped train progress controller
function LoopedTrain({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const progressRef = useRef(0.2);

  useFrame((state, delta) => {
    // Increment train progress slowly
    progressRef.current = (progressRef.current + delta * 0.012) % 1.0;
  });

  return (
    <WAP7Locomotive
      speed={65}
      progress={progressRef.current}
      curve={curve}
      trainNumber="30201"
      trainName="TrackGuard Express"
      isNight={true}
    />
  );
}

export default function Hero3DScene() {
  // Curved track definition
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-45, 0.15, -4),
      new THREE.Vector3(-25, 0.15, 2),
      new THREE.Vector3(-5, 0.15, -3),
      new THREE.Vector3(15, 0.15, 3),
      new THREE.Vector3(35, 0.15, -2),
      new THREE.Vector3(55, 0.15, 0)
    ]);
  }, []);

  // sleepers sample
  const sleepers = useMemo(() => {
    const samples = 80;
    const items = [];
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const angle = Math.atan2(tangent.x, tangent.z);
      items.push({
        id: `hero-sleeper-${i}`,
        position: [point.x, 0.05, point.z] as [number, number, number],
        rotation: [0, angle + Math.PI / 2, 0] as [number, number, number]
      });
    }
    return items;
  }, [curve]);

  // Rails offset lines
  const leftRailCurve = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
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
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const perpX = -tangent.z;
      const perpZ = tangent.x;
      pts.push(new THREE.Vector3(p.x - perpX * 0.42, p.y + 0.05, p.z - perpZ * 0.42));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, [curve]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-navy-950">
      <Canvas
        shadows
        camera={{ position: [20, 10, 20], fov: 45 }}
      >
        {/* Dense forest/cinematic fog */}
        <fog attach="fog" near={5} far={45} color="#050A18" />
        
        <color attach="background" args={["#050A18"]} />
        <ambientLight intensity={0.12} color="#0A0F1E" />
        
        {/* Cinematic moonlight spotlight */}
        <spotLight
          castShadow
          position={[-15, 25, 10]}
          intensity={0.8}
          angle={Math.PI / 4}
          penumbra={0.6}
          color="#A5B4FC"
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Ambient Stars */}
        <Stars radius={100} depth={30} count={1200} factor={3} saturation={0.5} fade speed={0.5} />

        {/* Ground mesh */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.05, 0]}>
          <planeGeometry args={[150, 150]} />
          <meshStandardMaterial color="#06120D" roughness={0.9} />
        </mesh>

        {/* Ballast bed */}
        <mesh position={[0, 0.02, 0]} receiveShadow>
          <boxGeometry args={[115, 0.08, 2.2]} />
          <meshStandardMaterial color="#444444" roughness={0.7} />
        </mesh>

        {/* Sleepers */}
        {sleepers.map((sl) => (
          <mesh key={sl.id} position={sl.position} rotation={sl.rotation} castShadow>
            <boxGeometry args={[1.4, 0.05, 0.18]} />
            <meshStandardMaterial color="#2E1C0C" roughness={0.95} />
          </mesh>
        ))}

        {/* Rails */}
        <mesh castShadow receiveShadow>
          <tubeGeometry args={[leftRailCurve, 80, 0.02, 4, false]} />
          <meshStandardMaterial color="#7A7A7A" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh castShadow receiveShadow>
          <tubeGeometry args={[rightRailCurve, 80, 0.02, 4, false]} />
          <meshStandardMaterial color="#7A7A7A" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Looping train locomotive */}
        <LoopedTrain curve={curve} />

        {/* Static pulsing animal alert (Elephant) near curve center */}
        {/* Placed off-rail at curve progress t=0.55 */}
        {useMemo(() => {
          const t = 0.55;
          const p = curve.getPointAt(t);
          const tangent = curve.getTangentAt(t);
          const perpX = -tangent.z;
          const perpZ = tangent.x;
          const animX = p.x + perpX * 1.5;
          const animZ = p.z + perpZ * 1.5;
          return (
            <AnimalMarker3D
              position={[animX, 0, animZ]}
              emoji="🐘"
              type="Elephant"
              confidence={96}
              count={2}
              dataSource="iNaturalist"
            />
          );
        }, [curve])}

        {/* Trigger slow camera automated circular path */}
        <CameraSweeper />
      </Canvas>
    </div>
  );
}
