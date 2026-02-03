import type { ModelFile } from '../store/useStore';

const GITHUB_API_BASE = 'https://api.github.com';
const SUPPORTED_EXTENSIONS = ['.stl', '.step', '.stp', '.obj', '.gltf', '.glb', '.ply', '.3mf'];

export async function fetchRepositoryFiles(
  owner: string,
  repo: string,
  branch: string = 'main',
  path: string = ''
): Promise<ModelFile[]> {
  try {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const modelFiles: ModelFile[] = [];
    
    // Handle both single files and directories
    const items = Array.isArray(data) ? data : [data];
    
    for (const item of items) {
      if (item.type === 'file') {
        const ext = getFileExtension(item.name);
        if (ext && SUPPORTED_EXTENSIONS.includes(ext)) {
          modelFiles.push({
            name: item.name,
            path: item.path,
            url: item.download_url,
            type: ext.slice(1) as ModelFile['type'],
            size: item.size
          });
        }
      } else if (item.type === 'dir') {
        // Recursively fetch files from subdirectories
        const subFiles = await fetchRepositoryFiles(owner, repo, branch, item.path);
        modelFiles.push(...subFiles);
      }
    }
    
    return modelFiles;
  } catch (error) {
    console.error('Error fetching repository files:', error);
    throw error;
  }
}

export async function fetchFileContent(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
  }
  return response.arrayBuffer();
}

function getFileExtension(filename: string): string | null {
  const match = filename.match(/\.[^.]+$/);
  return match ? match[0].toLowerCase() : null;
}

export function isGithubUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'github.com' || urlObj.hostname === 'www.github.com';
  } catch {
    return false;
  }
}
