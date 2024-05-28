import { GLTF } from '@/lib/GLTFLoader'
import { parseGltfModel } from '@/utils/model-detail'
import { noiseFunc } from './speedup'
import { Color, DoubleSide, ShaderMaterial, Texture, Vector4 } from 'three'
import { ENVIRONMENT_LAYER, REFLECT_LAYER } from '@/constants'
import { global } from '@/store/global'

export const initWindSpeed = (gltf: GLTF, lineTexture: Texture) => {
  const data = parseGltfModel(gltf)

  const mesh = data.meshes[0]

  const material = getMaterial(lineTexture)

  mesh.material = material

  mesh.layers.enable(REFLECT_LAYER)
  mesh.layers.enable(ENVIRONMENT_LAYER)

  return {
    windSpeed: mesh,
    windMaterial: material
  }
}

function getMaterial(texture: Texture) {
  const vertexShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec3 vPositionW;
  varying vec3 vPositionObj;
  varying vec3 vNormalW;
  varying vec3 vViewPosition;
  
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
  }`
  const fragmentShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec3 vPositionW;
  varying vec3 vNormalW;

  uniform vec4 vNoiseParams_alpha;
  uniform vec4 vNoiseParams_wave;
  uniform float vIntensity;
  uniform vec3 vColor;
  uniform float time;
  uniform float opacity;
  uniform sampler2D tSaLine;
  ${noiseFunc}

  void main() {
      float noiseMask_alpha = noise2d((vUv+vec2(0.,time*vNoiseParams_alpha.w))*vNoiseParams_alpha.xy)*vNoiseParams_alpha.z;
      float noiseMask_wave = noise2d((vUv+vec2(0.,time*vNoiseParams_wave.w))*vNoiseParams_wave.xy)*vNoiseParams_wave.z;
      vec2 l_uv = vUv*10.;
      float mask = texture(tSaLine,l_uv+vec2(noiseMask_wave,0.)).r;
      // float mask = texture(tSaLine,l_uv).r;
      mask*=(smoothstep(0.,0.5,vUv.y))*(1.-smoothstep(0.5,1.,vUv.y));
      float v_opacity = clamp( mask * (noiseMask_alpha+0.5)*vIntensity* opacity,0.,1.);


      gl_FragColor = vec4(vColor ,v_opacity);

  }`

  const material = new ShaderMaterial({
    name: 'm_windLine',
    uniforms: {
      vNoiseParams_alpha: { value: new Vector4(6, 2, 2, 0.5) },
      vNoiseParams_wave: { value: new Vector4(2, 1, 1, 0.5) },
      vIntensity: { value: 3 },
      vColor: { value: new Color('#cdeffe') },
      tSaLine: { value: texture },
      time: global.uTime,
      opacity: { value: 1 }
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    side: DoubleSide
  })

  return material
}
