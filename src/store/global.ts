import { Vector3, Vector4, WebGLCubeRenderTarget } from 'three'
type Optional<T> = T | null
export const global = {
  cubeRenderTarget: {
    value: null as Optional<WebGLCubeRenderTarget>
  },
  probeBoxMax: {
    value: new Vector3()
  },
  probeBoxMin: {
    value: new Vector3()
  },
  probePos: {
    value: new Vector4(0, 0, 0, 1)
  },
  uTime: {
    value: 0
  },
  uEnvMapIntensity: {
    value: 1
  },
  uDiscardOpacity: {
    value: 1
  }
}
