import { ENVIRONMENT_LAYER, REFLECT_LAYER } from '@/constants'
import { GLTF } from '@/lib/GLTFLoader'
import { parseGltfModel } from '@/utils/model-detail'
import { getItem } from '@/utils/res'
import { Color, DoubleSide, Material, ShaderMaterial, Texture } from 'three'

export const updateCurvatureMaterial = (gltf: GLTF) => {
  const lineTexture = getItem('t_saLine') as Texture
  const data = parseGltfModel(gltf)

  const mesh = data.meshes.find(t => t.name === '曲率')

  if (mesh) {
    const oldMaterial = mesh.material as Material
    oldMaterial.dispose()

    const material = getCurvatureMaterial(lineTexture)
    mesh.material = material

    mesh.layers.enable(REFLECT_LAYER)
    mesh.layers.enable(ENVIRONMENT_LAYER)
  }

  return mesh
}

function getCurvatureMaterial(texture: Texture) {
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

  uniform sampler2D tSaLine;
  uniform vec3 vColor;
  uniform float opacity;
  uniform float time;
  void main() {
      vec2 l_uv = vUv*50.+vec2(-time,0.);
      float mask = texture(tSaLine,l_uv).r;
      mask*=(1.-smoothstep(0.2,0.28,vUv.x));
      
      gl_FragColor = vec4(vec3(vColor),mask*opacity);
  }`
  const material = new ShaderMaterial({
    name: 'm_curvature',
    uniforms: {
      opacity: { value: 1 },
      vColor: { value: new Color(0xfdffc7) },
      tSaLine: { value: texture },
      time: { value: new Date().getTime() / 1000 }
    },
    vertexShader,
    fragmentShader,
    depthWrite: false,
    side: DoubleSide,
    transparent: true
  })

  return material
}
