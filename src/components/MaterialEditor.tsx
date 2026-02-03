import { useState } from 'react';
import { useStore } from '../store/useStore';
import * as THREE from 'three';

export default function MaterialEditor() {
  const { modelComponents, setModelComponents } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const selectedComponent = modelComponents.find(c => c.selected);

  if (!selectedComponent || !(selectedComponent.mesh instanceof THREE.Mesh)) {
    return null;
  }

  const material = selectedComponent.mesh.material as THREE.MeshStandardMaterial;

  const handleColorChange = (color: string) => {
    material.color.set(color);
  };

  const handleMetalnessChange = (value: number) => {
    material.metalness = value;
  };

  const handleRoughnessChange = (value: number) => {
    material.roughness = value;
  };

  const handleOpacityChange = (value: number) => {
    material.opacity = value;
    material.transparent = value < 1;
  };

  const handleWireframeToggle = () => {
    material.wireframe = !material.wireframe;
    setModelComponents([...modelComponents]); // Force re-render
  };

  const handleFlatShadingToggle = () => {
    material.flatShading = !material.flatShading;
    material.needsUpdate = true;
    setModelComponents([...modelComponents]); // Force re-render
  };

  const colorHex = '#' + material.color.getHexString();

  return (
    <div className="material-editor">
      <button 
        className="material-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        🎨 Material Editor {isOpen ? '▼' : '▶'}
      </button>
      
      {isOpen && (
        <div className="material-controls">
          <div className="material-section">
            <label>Color</label>
            <input
              type="color"
              value={colorHex}
              onChange={(e) => handleColorChange(e.target.value)}
            />
          </div>

          <div className="material-section">
            <label>Metalness: {material.metalness.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={material.metalness}
              onChange={(e) => handleMetalnessChange(parseFloat(e.target.value))}
            />
          </div>

          <div className="material-section">
            <label>Roughness: {material.roughness.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={material.roughness}
              onChange={(e) => handleRoughnessChange(parseFloat(e.target.value))}
            />
          </div>

          <div className="material-section">
            <label>Opacity: {material.opacity.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={material.opacity}
              onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
            />
          </div>

          <div className="material-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={material.wireframe}
                onChange={handleWireframeToggle}
              />
              Wireframe Mode
            </label>
          </div>

          <div className="material-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={material.flatShading}
                onChange={handleFlatShadingToggle}
              />
              Flat Shading
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
