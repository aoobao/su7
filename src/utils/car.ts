import { noiseFunc } from '@/shaders/speedup'
import { global } from '@/store/global'
import { Box3, MeshStandardMaterial, Object3D } from 'three'

export const updateCarBounding = (car: Object3D) => {
  const box = new Box3()
  box.setFromObject(car)

  // console.log(box, 'bounding')

  global.probePos.value.set(car.position.x, car.position.y, car.position.z, 1)
  global.probeBoxMax.value.copy(box.max)
  global.probeBoxMin.value.copy(box.min)
}

export const updateCarMaterial = (material: MeshStandardMaterial) => {
  material.defines.USE_BOX_PROJECTION = ''
  material.onBeforeCompile = shader => {
    let { fragmentShader, vertexShader } = shader
    vertexShader = vertexShader.replace('#ifdef USE_TRANSMISSION', '#if defined(USE_TRANSMISSION) || defined(USE_BOX_PROJECTION)')
    vertexShader = vertexShader.replace('#ifdef USE_TRANSMISSION', '#if defined(USE_TRANSMISSION) || defined(USE_BOX_PROJECTION)')
    vertexShader = vertexShader.replace(
      '#include <common>',
      `#include <common>
      varying vec3 reflectVec;
      #if (!defined(USE_UV))
          #define USE_UV
      #endif`
    )
    vertexShader = vertexShader.replace(
      '#include <fog_vertex>',
      `
      #include <fog_vertex>
      vec3 worldNormal = normalize( vec3( vec4( normal, 0.0 ) * modelMatrix ) );
      vec3 cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
      reflectVec = reflect( cameraToVertex, worldNormal);
      `
    )

    fragmentShader = fragmentShader.replace(
      '#include <common>',
      `#if defined(USE_TRANSMISSION) || defined(USE_BOX_PROJECTION)
        varying vec3 vWorldPosition;
      #endif

      #include <common>
      varying vec3 reflectVec;
      uniform samplerCube cubeCaptureReflectMap;
      uniform samplerCube blurCaptureReflectMap;
      uniform float vEnvMapIntensity;
      uniform float vDiscardOpacity;
      ${noiseFunc}
      #if (!defined(USE_UV))
          #define USE_UV
      #endif`
    )
    fragmentShader = fragmentShader.replace(
      '#include <envmap_physical_pars_fragment>',
      `
            #if defined( USE_ENVMAP )

            #if defined( USE_BOX_PROJECTION )

                uniform vec4 probePos;
                uniform vec3 probeBoxMin;
                uniform vec3 probeBoxMax;

                vec3 boxProjection(vec3 nrdir, vec3 worldPos, vec3 probePos, vec3 boxMin, vec3 boxMax) {

                    vec3 tbot = boxMin - worldPos;
                    vec3 ttop = boxMax - worldPos;
                    vec3 tmax = mix(tbot, ttop, step(vec3(0), nrdir));
                    tmax /= nrdir;
                    float t = min(min(tmax.x, tmax.y), tmax.z);
                    return worldPos + nrdir * t - probePos;
                
                }
            #endif
                vec3 getIBLIrradiance( const in vec3 normal ) {

                    //添加光源
                    #if defined( ENVMAP_TYPE_CUBE_UV )

                        vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );

                        #if defined( USE_BOX_PROJECTION )
                            if (probePos.w > 0.001) {
                                worldNormal = boxProjection(worldNormal, vWorldPosition, probePos.xyz, probeBoxMin.xyz, probeBoxMax.xyz);
                            }
                        #endif

                        vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1. );
                        vec4 reflectColor = textureLod( blurCaptureReflectMap, worldNormal, 0.);
                            
                        return PI * mix( reflectColor.rgb, envMapColor.rgb, vEnvMapIntensity);
                    #else

                        return vec3( 0.0 );

                    #endif

                }

                vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {

                    #if defined( ENVMAP_TYPE_CUBE_UV )

                        vec3 reflectVec = reflect( - viewDir, normal );

                        // Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
                        reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );

                        reflectVec = inverseTransformDirection( reflectVec, viewMatrix );

                        #if defined( USE_BOX_PROJECTION )
                            if (probePos.w > 0.001) {
                                reflectVec = boxProjection(reflectVec, vWorldPosition, probePos.xyz, probeBoxMin.xyz, probeBoxMax.xyz);
                            }
                        #endif

                        vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
                        envMapColor.rgb *= vEnvMapIntensity;

                        float lod = roughness*(1.7 - 0.7*roughness);
                        envMapColor.rgb += textureLod( cubeCaptureReflectMap, reflectVec, lod ).rgb * 4.;

                        return envMapColor.rgb;
                    #else

                        return vec3( 0.0 );

                    #endif

                }

            #endif
            `
    )
    fragmentShader = fragmentShader.replace(
      '#include <clipping_planes_fragment>',
      `

            float discardMask = (noise2d(vUv*15.)+1.)/2.;
            float mm = 1.-(vWorldPosition.x+2.7)/5.4;
            if(mm < (1. - vDiscardOpacity)) discard;
            #include <clipping_planes_fragment>
            `
    )
    fragmentShader = fragmentShader.replace(
      '#include <dithering_fragment>',
      `
            #include <dithering_fragment>
            float discardLightMask = (1.-step(mm,(1. - vDiscardOpacity)))*step(mm,(1. - vDiscardOpacity)+0.002);
            gl_FragColor = vec4(vec3(mix(gl_FragColor.rgb,vec3(0.5,0.9,1.),vec3(discardLightMask))),gl_FragColor.a);
            `
    )

    shader.uniforms.cubeCaptureReflectMap = { value: global.cubeRenderTarget.value?.texture }
    // TODO
    shader.uniforms.blurCaptureReflectMap = { value: null }
    shader.uniforms.vEnvMapIntensity = { value: 1 }
    shader.uniforms.vDiscardOpacity = { value: 1 }

    shader.uniforms.probeBoxMax = global.probeBoxMax
    shader.uniforms.probeBoxMin = global.probeBoxMin
    shader.uniforms.probePos = global.probePos

    shader.vertexShader = vertexShader
    shader.fragmentShader = fragmentShader
  }

  material.needsUpdate = true
}
