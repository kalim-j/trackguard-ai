'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

interface AnimalMarker3DProps {
  position: [number, number, number];
  emoji: string;
  type: string;
  confidence: number;
  count: number;
  dataSource: string;
}

export default function AnimalMarker3D({
  position,
  emoji,
  type,
  confidence,
  count,
  dataSource
}: AnimalMarker3DProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    // 1. Animate first pulsing alert ring on ground
    if (ringRef.current) {
      const elapsed = state.clock.getElapsedTime();
      const scale = (elapsed % 2.0) * 1.5; // grows from 0 to 3
      ringRef.current.scale.set(scale, scale, 1);
      
      const opacity = 1.0 - (elapsed % 2.0) / 2.0; // fades out
      if (ringRef.current.material) {
        (ringRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
      }
    }

    // 2. Animate second overlapping ring (staggered delay)
    if (ringRef2.current) {
      const elapsed = state.clock.getElapsedTime() + 1.0; // staggered by 1s
      const scale = (elapsed % 2.0) * 1.5;
      ringRef2.current.scale.set(scale, scale, 1);
      
      const opacity = 1.0 - (elapsed % 2.0) / 2.0;
      if (ringRef2.current.material) {
        (ringRef2.current.material as THREE.MeshBasicMaterial).opacity = opacity;
      }
    }
  });

  return (
    <group position={position}>
      {/* 1. EXPANDING COLLISION RINGS ON GROUND (Fitted flat) */}
      <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <mesh ref={ringRef}>
          <ringGeometry args={[0.8, 0.95, 32]} />
          <meshBasicMaterial color="#FF3B3B" transparent opacity={0.8} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
        
        <mesh ref={ringRef2}>
          <ringGeometry args={[0.8, 0.95, 32]} />
          <meshBasicMaterial color="#FFB347" transparent opacity={0.5} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 2. GROUND PIN SPOTLIGHT */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial color="#FF3B3B" transparent opacity={0.3} />
      </mesh>

      {/* 3. VERTICAL INDICATOR LINE */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 1.4, 8]} />
        <meshBasicMaterial color="#FF3B3B" transparent opacity={0.5} />
      </mesh>

      {/* 4. BILLBOARD OVERLAY (Faces camera always) */}
      <Billboard position={[0, 1.8, 0]}>
        {/* Emoji Container Background */}
        <mesh position={[0, 0.4, 0]}>
          <planeGeometry args={[1.0, 1.0]} />
          <meshBasicMaterial color="#0A0F1E" transparent opacity={0.85} depthTest={false} />
        </mesh>
        
        {/* Border ring */}
        <mesh position={[0, 0.4, -0.01]}>
          <planeGeometry args={[1.08, 1.08]} />
          <meshBasicMaterial color="#FF3B3B" depthTest={false} />
        </mesh>

        {/* Emoji Text */}
        <Text
          fontSize={0.65}
          position={[0, 0.45, 0.02]}
          anchorX="center"
          anchorY="middle"
          depthTest={false}
        >
          {emoji}
        </Text>

        {/* Info panel */}
        <group position={[0, -0.3, 0]}>
          {/* Label Background */}
          <mesh>
            <planeGeometry args={[1.8, 0.55]} />
            <meshBasicMaterial color="#0F1829" transparent opacity={0.9} depthTest={false} />
          </mesh>
          
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[1.84, 0.59]} />
            <meshBasicMaterial color="#00D4FF" transparent opacity={0.4} depthTest={false} />
          </mesh>

          {/* Sighting details */}
          <Text
            fontSize={0.13}
            color="white"
            position={[0, 0.12, 0.01]}
            anchorX="center"
            anchorY="middle"
            font="var(--font-inter)"
            depthTest={false}
          >
            {`${type} (${count}x)`}
          </Text>

          <Text
            fontSize={0.1}
            color="#00D4FF"
            position={[0, -0.12, 0.01]}
            anchorX="center"
            anchorY="middle"
            font="var(--font-jetbrains-mono)"
            depthTest={false}
          >
            {`AI Conf: ${confidence}% | ${dataSource.toUpperCase()}`}
          </Text>
        </group>

        {/* DEMO DATA Badge (Always visible, yellow tag) */}
        <group position={[0, 1.05, 0]}>
          <mesh>
            <planeGeometry args={[1.1, 0.2]} />
            <meshBasicMaterial color="#FFB347" depthTest={false} />
          </mesh>
          <Text
            fontSize={0.08}
            color="black"
            position={[0, 0, 0.01]}
            anchorX="center"
            anchorY="middle"
            font="var(--font-jetbrains-mono)"
            fontWeight="bold"
            depthTest={false}
          >
            DEMO DATA
          </Text>
        </group>
      </Billboard>
    </group>
  );
}
