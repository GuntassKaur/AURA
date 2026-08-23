'use client';

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useSystemStore } from '@/store/useSystemStore';

function CoreMesh({ scale = 1.0 }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const { orbState: state } = useSystemStore();

  useFrame((clockState) => {
    const elapsed = clockState.clock.getElapsedTime();

    if (meshRef.current) {
      meshRef.current.rotation.y = elapsed * 0.08;
      
      let targetScale = scale;
      if (state === 'thinking' || state === 'uploading' || state === 'searching') {
        targetScale = scale * (1.0 + Math.sin(elapsed * 4) * 0.04);
      } else if (state === 'success') {
        targetScale = scale * 1.06;
      } else {
        targetScale = scale * (1.0 + Math.sin(elapsed * 1.5) * 0.02);
      }
      
      meshRef.current.scale.set(targetScale, targetScale, targetScale);

      if (auraRef.current) {
        auraRef.current.rotation.y = -elapsed * 0.05;
        const auraScale = targetScale * 1.25;
        auraRef.current.scale.set(auraScale, auraScale, auraScale);
      }
    }
  });

  return (
    <group>
      {/* Inner Living Core — Soft Warm White */}
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={scale}>
        <MeshDistortMaterial
          color="#F2F2F5"
          roughness={0.15}
          metalness={0.4}
          distort={0.2}
          speed={1.0}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </Sphere>

      {/* Outer Subtle Indigo Aura */}
      <Sphere ref={auraRef} args={[1, 48, 48]} scale={scale * 1.25}>
        <meshPhysicalMaterial
          color="#6C6FFF"
          transparent
          opacity={0.25}
          roughness={0.1}
          metalness={0.1}
          transmission={0.9}
          thickness={0.5}
        />
      </Sphere>
    </group>
  );
}

interface OrbitCoreProps {
  scale?: number;
}

export default function OrbitCore({ scale = 1.0 }: OrbitCoreProps) {
  return (
    <div className="w-full h-full aspect-square relative flex items-center justify-center overflow-hidden pointer-events-none">
      <Suspense fallback={
        <div className="w-4 h-4 rounded-full bg-accent-primary/40 animate-ping" />
      }>
        <Canvas camera={{ position: [0, 0, 3.5], fov: 40 }} className="w-full h-full">
          <ambientLight intensity={1.1} />
          <pointLight position={[5, 5, 5]} intensity={1.4} color="#F2F2F5" />
          <directionalLight position={[-5, 5, -5]} intensity={0.8} color="#6C6FFF" />
          <CoreMesh scale={scale} />
        </Canvas>
      </Suspense>
    </div>
  );
}
