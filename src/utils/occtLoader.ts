// Wrapper for occt-import-js to properly configure WASM loading
// The library is loaded via script tag in index.html and exposes global 'occtimportjs'

declare global {
  interface Window {
    occtimportjs: (config?: any) => Promise<any>;
  }
}

let occtInstance: any = null;

export async function getOcctInstance() {
  if (occtInstance) {
    return occtInstance;
  }

  try {
    // Wait for the global function to be available
    if (typeof window.occtimportjs !== 'function') {
      throw new Error('occt-import-js library not loaded');
    }

    // Initialize with proper WASM path configuration
    occtInstance = await window.occtimportjs({
      locateFile: (path: string) => {
        // The WASM file is in the public directory
        if (path.endsWith('.wasm')) {
          return '/occt-import-js.wasm';
        }
        return path;
      }
    });

    return occtInstance;
  } catch (error) {
    console.error('Failed to initialize OCCT:', error);
    throw new Error(`Failed to initialize STEP file reader: ${error}`);
  }
}
