import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { isGithubUrl, fetchRepositoryFiles } from '../utils/github';

export default function UrlInput() {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { 
    setGithubUrl, 
    repoOwner, 
    repoName, 
    repoBranch, 
    repoPath,
    setModelFiles, 
    setIsLoading, 
    setError 
  } = useStore();

  // Auto-paste detection
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      // Only auto-paste if no input is focused
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const pastedText = e.clipboardData?.getData('text');
      if (pastedText && isGithubUrl(pastedText)) {
        setInputValue(pastedText);
        await handleSubmit(pastedText);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (url?: string) => {
    const urlToProcess = url || inputValue;
    
    if (!urlToProcess) return;

    if (!isGithubUrl(urlToProcess)) {
      setError('Please enter a valid GitHub URL');
      return;
    }

    setGithubUrl(urlToProcess);
    setIsLoading(true);
    setError(null);

    try {
      // Wait for store to update
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Get the parsed values from the URL
      const store = useStore.getState();
      const files = await fetchRepositoryFiles(
        store.repoOwner,
        store.repoName,
        store.repoBranch,
        store.repoPath
      );

      if (files.length === 0) {
        setError('No 3D model files found in this repository');
      } else {
        setModelFiles(files);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch files');
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="url-input-container">
      <div className="url-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="url-input"
          placeholder="Paste GitHub URL (or Ctrl+V anywhere)..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button 
          className="submit-button"
          onClick={() => handleSubmit()}
          disabled={!inputValue}
        >
          Load
        </button>
      </div>
      {repoOwner && repoName && (
        <div className="repo-info">
          📦 {repoOwner}/{repoName}
          {repoBranch && repoBranch !== 'main' && ` @ ${repoBranch}`}
          {repoPath && ` / ${repoPath}`}
        </div>
      )}
    </div>
  );
}
