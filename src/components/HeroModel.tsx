import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

function InteractiveShape({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Smooth rotation based on mouse position
    const targetRotationY = mousePosition.x * Math.PI * 0.3;
    const targetRotationX = mousePosition.y * Math.PI * 0.3;

    // Lerp for smooth animation
    groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * 0.1;
    groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.1;

    // Add floating animation
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.3;

    // Gentle continuous rotation
    groupRef.current.rotation.z = state.clock.elapsedTime * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* Main crystalline dodecahedron */}
      <mesh>
        <dodecahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial
          color="#8b5cf6"
          metalness={0.8}
          roughness={0.2}
          emissive="#6d28d9"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Inner glowing core */}
      <mesh scale={0.6}>
        <icosahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial
          color="#c084fc"
          metalness={0.9}
          roughness={0.1}
          emissive="#a78bfa"
          emissiveIntensity={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Outer wireframe cage */}
      <mesh scale={1.1}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshBasicMaterial
          color="#e9d5ff"
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Floating particles/rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.02, 16, 100]} />
        <meshBasicMaterial
          color="#a78bfa"
          transparent
          opacity={0.3}
        />
      </mesh>

      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[2.2, 0.015, 16, 100]} />
        <meshBasicMaterial
          color="#c084fc"
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
}

export default function HeroModel() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
    });
  };

  return (
    <div 
      className="hero-model-container"
      onMouseMove={handleMouseMove}
    >
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} color="#8b5cf6" intensity={1} />
        <pointLight position={[5, 5, 5]} color="#a78bfa" intensity={0.5} />
        <Environment preset="city" />
        <InteractiveShape mousePosition={mousePosition} />
      </Canvas>
    </div>
  );
}
