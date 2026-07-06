'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface WAP7LocomotiveProps {
  speed: number;              // speed in km/h
  progress: number;           // progress along track curve (0 to 1)
  curve: THREE.CatmullRomCurve3; // track curve
  trainNumber: string;
  trainName: string;
  isNight?: boolean;
}

export default function WAP7Locomotive({
  speed,
  progress,
  curve,
  trainNumber,
  trainName,
  isNight = true
}: WAP7LocomotiveProps) {
  const trainRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Group[]>([]);
  const pantoRef = useRef<THREE.Group>(null);

  // Keep track of wheel rotation state across frames
  const wheelAngle = useRef(0);

  useFrame((state, delta) => {
    if (!trainRef.current || !curve) return;

    // 1. Move train along the CatmullRomCurve3 path based on progress
    // Ensure progress loops smoothly
    const t = progress % 1.0;
    const position = curve.getPointAt(t);
    trainRef.current.position.copy(position);

    // Look ahead slightly on the curve to rotate train in direction of travel
    const lookAheadT = Math.min(1.0, t + 0.002);
    const lookAtPos = curve.getPointAt(lookAheadT);
    trainRef.current.lookAt(lookAtPos);

    // 2. Wheel rotation proportional to speed and delta time
    const speedFactor = speed * 0.05; // scaling factor
    wheelAngle.current += speedFactor * delta;
    wheelsRef.current.forEach(wheel => {
      if (wheel) {
        wheel.rotation.z = -wheelAngle.current; // z-axis relative to wheel group rotation
      }
    });

    // 3. Subtle train rocking motion (swaying side to side on the tracks)
    const sway = Math.sin(state.clock.getElapsedTime() * 4) * 0.012;
    trainRef.current.rotation.z = sway;

    // 4. Slight vertical vibration
    const vibration = Math.sin(state.clock.getElapsedTime() * 32) * 0.002;
    trainRef.current.position.y += vibration;
  });

  // Helper arrays for wheel positions on a single bogie
  // X offset from bogie center, Z offset from center (left or right side)
  const WHEEL_OFFSETS = [
    { x: -0.8, z: 0.85 }, { x: 0, z: 0.85 }, { x: 0.8, z: 0.85 }, // Left wheels
    { x: -0.8, z: -0.85 }, { x: 0, z: -0.85 }, { x: 0.8, z: -0.85 } // Right wheels
  ];

  return (
    <group ref={trainRef}>
      {/* 
        Train Heading Vector Helper:
        We build the train model facing towards +Z, so that lookAt works correctly.
        Standard Three.js curves make lookAt face the tangent.
      */}
      <group rotation={[0, Math.PI / 2, 0]}>
        
        {/* MAIN BLUE LOCO BODY */}
        <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.5, 1.8, 1.7]} />
          <meshStandardMaterial 
            color="#1E3A5F" // Indian Railways WAP-7 Blue
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>

        {/* SILVER STRIPE ON BODY SIDE */}
        <mesh position={[0, 0.95, 0]}>
          <boxGeometry args={[6.52, 0.15, 1.72]} />
          <meshStandardMaterial color="#CCCCCC" metalness={0.8} roughness={0.1} />
        </mesh>

        {/* YELLOW HAZARD ACCENTS ON NOSE (FRONT) */}
        <mesh position={[3.26, 0.7, 0]} castShadow>
          <boxGeometry args={[0.02, 0.4, 1.71]} />
          <meshStandardMaterial color="#FFD700" roughness={0.3} />
        </mesh>
        
        {/* YELLOW HAZARD ACCENTS ON NOSE (REAR) */}
        <mesh position={[-3.26, 0.7, 0]} castShadow>
          <boxGeometry args={[0.02, 0.4, 1.71]} />
          <meshStandardMaterial color="#FFD700" roughness={0.3} />
        </mesh>

        {/* DRIVER CAB OVERHANGS / WINDSHIELD REGIONS */}
        {/* Front Cab */}
        <group position={[2.7, 1.45, 0]}>
          <mesh position={[0.2, 0.1, 0]}>
            <boxGeometry args={[0.4, 0.8, 1.5]} />
            <meshStandardMaterial color="#14263E" metalness={0.7} />
          </mesh>
          {/* Front Cab Glass */}
          <mesh position={[0.41, 0.2, 0]}>
            <planeGeometry args={[0.1, 0.4]} />
            <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} emissive="#87CEEB" emissiveIntensity={0.2} />
          </mesh>
        </group>
        {/* Rear Cab */}
        <group position={[-2.7, 1.45, 0]}>
          <mesh position={[-0.2, 0.1, 0]}>
            <boxGeometry args={[0.4, 0.8, 1.5]} />
            <meshStandardMaterial color="#14263E" metalness={0.7} />
          </mesh>
          {/* Rear Cab Glass */}
          <mesh position={[-0.41, 0.2, 0]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[0.1, 0.4]} />
            <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} emissive="#87CEEB" emissiveIntensity={0.2} />
          </mesh>
        </group>

        {/* ROOF STRUCTURE */}
        <mesh position={[0, 2.2, 0]} castShadow>
          <boxGeometry args={[5.8, 0.15, 1.5]} />
          <meshStandardMaterial color="#4A4A4A" metalness={0.8} roughness={0.4} />
        </mesh>

        {/* PANTOGRAPHS (Roof mounted wire frames) */}
        {/* Front Pantograph */}
        <group position={[1.8, 2.35, 0]} ref={pantoRef}>
          <mesh rotation={[0, 0, Math.PI / 6]}>
            <boxGeometry args={[0.06, 0.6, 0.8]} />
            <meshStandardMaterial color="#888888" metalness={0.9} />
          </mesh>
          <mesh position={[0.26, 0.25, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.06, 0.7, 0.8]} />
            <meshStandardMaterial color="#888888" metalness={0.9} />
          </mesh>
          {/* Top contact plate */}
          <mesh position={[0.02, 0.5, 0]}>
            <boxGeometry args={[0.1, 0.04, 1.1]} />
            <meshStandardMaterial color="#555555" metalness={0.9} />
          </mesh>
        </group>
        
        {/* Rear Pantograph */}
        <group position={[-1.8, 2.35, 0]}>
          <mesh rotation={[0, 0, -Math.PI / 6]}>
            <boxGeometry args={[0.06, 0.6, 0.8]} />
            <meshStandardMaterial color="#888888" metalness={0.9} />
          </mesh>
          <mesh position={[-0.26, 0.25, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.06, 0.7, 0.8]} />
            <meshStandardMaterial color="#888888" metalness={0.9} />
          </mesh>
          {/* Top contact plate */}
          <mesh position={[-0.02, 0.5, 0]}>
            <boxGeometry args={[0.1, 0.04, 1.1]} />
            <meshStandardMaterial color="#555555" metalness={0.9} />
          </mesh>
        </group>

        {/* SIDE BRANDING TEXT "INDIAN RAILWAYS" */}
        <group position={[0, 1.25, 0.86]} rotation={[0, 0, 0]}>
          <Text
            fontSize={0.24}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="var(--font-jetbrains-mono)"
          >
            INDIAN RAILWAYS
          </Text>
        </group>
        
        <group position={[0, 1.25, -0.86]} rotation={[0, Math.PI, 0]}>
          <Text
            fontSize={0.24}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="var(--font-jetbrains-mono)"
          >
            INDIAN RAILWAYS
          </Text>
        </group>

        {/* FRONT & REAR NUMBER PLATES */}
        {/* Front Plate */}
        <group position={[3.27, 1.05, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <planeGeometry args={[1.2, 0.25]} />
            <meshBasicMaterial color="black" />
          </mesh>
          <Text
            fontSize={0.13}
            color="#00D4FF"
            anchorX="center"
            anchorY="middle"
            position={[0, 0, 0.01]}
            font="var(--font-jetbrains-mono)"
          >
            {`WAP-7 / ${trainNumber}`}
          </Text>
        </group>
        {/* Rear Plate */}
        <group position={[-3.27, 1.05, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh>
            <planeGeometry args={[1.2, 0.25]} />
            <meshBasicMaterial color="black" />
          </mesh>
          <Text
            fontSize={0.13}
            color="#00D4FF"
            anchorX="center"
            anchorY="middle"
            position={[0, 0, 0.01]}
            font="var(--font-jetbrains-mono)"
          >
            {`WAP-7 / ${trainNumber}`}
          </Text>
        </group>

        {/* CAB SIDE LABELS */}
        <group position={[2.5, 0.95, 0.86]} rotation={[0, 0, 0]}>
          <Text fontSize={0.12} color="#FFFF00" font="var(--font-jetbrains-mono)">RPM</Text>
        </group>
        <group position={[-2.5, 0.95, 0.86]} rotation={[0, 0, 0]}>
          <Text fontSize={0.12} color="#FFFF00" font="var(--font-jetbrains-mono)">RPM</Text>
        </group>

        {/* BOGIES AND WHEELS UNDERNEATH */}
        {/* Front Bogie */}
        <group position={[1.8, 0.2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[2.4, 0.3, 1.5]} />
            <meshStandardMaterial color="#222222" roughness={0.9} />
          </mesh>
          {/* Bogie Wheels */}
          {WHEEL_OFFSETS.map((offset, index) => (
            <group 
              key={`front-wheel-${index}`} 
              position={[offset.x, 0, offset.z]} 
              ref={el => { if (el) wheelsRef.current[index] = el; }}
            >
              <mesh castShadow>
                {/* Cylinder args: radiusTop, radiusBottom, height, radialSegments */}
                <cylinderGeometry args={[0.33, 0.33, 0.16, 16]} />
                <meshStandardMaterial color="#111111" metalness={0.7} roughness={0.4} />
              </mesh>
              {/* Inner Silver Rim */}
              <mesh position={[0, 0.09, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.01, 8]} />
                <meshBasicMaterial color="#777777" />
              </mesh>
              <mesh position={[0, -0.09, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.01, 8]} />
                <meshBasicMaterial color="#777777" />
              </mesh>
            </group>
          ))}
        </group>

        {/* Rear Bogie */}
        <group position={[-1.8, 0.2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[2.4, 0.3, 1.5]} />
            <meshStandardMaterial color="#222222" roughness={0.9} />
          </mesh>
          {/* Bogie Wheels */}
          {WHEEL_OFFSETS.map((offset, index) => (
            <group 
              key={`rear-wheel-${index}`} 
              position={[offset.x, 0, offset.z]} 
              ref={el => { if (el) wheelsRef.current[index + 6] = el; }}
            >
              <mesh castShadow>
                <cylinderGeometry args={[0.33, 0.33, 0.16, 16]} />
                <meshStandardMaterial color="#111111" metalness={0.7} roughness={0.4} />
              </mesh>
              <mesh position={[0, 0.09, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.01, 8]} />
                <meshBasicMaterial color="#777777" />
              </mesh>
              <mesh position={[0, -0.09, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.01, 8]} />
                <meshBasicMaterial color="#777777" />
              </mesh>
            </group>
          ))}
        </group>

        {/* LIGHTS AND CONES */}
        {/* Headlight Front */}
        <group position={[3.25, 0.7, 0]}>
          <mesh>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial color="#FFFFEE" />
          </mesh>
          {/* Active PointLight at night */}
          <pointLight 
            intensity={isNight ? 5 : 0.5} 
            distance={15} 
            color="#FFFFAA" 
            position={[0.2, 0, 0]} 
            castShadow
          />
          {/* SpotLight representing headlight beam */}
          <spotLight
            intensity={isNight ? 12 : 2}
            distance={40}
            angle={Math.PI / 6}
            penumbra={0.5}
            position={[0.1, 0, 0]}
            target-position={[30, 0, 0]}
            color="#FFFFAA"
            castShadow
          />
        </group>
        
        {/* Marker lights (red rear lights) */}
        <group position={[-3.25, 1.4, 0.5]}>
          <mesh>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="red" />
          </mesh>
        </group>
        <group position={[-3.25, 1.4, -0.5]}>
          <mesh>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="red" />
          </mesh>
        </group>

      </group>
    </group>
  );
}
