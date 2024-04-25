import { IThreeEnvironment } from '@/utils'
import { ShaderMaterial, Texture, Vector2 } from 'three'
import { EffectComposer, OutputPass, RenderPass, ShaderPass, UnrealBloomPass } from 'three/examples/jsm/Addons.js'
import { uniforms } from 'three/examples/jsm/nodes/Nodes.js'

export const BLOOM_LAYER = 10

export const initEffectCompose = (env: IThreeEnvironment) => {
  const { clientWidth, clientHeight } = env.dom
  const renderPass = new RenderPass(env.scene, env.camera)

  const bloomComposer = new EffectComposer(env.renderer)
  const bloomPass = new UnrealBloomPass(new Vector2(clientWidth, clientHeight), 1, 0.5, 0.5)
  bloomComposer.renderToScreen = false
  bloomComposer.addPass(renderPass)
  bloomComposer.addPass(bloomPass)

  const composer = new EffectComposer(env.renderer)
  composer.addPass(renderPass)

  const mixPass = createMixPass(bloomComposer.renderTarget2.texture)
  composer.addPass(mixPass)
  // composer.addPass(bloomPass)

  const outPutPass = new OutputPass()
  composer.addPass(outPutPass)

  env.composer = composer

  return {
    composer,
    bloomComposer,
    render() {
      const layers = env.camera.layers
      const mask = layers.mask

      layers.disableAll()
      layers.enable(BLOOM_LAYER)

      bloomComposer.render()
      layers.mask = mask

      composer.render()
    },
    resize() {}
  }
}

export const createMixPass = (texture: Texture) => {
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `
  const fragmentShader = `
    uniform sampler2D baseTexture;
    uniform sampler2D bloomTexture;
    varying vec2 vUv;
    void main() {
      gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );

    }
  `

  const mixPass = new ShaderPass(
    new ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: texture }
      },
      vertexShader,
      fragmentShader
    }),
    'baseTexture'
  )

  mixPass.needsSwap = true

  return mixPass
}
