import { useState } from 'react';
import { useStore } from '../store/useStore';
import { isGithubUrl, fetchRepositoryFiles } from '../utils/github';
import HeroModel from './HeroModel';
import { Palette, Box, Layers, Github } from 'lucide-react';

export default function LandingPage({ onLoaded }: { onLoaded: () => void }) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setGithubUrl, setModelFiles, setIsLoading: setGlobalLoading, setError: setGlobalError } = useStore();

  const handleSubmit = async () => {
    if (!inputValue) return;

    if (!isGithubUrl(inputValue)) {
      setError('Please enter a valid GitHub URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGithubUrl(inputValue);
    setGlobalLoading(true);
    setGlobalError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 0));
      const store = useStore.getState();
      const files = await fetchRepositoryFiles(
        store.repoOwner,
        store.repoName,
        store.repoBranch,
        store.repoPath
      );

      if (files.length === 0) {
        setError('No 3D model files found in this repository');
        setIsLoading(false);
      } else {
        setModelFiles(files);
        setGlobalLoading(false);
        onLoaded();
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch files');
      setIsLoading(false);
      setGlobalLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="landing-page">
      <div className="landing-container">
        {/* Left Side - Content */}
        <div className="landing-left">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="gradient-text">3DCanvas</span>
            </h1>
            <p className="hero-subtitle">
              View and explore 3D models directly from GitHub repositories
            </p>
            <p className="hero-description">
              Paste any GitHub URL containing 3D files. No downloads, no installations, no hassle.
            </p>

            <div className="input-section">
              <div className="url-input-wrapper-landing">
                <input
                  type="text"
                  className="url-input-landing"
                  placeholder="https://github.com/username/repo"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                />
                <button 
                  className="submit-button-landing"
                  onClick={handleSubmit}
                  disabled={!inputValue || isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner"></span>
                      Loading...
                    </>
                  ) : (
                    'Explore →'
                  )}
                </button>
              </div>
              {error && <div className="error-text">{error}</div>}
            </div>

            <div className="features">
              <div className="feature-item">
                <Palette size={20} className="feature-icon" />
                <span>Material Editor</span>
              </div>
              <div className="feature-item">
                <Layers size={20} className="feature-icon" />
                <span>Component Tree</span>
              </div>
              <div className="feature-item">
                <Box size={20} className="feature-icon" />
                <span>Multiple Formats</span>
              </div>
            </div>

            <div className="supported-formats">
              <p className="formats-label">Supported formats:</p>
              <div className="format-tags">
                <span className="format-tag">STL</span>
                <span className="format-tag">STEP</span>
                <span className="format-tag">OBJ</span>
                <span className="format-tag">GLTF</span>
                <span className="format-tag">GLB</span>
                <span className="format-tag">PLY</span>
              </div>
            </div>

            <div className="opensource-badge">
              <Github size={16} />
              <span>Open Source</span>
              <a href="https://github.com/M0HID/3dcanvas" target="_blank" rel="noopener noreferrer" className="github-link">
                View on GitHub →
              </a>
            </div>
          </div>
        </div>

        {/* Right Side - Interactive 3D Model */}
        <div className="landing-right">
          <HeroModel />
          <div className="model-hint">
            <p>Move your mouse to interact</p>
          </div>
        </div>
      </div>
    </div>
  );
}
