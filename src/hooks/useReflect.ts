import { REFLECT_LAYER } from '@/constants'
import { destroyObject3D } from '@/lib/three-common'
import { IThreeEnvironment } from '@/utils'
import { ClampToEdgeWrapping, Group, LinearMipmapLinearFilter, Matrix4, PerspectiveCamera, Plane, Quaternion, Vector3, Vector4, WebGLRenderTarget } from 'three'
const up = new Vector3(0, 1, 0)
export const getReflectMaterial = (env: IThreeEnvironment) => {
  const width = 512
  const height = 512
  const node = new Group()

  const _camera = new PerspectiveCamera()
  const reflectPlane = new Plane()
  const reflectMatrix = new Matrix4()
  const renderTarget = new WebGLRenderTarget(width, height)

  renderTarget.texture.generateMipmaps = true
  renderTarget.texture.minFilter = LinearMipmapLinearFilter
  renderTarget.texture.wrapS = ClampToEdgeWrapping
  renderTarget.texture.wrapT = ClampToEdgeWrapping

  node.add(_camera)
  reflectPlane.set(up, 0)

  env.scene.add(node)

  const destroy = () => {
    env.scene.remove(node)
    destroyObject3D(node)
    renderTarget.dispose()
  }

  const update = () => {
    const camera = env.camera
    const renderer = env.renderer

    reflectPlane.set(up, 0)
    reflectPlane.applyMatrix4(node.matrixWorld)
    _camera.copy(camera)
    const r = new Vector3(0, 0, 1).negate()
    const o = camera.getWorldPosition(new Vector3())
    r.applyQuaternion(camera.getWorldQuaternion(new Quaternion()))
    if (r.dot(reflectPlane.normal) > 0) {
      return
    }

    r.reflect(reflectPlane.normal)
    const p = new Vector3()
    reflectPlane.projectPoint(o, p)

    const y = p.clone()
    y.sub(o).add(p)
    _camera.position.copy(y)

    const d = new Vector3(0, 0, -1)
    d.applyQuaternion(camera.getWorldQuaternion(new Quaternion()))
    d.add(o)

    const E = new Vector3()
    node.getWorldPosition(E)
    E.sub(d)

    E.reflect(reflectPlane.normal).negate()
    E.add(node.getWorldPosition(new Vector3()))

    _camera.layers.disableAll()
    _camera.layers.enable(REFLECT_LAYER)
    
    _camera.up.set(0, 1, 0);
    _camera.applyQuaternion(camera.getWorldQuaternion(new Quaternion()));

    _camera.up.reflect(reflectPlane.normal);
    _camera.lookAt(E);
    _camera.updateMatrixWorld();
    const L = new Matrix4();
    L.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
    L.multiply(_camera.projectionMatrix);
    L.multiply(_camera.matrixWorldInverse);

    reflectMatrix.copy(L);

    reflectPlane.applyMatrix4(_camera.matrixWorldInverse);
    const k = new Vector4(
      reflectPlane.normal.x,
      reflectPlane.normal.y,
      reflectPlane.normal.z,
      reflectPlane.constant
    );
    const X = _camera.projectionMatrix;
    const $ = new Vector4();
    $.x = (Math.sign(k.x) + X.elements[8]) / X.elements[0];
    $.y = (Math.sign(k.y) + X.elements[9]) / X.elements[5];
    $.z = -1;
    $.w = (1 + X.elements[10]) / X.elements[14];
    k.multiplyScalar(2 / k.dot($));
    X.elements[2] = k.x;
    X.elements[6] = k.y;
    X.elements[10] = k.z + 1;
    X.elements[14] = k.w;

    renderer.setRenderTarget(renderTarget);
    renderer.state.buffers.depth.setMask(true);
    renderer.autoClear === false && renderer.clear();
    node.visible = false;

    renderer.render(env.scene, _camera);
    
    node.visible = true;
    renderer.setRenderTarget(null);

    const viewport = camera.viewport;
    if (viewport) {
      renderer.state.viewport(viewport);
    }
  }

  return {
    destroy,
    update,
    renderTarget,
    reflectMatrix
  }
}

