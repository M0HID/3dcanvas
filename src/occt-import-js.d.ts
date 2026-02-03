declare module 'occt-import-js' {
  interface OCCTResult {
    success: boolean;
    meshes?: Array<{
      attributes: {
        position: {
          array: Float32Array;
        };
        normal?: {
          array: Float32Array;
        };
      };
      index?: {
        array: Uint32Array;
      };
      color?: number;
      name?: string;
    }>;
  }

  interface OCCTModule {
    ReadStepFile: (buffer: Uint8Array, options: any) => OCCTResult;
  }

  export default function (): Promise<OCCTModule>;
}
