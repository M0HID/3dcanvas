import UrlInput from './components/UrlInput';
import FileExplorer from './components/FileExplorer';
import ComponentTree from './components/ComponentTree';
import ModelViewer from './components/ModelViewer';
import LoadingOverlay from './components/LoadingOverlay';
import { useStore } from './store/useStore';
import './App.css';

function App() {
  const { modelFiles, selectedFile } = useStore();

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">🧊</span>
          <h1>3DCanvas</h1>
        </div>
        <div className="header-content">
          <UrlInput />
        </div>
      </header>

      <div className="app-content">
        {modelFiles.length > 0 && (
          <aside className="sidebar">
            <FileExplorer />
            {selectedFile && <ComponentTree />}
          </aside>
        )}

        <main className="main-content">
          {selectedFile ? (
            <ModelViewer />
          ) : (
            <div className="empty-state">
              <div className="empty-state-content">
                <span className="empty-icon">🎨</span>
                <h2>Welcome to 3DCanvas</h2>
                <p>Paste a GitHub URL containing 3D models to get started</p>
                <div className="supported-formats">
                  <strong>Supported formats:</strong>
                  <div className="format-tags">
                    <span className="format-tag">STL</span>
                    <span className="format-tag">STEP</span>
                    <span className="format-tag">OBJ</span>
                    <span className="format-tag">GLTF</span>
                    <span className="format-tag">GLB</span>
                    <span className="format-tag">PLY</span>
                    <span className="format-tag">3MF</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <LoadingOverlay />
    </div>
  );
}

export default App;
