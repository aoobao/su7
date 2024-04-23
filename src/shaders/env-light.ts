import { CubeUVReflectionMapping, HalfFloatType, LinearFilter, LinearSRGBColorSpace, RGBAFormat, ShaderMaterial, Texture, WebGLRenderTarget, WebGLRenderer } from 'three'
import { FullScreenQuad } from 'three/examples/jsm/Addons.js'

export function createEnvMapShader(envMap0: Texture, envMap1: Texture, renderer: WebGLRenderer) {
  const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`

  const fragmentShader = `
uniform sampler2D u_envMap0;
uniform sampler2D u_envMap1;

uniform float   u_weight;
uniform float   u_intensity;

varying vec2 vUv;
void main() {
  vec3 color0 = texture(u_envMap0, vUv).rgb;
  vec3 color1 = texture(u_envMap1, vUv).rgb;
  vec3 color = mix(color0, color1, u_weight);
  gl_FragColor = vec4(color * u_intensity, 1.);
}
`

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      u_envMap0: { value: envMap0 },
      u_envMap1: { value: envMap1 },
      u_weight: { value: 0.5 },
      u_intensity: { value: 1.0 }
    }
  })

  const data = envMap0.source.data
  const rt = new WebGLRenderTarget(data.width, data.height, {
    magFilter: LinearFilter,
    minFilter: LinearFilter,
    generateMipmaps: false,
    type: HalfFloatType,
    format: RGBAFormat,
    colorSpace: LinearSRGBColorSpace,
    depthBuffer: false
  })

  rt.texture.mapping = CubeUVReflectionMapping

  const fsQuad = new FullScreenQuad(material)

  let needUpdate = true

  return {
    material,
    envRenderTarget: rt,
    get envMap() {
      return rt.texture
    },
    update() {
      if (needUpdate) {
        needUpdate = false
        renderer.setRenderTarget(rt)
        fsQuad.render(renderer)
        renderer.setRenderTarget(null)
      }
    },
    setState(weight: number, intensity: number) {
      if (weight !== material.uniforms.u_weight.value || intensity !== material.uniforms.u_intensity.value) {
        material.uniforms.u_weight.value = weight
        material.uniforms.u_intensity.value = intensity
        needUpdate = true
      }
    },
    destroy() {
      material.dispose()
      fsQuad.dispose()
    }
  }
}
