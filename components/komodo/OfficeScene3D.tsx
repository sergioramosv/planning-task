"use client";

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Environment3D } from './3d/Environment3D';
import styles from './OfficeScene3D.module.css';

interface OfficeScene3DProps {
  agents: any;
}

export function OfficeScene3D({ agents }: OfficeScene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const isVisible = dimensions.width > 0 && dimensions.height > 0;

  return (
    <div className={styles.container} ref={containerRef}>
      {isVisible && (
        <Canvas shadows key={`${dimensions.width}-${dimensions.height}`}>
        <OrthographicCamera
          makeDefault
          position={[20, 20, 20]}
          zoom={35}
          near={-100}
          far={100}
        />

        <OrbitControls
          enablePan={false}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2.1}
          minZoom={20}
          maxZoom={80}
        />

        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />

        <Suspense fallback={null}>
          <Environment3D agents={agents} />
        </Suspense>
      </Canvas>
      )}
    </div>
  );
}
