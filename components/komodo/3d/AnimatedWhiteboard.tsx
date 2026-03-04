"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';
import * as THREE from 'three';

export function AnimatedWhiteboard({ position, rotation, isDrawing }: { position: [number, number, number], rotation: [number, number, number], isDrawing: boolean }) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (isDrawing && materialRef.current) {
      materialRef.current.emissiveIntensity = 0.2 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
    } else if (materialRef.current) {
      materialRef.current.emissiveIntensity = 0;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <Box args={[3, 2, 0.1]} position={[0, 1.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial ref={materialRef} color="#ffffff" emissive="#bbffbb" emissiveIntensity={0} />
      </Box>
      <Box args={[3.2, 2.2, 0.05]} position={[0, 1.5, -0.05]} castShadow receiveShadow>
        <meshStandardMaterial color="#8B4513" />
      </Box>
    </group>
  );
}
