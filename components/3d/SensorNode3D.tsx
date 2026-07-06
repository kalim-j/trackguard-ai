'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SensorNode3DProps {
  position: [number, number, number];
  status: 'active' | 'alert' | 'offline' | 'maintenance';
  code: string;
}

export default function SensorNode3D({ position, status, code }: SensorNode3DProps) {
  const glowRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  // Animate the dome glow intensity and scale if in alert state
  useFrame((state) => {
    if (!glowRef.current) return;
    
    if (status === 'alert') {
      const pulse = Math.sin(state.clock.getElapsedTime() * 8) * 0.3 + 0.7; // Fast pulse
      glowRef.current.scale.setScalar(1.0 + pulse * 0.25);
      if (glowRef.current.material) {
        (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 + pulse * 0.5;
      }
      if (lightRef.current) {
        lightRef.current.intensity = 3 + pulse * 5;
      }
    } else if (status === 'maintenance') {
      const pulse = Math.sin(state.clock.getElapsedTime() * 3) * 0.2 + 0.8; // Slow yellow pulse
      glowRef.current.scale.setScalar(1.0 + pulse * 0.15);
      if (lightRef.current) {
        lightRef.current.intensity = 1.5 + pulse * 2;
      }
    } else {
      // Normal active state
      glowRef.current.scale.setScalar(1.0);
      if (glowRef.current.material) {
        (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.5;
      }
      if (lightRef.current) {
        lightRef.current.intensity = 1.5;
      }
    }
  });

  const getStatusColor = () => {
    switch (status) {
      case 'alert': return '#FF3B3B'; // Red
      case 'maintenance': return '#FFB347'; // Orange/Yellow
      case 'offline': return '#777777'; // Gray
      default: return '#00FF88'; // Active Green
    }
  };

  const statusColor = getStatusColor();

  return (
    <group position={position}>
      {/* SUPPORT STAND POLE */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 1, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* SOLAR PANEL BOX ON SIDE */}
      <group position={[0, 0.75, 0.08]} rotation={[Math.PI / 6, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.25, 0.03, 0.2]} />
          <meshStandardMaterial color="#1E293B" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.018, 0]}>
          <planeGeometry args={[0.22, 0.18]} />
          <meshBasicMaterial color="#0A2540" />
        </mesh>
      </group>

      {/* SENSOR DEVICE BASE */}
      <mesh castShadow position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.12, 12]} />
        <meshStandardMaterial color="#475569" metalness={0.5} />
      </mesh>

      {/* SENSOR CAP DOME (GLOWING DOME) */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.13, 16, 12]} />
        <meshStandardMaterial 
          color={statusColor} 
          emissive={statusColor} 
          emissiveIntensity={status === 'offline' ? 0 : 0.8}
        />
      </mesh>

      {/* GLOW ENVELOPE (Transparent aura) */}
      {status !== 'offline' && (
        <mesh position={[0, 1.15, 0]} ref={glowRef}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshBasicMaterial 
            color={statusColor} 
            transparent 
            opacity={0.3} 
            depthWrite={false} 
          />
        </mesh>
      )}

      {/* POINT LIGHT CAST ON DAMP SOIL */}
      {status !== 'offline' && (
        <pointLight
          ref={lightRef}
          intensity={1.5}
          distance={4}
          color={statusColor}
          position={[0, 1.3, 0]}
        />
      )}
    </group>
  );
}
