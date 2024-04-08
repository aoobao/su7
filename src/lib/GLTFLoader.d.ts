import { Loader } from "three";

export interface GLTF {
  animations: AnimationClip[];
  scene: Group;
  scenes: Group[];
  cameras: Camera[];
  asset: {
      copyright?: string | undefined;
      generator?: string | undefined;
      version?: string | undefined;
      minVersion?: string | undefined;
      extensions?: any;
      extras?: any;
  };
  parser: GLTFParser;
  userData: Record<string, any>;
}

export class GLTFLoader extends Loader<GLTF> {
  constructor(manager?: LoadingManager);
  dracoLoader: DRACOLoader | null;

  setDRACOLoader(dracoLoader: DRACOLoader): GLTFLoader;

  register(callback: (parser: GLTFParser) => GLTFLoaderPlugin): GLTFLoader;
  unregister(callback: (parser: GLTFParser) => GLTFLoaderPlugin): GLTFLoader;

  setKTX2Loader(ktx2Loader: KTX2Loader): GLTFLoader;
  setMeshoptDecoder(meshoptDecoder: /* MeshoptDecoder */ any): GLTFLoader;

  parse(
      data: ArrayBuffer | string,
      path: string,
      onLoad: (gltf: GLTF) => void,
      onError?: (event: ErrorEvent) => void,
  ): void;

  parseAsync(data: ArrayBuffer | string, path: string): Promise<GLTF>;
}