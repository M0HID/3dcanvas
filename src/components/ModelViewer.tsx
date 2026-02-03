import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { fetchFileContent } from '../utils/github';
import { loadModel } from '../utils/modelLoader';

export default function ModelViewer() {
  const { selectedFile, setModelComponents, setIsLoading, setError, modelComponents } = useStore();
  const modelRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!selectedFile) return;

    let isMounted = true;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        const content = await fetchFileContent(selectedFile!.url);
        const { model, components } = await loadModel(selectedFile!, content);

        if (isMounted) {
          modelRef.current = model;
          setModelComponents(components);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading model:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Failed to load model');
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [selectedFile, setModelComponents, setIsLoading, setError]);

  // Update component visibility
  useEffect(() => {
    if (!modelRef.current) return;

    modelComponents.forEach(component => {
      component.mesh.visible = component.visible;
    });
  }, [modelComponents]);

  return (
    <div className="model-viewer">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 5, 5]} />
        <OrbitControls makeDefault />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />
        
        {/* Environment */}
        <Environment preset="studio" />
        
        {/* Grid */}
        <Grid
          args={[20, 20]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#6b7280"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#9ca3af"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid
        />
        
        {/* Model */}
        {modelRef.current && <primitive object={modelRef.current} />}
      </Canvas>
    </div>
  );
}
