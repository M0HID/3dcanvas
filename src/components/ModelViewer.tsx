import { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { fetchFileContent } from '../utils/github';
import { loadModel } from '../utils/modelLoader';

function CameraController({ model }: { model: THREE.Group | null }) {
  const { camera, controls } = useThree();

  useEffect(() => {
    if (!model || !controls) return;

    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Calculate the distance needed to fit the entire model
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

    // Add some padding (multiply by 1.5 for better initial view)
    cameraZ *= 1.5;

    // Position camera
    camera.position.set(cameraZ, cameraZ, cameraZ);
    camera.lookAt(center);

    // Update controls target to model center
    if (controls && 'target' in controls) {
      (controls as any).target.copy(center);
      (controls as any).update();
    }

    // Update camera
    camera.updateProjectionMatrix();
  }, [model, camera, controls]);

  return null;
}

export default function ModelViewer() {
  const { selectedFile, setModelComponents, setIsLoading, setError, modelComponents } = useStore();
  const modelRef = useRef<THREE.Group | null>(null);
  const [currentModel, setCurrentModel] = useState<THREE.Group | null>(null);

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
          setCurrentModel(model);
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
        <CameraController model={currentModel} />
        
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
