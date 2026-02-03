import { useState } from 'react';
import UrlInput from './components/UrlInput';
import FileExplorer from './components/FileExplorer';
import ComponentTree from './components/ComponentTree';
import ModelViewer from './components/ModelViewer';
import LoadingOverlay from './components/LoadingOverlay';
import LandingPage from './components/LandingPage';
import { useStore } from './store/useStore';
import { Box } from 'lucide-react';
import './App.css';

function App() {
  const { modelFiles, selectedFile } = useStore();
  const [showViewer, setShowViewer] = useState(false);

  // Show landing page if no models loaded yet
  if (!showViewer && modelFiles.length === 0) {
    return (
      <>
        <LandingPage onLoaded={() => setShowViewer(true)} />
        <LoadingOverlay />
      </>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <Box size={24} className="logo-icon" />
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
                <Box size={64} className="empty-icon" />
                <h2>Welcome to 3DCanvas</h2>
                <p>Select a file from the sidebar to view it</p>
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
