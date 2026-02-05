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
    const targetRotationX = -mousePosition.y * Math.PI * 0.3;

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
          color="#a78bfa"
          metalness={0.3}
          roughness={0.15}
          emissive="#8b5cf6"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Inner glowing core */}
      <mesh scale={0.6}>
        <icosahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial
          color="#c084fc"
          metalness={0.4}
          roughness={0.1}
          emissive="#c084fc"
          emissiveIntensity={1.2}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Outer wireframe cage */}
      <mesh scale={1.1}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshBasicMaterial
          color="#f3e8ff"
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Floating particles/rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.02, 16, 100]} />
        <meshBasicMaterial
          color="#c084fc"
          transparent
          opacity={0.5}
        />
      </mesh>

      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[2.2, 0.015, 16, 100]} />
        <meshBasicMaterial
          color="#e9d5ff"
          transparent
          opacity={0.4}
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
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-5, -5, -5]} intensity={0.8} color="#a78bfa" />
        <pointLight position={[-10, -10, -5]} color="#8b5cf6" intensity={1.5} />
        <pointLight position={[5, 5, 5]} color="#c084fc" intensity={1} />
        <spotLight position={[0, 10, 0]} intensity={1} color="#e9d5ff" />
        <Environment preset="city" />
        <InteractiveShape mousePosition={mousePosition} />
      </Canvas>
    </div>
  );
}
