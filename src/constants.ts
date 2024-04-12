import { LinearSRGBColorSpace, NearestFilter, RepeatWrapping, SRGBColorSpace } from 'three'

type IFileType = 'gltf' | 'image' | 'hdr'

export interface IRes {
  name: string
  path: string
  progress: number
  type: IFileType // | 'image'
  ext?: any
}
const PREFIX_MESH_PATH = './1.0.2/mesh/'
const PREFIX_TEXTURE_PATH = './1.0.2/texture/'

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
  getResObject('t_saLine.webp', 'image', PREFIX_TEXTURE_PATH, {
    flipY: false,
    wrapS: RepeatWrapping,
    wrapT: RepeatWrapping,
    anisotropy: 4
    // colorSpace: LinearSRGBColorSpace // 3000
  }),

  getResObject('t_car_body_AO.raw.jpg', 'image', PREFIX_TEXTURE_PATH, {
    flipY: false,
    magFilter: NearestFilter,
    minFilter: NearestFilter
    // colorSpace: LinearSRGBColorSpace // 3000
  }),
  getResObject('t_startroom_ao.raw.jpg', 'image', PREFIX_TEXTURE_PATH, {
    flipY: false
    // colorSpace: LinearSRGBColorSpace // 3000
  }),
  getResObject('t_startroom_light.raw.jpg', 'image', PREFIX_TEXTURE_PATH, {
    flipY: false
    // colorSpace:SRGBColorSpace
  }),
  getResObject('t_floor_normal.webp', 'image', PREFIX_TEXTURE_PATH, {
    flipY: false,
    wrapS: RepeatWrapping,
    wrapT: RepeatWrapping
    // colorSpace: LinearSRGBColorSpace // 3000
  }),
  getResObject('t_floor_roughness.webp', 'image', PREFIX_TEXTURE_PATH, {
    flipY: false,
    wrapS: RepeatWrapping,
    wrapT: RepeatWrapping
    // colorSpace: LinearSRGBColorSpace // 3000
  }),
  getResObject('t_street.webp', 'image', PREFIX_TEXTURE_PATH, {
    flipY: false,
    wrapS: RepeatWrapping,
    wrapT: RepeatWrapping
    // colorSpace: LinearSRGBColorSpace // 3000
  }),
  getResObject('t_scar_matcap.webp', 'image', PREFIX_TEXTURE_PATH, {
    flipY: false
  }),
  getResObject('t_cat_car_body_bc.webp', 'image', PREFIX_TEXTURE_PATH, {
    flipY: false
  }),
  getResObject('t_gm_car_body_bc.webp', 'image', PREFIX_TEXTURE_PATH, {
    flipY: false
  }),
  getResObject('t_env_night.hdr', 'hdr', PREFIX_TEXTURE_PATH),
  getResObject('t_env_light.hdr', 'hdr', PREFIX_TEXTURE_PATH)
]

function getResObject(fileName: string, type: IFileType = 'gltf', prefix = PREFIX_MESH_PATH, ext: any = undefined): IRes {
  const name = fileName.split('.')[0]
  const res: IRes = {
    name,
    path: prefix + fileName,
    progress: 0,
    // type: type === 'gltf' ? 'gltf' : 'image'
    type
  }
  if (ext) {
    res.ext = ext
  }

  return res
}
