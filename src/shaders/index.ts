import { ShaderMaterial } from 'three'

export function changeDefines(material: ShaderMaterial, key: string, value: any) {
  const oldVal = material.defines[key]
  if (oldVal === value) return
  material.defines[key] = value
  material.needsUpdate = true
}
