import { useStore } from '../store/useStore';
import { Box, Settings, Gem, Sparkles, File } from 'lucide-react';

export default function FileExplorer() {
  const { modelFiles, selectedFile, setSelectedFile } = useStore();

  if (modelFiles.length === 0) {
    return null;
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      stl: Box,
      step: Settings,
      stp: Settings,
      obj: Gem,
      gltf: Sparkles,
      glb: Sparkles,
      ply: Gem,
      '3mf': Box
    };
    const IconComponent = iconMap[type] || File;
    return <IconComponent size={18} />;
  };

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <h3>Files</h3>
        <span className="file-count">{modelFiles.length}</span>
      </div>
      <div className="file-list">
        {modelFiles.map((file) => (
          <div
            key={file.path}
            className={`file-item ${selectedFile?.path === file.path ? 'selected' : ''}`}
            onClick={() => setSelectedFile(file)}
          >
            <span className="file-icon">{getFileIcon(file.type)}</span>
            <div className="file-info">
              <div className="file-name">{file.name}</div>
              <div className="file-meta">
                <span className="file-type">{file.type.toUpperCase()}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
