import { CameraControls } from '@/lib'
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { EffectComposer, RenderPass } from 'three/examples/jsm/Addons.js'
import { onBeforeMount, onMounted, onUnmounted } from 'vue'

export interface IThreeEnvironment {
  dom: HTMLDivElement
  scene: Scene
  renderer: WebGLRenderer
  camera: PerspectiveCamera
  controls: CameraControls
  composer?: EffectComposer
}

type Func = () => void

export const createThreeEnvironment = (dom: HTMLDivElement) => {
  const width = dom.clientWidth
  const height = dom.clientHeight
  const pixelRatio = window.devicePixelRatio

  const scene = new Scene()

  const renderer = new WebGLRenderer({ antialias: true, alpha: true })

  dom.appendChild(renderer.domElement)

  renderer.setClearColor(0x000000, 0)
  renderer.setSize(width, height)
  renderer.setPixelRatio(pixelRatio)

  const camera = new PerspectiveCamera(60, width / height, 0.1, 2000)
  camera.position.set(0, 0, 10)

  const cameraControls = new CameraControls(camera, dom)

  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  const env: IThreeEnvironment = {
    dom,
    scene,
    renderer,
    camera,
    controls: cameraControls,
    composer
  }

  return env
}

export function isEmpty(val: unknown): val is undefined | null {
  return val === undefined || val === null
}
export function notEmpty<T>(val: T): val is NonNullable<T> {
  return !isEmpty(val)
}

export function checkNever(val: never) {
  if (val) {
    throw new Error('val must be never')
  }
}

function useInit(fn: () => Func | void, options: { beforeMounted?: boolean }) {
  let func: Func | void

  const initFunc = options.beforeMounted ? onBeforeMount : onMounted

  initFunc(() => {
    func = fn()
  })

  onUnmounted(() => {
    func?.()
  })
}

/**
 * 一个函数实现挂载初始化和卸载
 * @param fn react里面的useEffect
 */
export const useMounted = (fn: () => Func | void) => {
  useInit(fn, { beforeMounted: false })
}

export const useBeforeMount = (fn: () => Func | void) => {
  useInit(fn, { beforeMounted: true })
}

export const errorMessage = (str: string) => {
  alert(str)
  return Promise.resolve()
}
