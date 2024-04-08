export interface IRes {
  name: string
  path: string
  progress: number
  type: 'gltf' // | 'image'
  ext?: any
}
const PREFIX_MESH_PATH = '/1.0.2/mesh/'

export const RES_LIST: IRes[] = [
  getResObject('sm_car.glb'),
  getResObject('sm_startroom.raw.glb'),
  getResObject('sm_speedup.glb'),
  getResObject('sm_size.glb'),
  getResObject('sm_curvature.glb'),
  getResObject('sm_windspeed.glb'),
  getResObject('sm_linecar.glb'),
  getResObject('sm_carradar.glb'),
  getResObject('sm_simplecar.glb'),
]

function getResObject(fileName: string, type = 'gltf', prefix = PREFIX_MESH_PATH): IRes {
  const name = fileName.split('.')[0]
  const res: IRes = {
    name,
    path: PREFIX_MESH_PATH + fileName,
    progress: 0,
    // type: type === 'gltf' ? 'gltf' : 'image'
    type: 'gltf'
  }

  return res
}
