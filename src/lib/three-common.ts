import { BufferGeometry, Line, Material, Mesh, Object3D, Points, Sprite, Texture, TextureLoader } from 'three'
import { GLTF, GLTFLoader } from './GLTFLoader.js'
import { MeshoptDecoder } from './meshopt_decoder.module.js'
import { RGBELoader } from 'three/examples/jsm/Addons.js'
/**
 * 销毁
 * @param object 3d对象
 * @param deleteType 1: 销毁geometry 2 销毁 material 3 销毁
 */
export function destroyObject3D(object: Object3D, deleteType: 1 | 2 | 3 = 3) {
  if (object.parent) object.parent.remove(object)
  const deleteGeometry = deleteType & 1
  const deleteMaterial = deleteType & 2
  object.traverse(obj => {
    if (obj.type === 'Mesh' || obj instanceof Mesh) {
      const mesh = obj as Mesh
      if (deleteGeometry) {
        disposeGeometryOrMaterial(mesh.geometry)
      }
      if (deleteMaterial) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => disposeGeometryOrMaterial(m))
        } else {
          disposeGeometryOrMaterial(mesh.material)
        }
      }
    } else if (obj instanceof Line) {
      const line = obj as Line
      if (deleteGeometry) {
        disposeGeometryOrMaterial(line.geometry)
      }
      if (deleteMaterial) {
        if (Array.isArray(line.material)) {
          line.material.forEach(m => disposeGeometryOrMaterial(m))
        } else {
          disposeGeometryOrMaterial(line.material)
        }
      }
    } else if (obj instanceof Points) {
      const p = obj as Points
      if (deleteGeometry) {
        disposeGeometryOrMaterial(p.geometry)
      }
      if (deleteMaterial) {
        if (Array.isArray(p.material)) {
          p.material.forEach(m => disposeGeometryOrMaterial(m))
        } else {
          disposeGeometryOrMaterial(p.material)
        }
      }
    } else if (obj instanceof Sprite) {
      const p = obj as Sprite
      disposeGeometryOrMaterial(p.geometry)
      disposeGeometryOrMaterial(p.material)
    } else {
      const t = obj as any
      if (t.geometry || t.material) {
        console.warn('对象未销毁,请联系开发人员', t)
      }
    }
  })
}

function disposeGeometryOrMaterial(obj: BufferGeometry | Material) {
  if (obj.userData.__DISPOSE === false) {
    // 内部设定一些复用geometry或者material不需要销毁
    return false
  }
  obj.dispose()
  return true
}

export function toLoadGltfFile(url: string, onProgress?: (event: ProgressEvent<EventTarget>) => void) {
  const loader = new GLTFLoader()
  loader.setMeshoptDecoder(MeshoptDecoder)

  return new Promise<GLTF>((resolve, reject) => {
    loader.load(
      url,
      gltf => {
        resolve(gltf)
      },
      onProgress,
      err => {
        console.error(err)
        reject(err)
      }
    )
  })
}

export function toLoadTexture(url: string) {
  const loader = new TextureLoader()

  return new Promise<Texture>((resolve, reject) => {
    loader.load(
      url,
      texture => {
        // texture.encoding
        // console.log(texture)
        resolve(texture)
      },
      undefined,
      err => {
        console.error(err)
        reject(err)
      }
    )
  })
}

export function toLoadHdr(url: string, onProgress?: (event: ProgressEvent<EventTarget>) => void) {
  const loader = new RGBELoader()
  return new Promise<{ texture: Texture; textureData: object }>((resolve, reject) => {
    loader.load(
      url,
      (texture, textureData) => {
        resolve({ texture, textureData })
      },
      onProgress,
      err => {
        reject(err)
      }
    )
  })
}
