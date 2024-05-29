import { GLTF } from '@/lib/GLTFLoader'
import { parseGltfModel } from '@/utils/model-detail'
import { DoubleSide, ShaderMaterial, Vector4 } from 'three'
import { noiseFunc } from './speedup'
import { LineMaterial } from 'three/examples/jsm/Addons.js'
import { global } from '@/store/global'
import { REFLECT_LAYER } from '@/constants'

export const initLineCar = (gltf: GLTF) => {
  const data = parseGltfModel(gltf)

  const material = getMaterial()
  data.meshes.forEach(mesh => {
    mesh.material = material

    mesh.layers.enable(REFLECT_LAYER)
  })

  return {
    lineCarMaterial: material
  }
}

function getMaterial() {
  const vertexShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec3 vPositionW;
  varying vec3 vPositionObj;
  varying vec3 vNormalW;
  attribute vec3 color;
  varying vec3 vColor;
  varying vec3 vViewPosition;
  varying vec4 viewerUV;
  
  #ifdef USE_INSTANCING
    varying vec3 vPositionIns;
    varying vec3 vPositionInsModel;
    varying vec3 vInstanceColor;
    attribute vec3 instanceColor; // 实例化颜色属性
  #endif
  
  void main() {
      vPosition = position;
      vNormal = normalMatrix * normal;
      vPositionW = vec3( modelMatrix*vec4( position, 1.0 ));
      vPositionObj = vec3( modelMatrix*vec4( vec3(0.), 1.0 ));
      vNormalW = normalize( vec3( vec4( normal, 0.0 ) * modelMatrix ) );
      vUv = uv;
      vColor=color;
  
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
  
      #ifdef USE_INSTANCING
        vPositionInsModel = position;
        vPositionIns = vec3(instanceMatrix * vec4(vec3(0.),1.));
        vPositionW = vec3(instanceMatrix * vec4(vPositionW,1.));
        vPosition = vec3(instanceMatrix * vec4(vPosition,1.));
        vInstanceColor = instanceColor;
      #endif
      
      gl_Position = projectionMatrix * mvPosition;
      viewerUV = vec4((gl_Position.xyz / gl_Position.w).xy* 0.5 + 0.5,0.,1.);
  }`
  const fragmentShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec3 vPositionW;
  varying vec3 vNormalW;
  varying vec3 vColor;

  uniform float time;
  uniform float opacity;
  uniform vec4 vNoiseParams_wave;
  ${noiseFunc}

  void main() {
    float noiseMask_alpha = noise2d((vUv+vec2(time*vNoiseParams_wave.w,0.))*vNoiseParams_wave.xy)*vNoiseParams_wave.z;
    float mask = noiseMask_alpha*(smoothstep(0.05,0.4,vUv.x))*(1.-smoothstep(0.6,0.95,vUv.x));
    mask = clamp( mask*(smoothstep(0.05,0.4,vUv.y))*(1.-smoothstep(0.6,0.95,vUv.y)),0.,1.0);
    gl_FragColor = vec4(vec3(vColor*2.),mask*opacity);
}
  `
  const material = new ShaderMaterial({
    name: 'm_linecar',
    uniforms: {
      time: global.uTime,
      opacity: { value: 1 },
      vNoiseParams_wave: { value: new Vector4(1, 20, 10, 1.2) }
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    side: DoubleSide
  })

  return material
}
