import { useStore } from '../store/useStore';

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
    const icons: Record<string, string> = {
      stl: '📦',
      step: '⚙️',
      stp: '⚙️',
      obj: '🔷',
      gltf: '✨',
      glb: '✨',
      ply: '◆',
      '3mf': '🔶'
    };
    return icons[type] || '📄';
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
