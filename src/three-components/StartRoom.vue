<script setup lang="ts">
import { useThreeRender } from '../store/three'
import { getItemList } from '../utils/res'
import { GLTF } from '../lib/GLTFLoader'
import { Texture, MeshStandardMaterial, Color, Mesh, WebGLRenderTarget, Matrix4, IUniform, UniformsLib, Vector2, ShaderMaterial } from 'three'
import { parseGltfModel } from '@/utils/model-detail'
import { BLOOM_LAYER } from '@/effect-compose'
import { useConfig } from '@/store/config'
import { watchEffect } from 'vue'
import { useBeforeRender } from '@/store/update'
import { getReflectMaterial } from '@/hooks/useReflect'
import { REFLECT_LAYER } from '@/constants'
import { changeDefines } from '../shaders/index'
// import { destroyObject3D } from '../lib/three-common'
const beforeRender = useBeforeRender()

useThreeRender(env => {
  // const gltf = getItem<GLTF>('sm_startroom')
  // if (!gltf) return

  const [sm_startroom, t_startroom_ao, t_startroom_light, t_floor_normal, t_floor_roughness, t_street] = getItemList('sm_startroom', 't_startroom_ao', 't_startroom_light', 't_floor_normal', 't_floor_roughness', 't_street') as [GLTF, Texture, Texture, Texture, Texture, Texture]

  const data = parseGltfModel(sm_startroom)

  Object.values(data.materials).forEach(m => {
    const material = m as MeshStandardMaterial

    material.aoMap = t_startroom_ao
    material.lightMap = t_startroom_light
    material.normalMap = t_floor_normal
    material.roughnessMap = t_floor_roughness
    material.envMapIntensity = 0
  })

  // console.log(data, 'startroom')

  const light = data.materials.light as MeshStandardMaterial
  light.emissive = new Color(0xffffff)
  light.emissiveIntensity = 1
  light.depthWrite = false
  light.transparent = true

  const config = useConfig()

  watchEffect(() => {
    const colorValue = config.lightColor

    light.emissive.r = colorValue
    light.emissive.g = colorValue
    light.emissive.b = colorValue
  })

  watchEffect(() => {
    if (config.showSpeedUp || config.showCurvature || config.showWindSpeed || config.showCarRadar) {
      light.visible = false
    } else {
      light.visible = true
    }
  })

  const lightMesh = data.meshes.find(t => t.name === 'light001')!

  lightMesh.layers.set(BLOOM_LAYER)

  env.scene.add(sm_startroom.scene)

  // reflect
  const d = getReflectMaterial(env)

  const cancels = [
    beforeRender(() => {
      d.update()
    })
  ]

  const floor = data.meshes.find(t => t.name === 'ReflecFloor')
  if (floor) {
    const floorMaterial = updateFloorMaterial(floor, d.renderTarget, d.reflectMatrix, t_street)
    watchEffect(() => {
      // if (config.showWindSpeed) {
      //   // floor.visible = false
      //   changeDefines(floorMaterial, 'USE_FLOOR_MAP', false)
      // } else {

      // }

      changeDefines(floorMaterial, 'USE_FLOOR_MAP', !config.showWindSpeed)

      floorMaterial.uniforms.u_floor_typeSwitch.value = config.showCarRadar ? 1 : 0
    })

    cancels.push(
      beforeRender(opt => {
        if (!config.showCarRadar) return

        const uv = floorMaterial.uniforms.u_floorUVOffset.value as Vector2

        uv.x += opt.delta * 10
      })
    )
  }

  return () => {
    cancels.forEach(cancel => cancel())
    env.scene.remove(sm_startroom.scene)
    d.destroy()
  }
})

function updateFloorMaterial(floor: Mesh, renderTarget: WebGLRenderTarget, reflectMatrix: Matrix4, streetMap: Texture) {
  const vertexShader = `
  varying vec4 vWorldPosition;
      varying vec2 vUv;
      varying vec2 vUv1;
      varying vec4 vViewPosition;
      varying vec3 vNormal;
      varying vec4 vTangent;
  
      attribute vec2 uv1;
  
      #include <common>
      #include <fog_pars_vertex>
      #include <shadowmap_pars_vertex>
      #include <logdepthbuf_pars_vertex>
  
      void main() {
          vUv = uv;
          vUv1 = uv1;
          vWorldPosition = modelMatrix * vec4( position, 1.0 );
          vec4 mvPosition =  modelViewMatrix * vec4( position, 1.0 );
          vViewPosition = mvPosition / mvPosition.w;
          vNormal = normalMatrix * normal;
          #ifdef USE_TANGENT
          vTangent = tangent;
          #endif
          gl_Position = projectionMatrix * mvPosition;
      
          #include <beginnormal_vertex>
          #include <defaultnormal_vertex>
          #include <logdepthbuf_vertex>
          #include <fog_vertex>
          #include <shadowmap_vertex>
      }`
  const fragmentShader = `
  varying vec4 vWorldPosition;
      varying vec2 vUv;
      varying vec2 vUv1;
      varying vec4 vViewPosition;
      varying vec3 vNormal;
      varying vec4 vTangent;
  
      uniform vec3 color;
      uniform sampler2D map;
      uniform float opacity;
      uniform float roughness;
      uniform sampler2D roughnessMap;
      uniform float metalness;
      uniform sampler2D metalnessMap;
      uniform sampler2D aoMap;
      uniform sampler2D lightMap;
      uniform vec3 lightMapColor;
      uniform float lightMapIntensity;
      uniform vec3 emissive;
      uniform sampler2D emissiveMap;
      uniform sampler2D normalMap;
      uniform float distortionScale;
      uniform float u_floor_typeSwitch;
      uniform sampler2D ut_street;
  
      uniform float u_lightIntensity;
      uniform float u_reflectIntensity;
      uniform vec2 u_floorUVOffset;
  
      uniform mat4 u_reflectMatrix;
      uniform sampler2D u_reflectTexture;
  
      #include <common>
      #include <packing>
      #include <bsdfs>
      #include <fog_pars_fragment>
      #include <logdepthbuf_pars_fragment>
      #include <lights_pars_begin>
      #include <shadowmap_pars_fragment>
      #include <shadowmask_pars_fragment>
  
      vec4 getNoise( vec2 uv ) {
          vec2 uv0 = ( uv / 103.0 );
          vec2 uv1 = uv / 107.0;
          vec2 uv2 = uv / vec2( 8907.0, 9803.0 );
          vec2 uv3 = uv / vec2( 1091.0, 1027.0 );
          vec4 noise = texture2D( normalMap, uv0 ) +
              texture2D( normalMap, uv1 ) +
              texture2D( normalMap, uv2 ) +
              texture2D( normalMap, uv3 );
          return noise * 0.5 - 1.0;
      }
  
      void main(){
          #include <logdepthbuf_fragment>
  
          vec3 surfaceNormal = vec3(0.,1.,0.);
          #ifdef USE_NORMAL_MAP
              vec3 normalSample = texture2D( normalMap, vWorldPosition.xz+u_floorUVOffset).rgb*2.-vec3(1.);
              surfaceNormal = normalize( normalSample.xzy );
          #endif
  
          vec3 diffuseLight = vec3(0.0);
          vec3 eyeDirection = -vViewPosition.xyz;
          float d = length(eyeDirection);
          eyeDirection = normalize(eyeDirection);
  
          //法线对反射的影响强度
          vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / d ) * distortionScale;
  
          float metallic = metalness;
          #ifdef USE_METALNESS_MAP
              metallic = texture2D(metalnessMap, vUv).b * metallic;
          #endif
  
          float theta = max( dot( eyeDirection, vNormal ), 0.0 );
          float rf0 = 0.02;
          float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 2.0 );
  
          float roughness_factory = roughness;
          #ifdef USE_ROUGHNESS_MAP
              roughness_factory *= texture2D(roughnessMap, (vWorldPosition.xz+u_floorUVOffset)*0.2).g;
          #endif
          roughness_factory = roughness_factory*(1.7 - 0.7*roughness_factory);
  
          vec4 samplePoint = u_reflectMatrix * vWorldPosition;
          samplePoint = samplePoint / samplePoint.w;
          vec3 reflectionSample = texture2D(u_reflectTexture, samplePoint.xy + distortion, roughness_factory*6.).xyz * u_reflectIntensity;
          vec3 lightSample = vec3(lightMapIntensity * u_lightIntensity)*lightMapColor;
  
      #ifdef USE_LIGHT_MAP
        lightSample *= texture2D(lightMap,vUv1).rgb;
      #endif
  
          #ifdef USE_AO_MAP
        float aoSample = texture2D(aoMap,vUv1).r;
        lightSample*=aoSample;
      #endif
  
      vec3 streetCol = texture(ut_street,vec2((vWorldPosition.z+15.)/30.,(vWorldPosition.x+u_floorUVOffset.x)/60.)).rgb;
      lightSample = mix(lightSample,streetCol,vec3(u_floor_typeSwitch));

      vec3 colorFactory = color;
      #ifdef USE_MAP
          vec3 mapColor = texture2D(map, vUv);
          colorFactory *= mapColor.rgb;
      #endif

      #ifdef USE_FLOOR_MAP
      //漫反射强度的简单计算方式
      diffuseLight = lightSample * colorFactory; //* theta;
      vec3 outColor = mix(diffuseLight, reflectionSample, reflectance);

      gl_FragColor = vec4(outColor, opacity);
      #else
      gl_FragColor = vec4(reflectionSample, opacity*0.4);
      #endif

      
      // gl_FragColor = vec4(vec3(theta*(roughness_factory)), 1.);
      // gl_FragColor = vec4(vec3(texture2D(lightMap,vUv2).rgb), 1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #include <fog_fragment>
    }
  `
  const uniforms: { [uniform: string]: IUniform } = {
    color: { value: new Color() },
    map: { value: null },
    opacity: { value: 1 },
    roughness: { value: 1 },
    roughnessMap: { value: null },
    metalness: { value: 1 },
    metalnessMap: { value: null },
    aoMap: { value: null },
    lightMap: { value: null },
    lightMapColor: { value: new Color(0xffffff) },
    lightMapIntensity: { value: 1 },
    emissive: { value: new Color() },
    emissiveMap: { value: null },
    normalMap: { value: null },
    distortionScale: { value: 0 },
    u_lightIntensity: { value: 1 },
    u_reflectIntensity: { value: 1 },
    u_floor_typeSwitch: { value: 0 },
    ut_street: { value: streetMap },
    u_floorUVOffset: { value: new Vector2() },
    ...UniformsLib.fog,
    ...UniformsLib.lights,
    u_reflectMatrix: { value: reflectMatrix },
    u_reflectTexture: { value: renderTarget.texture }
  }
  const defines: { [key: string]: any } = {
    USE_FLOOR_MAP: true
  }
  const material = floor.material as MeshStandardMaterial

  uniforms.color.value = material.color

  if (material.map) {
    // material.map.anisotropy = 4;
    uniforms.map.value = material.map
    defines.USE_MAP = true
  }
  uniforms.opacity.value = material.opacity
  if (material.roughnessMap) {
    uniforms.roughnessMap.value = material.roughnessMap
    defines.USE_ROUGHNESS_MAP = true
  }
  uniforms.metalness.value = material.metalness
  if (material.metalnessMap) {
    uniforms.metalnessMap.value = material.metalnessMap
    defines.USE_METALNESS_MAP = true
  }
  uniforms.emissive.value = material.emissive
  if (material.emissiveMap) {
    uniforms.emissiveMap.value = material.emissiveMap
    defines.USE_EMISSIVE_MAP = true
  }
  if (material.aoMap) {
    uniforms.aoMap.value = material.aoMap
    defines.USE_AO_MAP = true
  }
  uniforms.lightMapIntensity.value = material.lightMapIntensity
  if (material.lightMap) {
    uniforms.lightMap.value = material.lightMap
    defines.USE_LIGHT_MAP = true
  }
  if (material.normalMap) {
    // material.normalMap.anisotropy = 4;
    uniforms.normalMap.value = material.normalMap
    defines.USE_NORMAL_MAP = true
  }

  // console.log(material, 'floor material', uniforms)

  const shader = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    defines
  })

  shader.name = 'M_Reflect'
  floor.layers.disable(REFLECT_LAYER)
  material.dispose()
  // ignoreReflectMesh.push(floor)
  floor.material = shader

  // console.log('reflect floor ', floor)

  return shader
}
</script>
<template>
  <slot />
</template>
