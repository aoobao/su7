const map = new Map<string, any>()
export const setItem = (name: string, value: unknown) => {
  map.set(name, value)
  return Promise.resolve()
}

export const getItem = (name: string) => {
  if (map.has(name)) {
    const target = map.get(name)
    return Promise.resolve(target)
  } else {
    return Promise.reject(new Error('not found'))
  }
}

export const removeItem = (name: string) => {
  map.delete(name)
  return Promise.resolve()
}
