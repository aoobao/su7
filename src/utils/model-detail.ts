import { GLTF } from '@/lib/GLTFLoader'
import { Material, Mesh, Object3D, Texture } from 'three'

export interface IMeshData {
  meshes: Mesh[]
  materials: { [key: string]: Material }
  textures: { [key: string]: Texture }
}

const mapNameList = ['alphaMap', 'aoMap', 'bumpMap', 'displacementMap', 'emissiveMap', 'envMap', 'lightMap', 'metalnessMap', 'normalMap', 'roughnessMap', 'specularMap']

export const parseModel = (object: Object3D, meshData: IMeshData = { meshes: [], materials: {}, textures: {} }) => {
  object.traverse(obj => {
    if (obj instanceof Mesh) {
      const m = obj as Mesh
      meshData.meshes.push(m)

      const materials = Array.isArray(m.material) ? m.material : [m.material]

      for (let i = 0; i < materials.length; i++) {
        const material = materials[i]

        meshData.materials[material.name] = material

        mapNameList.forEach(name => {
          // @ts-ignore
          if (material[name]) {
            // @ts-ignore
            const texture = material[name] as Texture
            meshData.textures[texture.uuid] = texture
          }
        })
      }
    }
  })

  return meshData
}

export const parseGltfModel = (gltf: GLTF) => {
  const scene = gltf.scene
  const userData = scene.userData
  if (userData['meshData']) return userData['meshData'] as IMeshData

  const data = parseModel(scene)

  scene.userData = {
    ...scene.userData,
    meshData: data
  }

  return data
}
