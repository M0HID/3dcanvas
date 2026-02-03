import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

function InteractiveShape({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const meshRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (!meshRef.current) return;

    // Smooth rotation based on mouse position
    targetRotation.current.x = mousePosition.y * 0.5;
    targetRotation.current.y = mousePosition.x * 0.5;

    // Lerp for smooth animation
    meshRef.current.rotation.x += (targetRotation.current.x - meshRef.current.rotation.x) * 0.05;
    meshRef.current.rotation.y += (targetRotation.current.y - meshRef.current.rotation.y) * 0.05;

    // Add floating animation
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
  });

  return (
    <group ref={meshRef}>
      {/* Low-poly crystal/gem shape */}
      <mesh position={[0, 0, 0]}>
        <octahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial
          color="#8b5cf6"
          metalness={0.7}
          roughness={0.2}
          emissive="#6d28d9"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Inner glow */}
      <mesh position={[0, 0, 0]} scale={0.8}>
        <octahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial
          color="#a78bfa"
          metalness={0.9}
          roughness={0.1}
          emissive="#8b5cf6"
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh position={[0, 0, 0]}>
        <octahedronGeometry args={[1.52, 0]} />
        <meshBasicMaterial
          color="#a78bfa"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

export default function HeroModel() {
  const mousePosition = useRef({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mousePosition.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
    };
  };

  return (
    <div 
      className="hero-model-container"
      onMouseMove={handleMouseMove}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} color="#8b5cf6" intensity={0.5} />
        <Environment preset="city" />
        <InteractiveShape mousePosition={mousePosition.current} />
      </Canvas>
    </div>
  );
}
