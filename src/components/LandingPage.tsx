import { useState } from 'react';
import { useStore } from '../store/useStore';
import { isGithubUrl, fetchRepositoryFiles } from '../utils/github';
import HeroModel from './HeroModel';

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
                <span className="feature-icon">🎨</span>
                <span>Material Editor</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔧</span>
                <span>Component Tree</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📦</span>
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
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
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
