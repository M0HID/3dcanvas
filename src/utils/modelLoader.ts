import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import type { ModelFile, ModelComponent } from '../store/useStore';

export async function loadModel(
  file: ModelFile,
  content: ArrayBuffer
): Promise<{ model: THREE.Group; components: ModelComponent[] }> {
  switch (file.type) {
    case 'stl':
      return loadSTL(content, new STLLoader());
    case 'obj':
      return loadOBJ(content, new OBJLoader());
    case 'gltf':
    case 'glb':
      return loadGLTF(content, new GLTFLoader());
    case 'ply':
      return loadPLY(content, new PLYLoader());
    case 'step':
    case 'stp':
      return loadSTEP(content);
    default:
      throw new Error(`Unsupported file type: ${file.type}`);
  }
}



async function loadSTL(
  content: ArrayBuffer,
  loader: STLLoader
): Promise<{ model: THREE.Group; components: ModelComponent[] }> {
  return new Promise((resolve, reject) => {
    try {
      const geometry = loader.parse(content);
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x606060,
        metalness: 0.3,
        roughness: 0.4,
        flatShading: false
      });
      const mesh = new THREE.Mesh(geometry, material);
      
      // Center the geometry
      geometry.computeBoundingBox();
      const center = new THREE.Vector3();
      geometry.boundingBox?.getCenter(center);
      geometry.translate(-center.x, -center.y, -center.z);
      
      const group = new THREE.Group();
      group.add(mesh);
      
      const components: ModelComponent[] = [{
        id: 'stl-0',
        name: 'STL Model',
        mesh: mesh,
        visible: true,
        selected: false
      }];
      
      resolve({ model: group, components });
    } catch (error) {
      reject(error);
    }
  });
}

async function loadOBJ(
  content: ArrayBuffer,
  loader: OBJLoader
): Promise<{ model: THREE.Group; components: ModelComponent[] }> {
  return new Promise((resolve, reject) => {
    try {
      const text = new TextDecoder().decode(content);
      const object = loader.parse(text);
      
      const components: ModelComponent[] = [];
      let idx = 0;
      
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (!child.material) {
            child.material = new THREE.MeshStandardMaterial({ 
              color: 0x606060,
              metalness: 0.3,
              roughness: 0.4
            });
          }
          
          components.push({
            id: `obj-${idx}`,
            name: child.name || `Component ${idx}`,
            mesh: child,
            visible: true,
            selected: false
          });
          idx++;
        }
      });
      
      // Center the model
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      object.position.sub(center);
      
      resolve({ model: object, components });
    } catch (error) {
      reject(error);
    }
  });
}

async function loadGLTF(
  content: ArrayBuffer,
  loader: GLTFLoader
): Promise<{ model: THREE.Group; components: ModelComponent[] }> {
  return new Promise((resolve, reject) => {
    loader.parse(
      content,
      '',
      (gltf) => {
        const scene = gltf.scene;
        const components: ModelComponent[] = [];
        let idx = 0;
        
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            components.push({
              id: `gltf-${idx}`,
              name: child.name || `Component ${idx}`,
              mesh: child,
              visible: true,
              selected: false
            });
            idx++;
          }
        });
        
        // Center the model
        const box = new THREE.Box3().setFromObject(scene);
        const center = box.getCenter(new THREE.Vector3());
        scene.position.sub(center);
        
        resolve({ model: scene, components });
      },
      reject
    );
  });
}

async function loadPLY(
  content: ArrayBuffer,
  loader: PLYLoader
): Promise<{ model: THREE.Group; components: ModelComponent[] }> {
  return new Promise((resolve, reject) => {
    try {
      const geometry = loader.parse(content);
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x606060,
        metalness: 0.3,
        roughness: 0.4,
        vertexColors: true
      });
      const mesh = new THREE.Mesh(geometry, material);
      
      // Center the geometry
      geometry.computeBoundingBox();
      const center = new THREE.Vector3();
      geometry.boundingBox?.getCenter(center);
      geometry.translate(-center.x, -center.y, -center.z);
      
      const group = new THREE.Group();
      group.add(mesh);
      
      const components: ModelComponent[] = [{
        id: 'ply-0',
        name: 'PLY Model',
        mesh: mesh,
        visible: true,
        selected: false
      }];
      
      resolve({ model: group, components });
    } catch (error) {
      reject(error);
    }
  });
}

async function loadSTEP(
  content: ArrayBuffer
): Promise<{ model: THREE.Group; components: ModelComponent[] }> {
  try {
    // For STEP files, we'll use occt-import-js
    // This is a placeholder - STEP parsing is complex
    const occt = await import('occt-import-js');
    
    // Initialize OCCT
    const occModule = await occt.default();
    
    // Parse STEP file
    const fileBuffer = new Uint8Array(content);
    const result = occModule.ReadStepFile(fileBuffer, null);
    
    if (!result.success) {
      throw new Error('Failed to parse STEP file');
    }
    
    const group = new THREE.Group();
    const components: ModelComponent[] = [];
    
    // Convert OCCT shapes to Three.js meshes
    result.meshes.forEach((meshData: any, idx: number) => {
      const geometry = new THREE.BufferGeometry();
      
      geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(meshData.attributes.position.array, 3)
      );
      
      if (meshData.attributes.normal) {
        geometry.setAttribute(
          'normal',
          new THREE.Float32BufferAttribute(meshData.attributes.normal.array, 3)
        );
      }
      
      if (meshData.index) {
        geometry.setIndex(new THREE.Uint32BufferAttribute(meshData.index.array, 1));
      }
      
      const material = new THREE.MeshStandardMaterial({
        color: meshData.color || 0x606060,
        metalness: 0.3,
        roughness: 0.4,
        side: THREE.DoubleSide
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = meshData.name || `Part ${idx}`;
      group.add(mesh);
      
      components.push({
        id: `step-${idx}`,
        name: mesh.name,
        mesh: mesh,
        visible: true,
        selected: false
      });
    });
    
    // Center the model
    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    group.position.sub(center);
    
    return { model: group, components };
  } catch (error) {
    console.error('Error loading STEP file:', error);
    // Fallback: create a simple placeholder
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    const group = new THREE.Group();
    group.add(mesh);
    
    return {
      model: group,
      components: [{
        id: 'step-error',
        name: 'STEP Load Error',
        mesh: mesh,
        visible: true,
        selected: false
      }]
    };
  }
}
