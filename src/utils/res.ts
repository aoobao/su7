const map = new Map<string, any>()
export const setItem = (name: string, value: unknown) => {
  map.set(name, value)
  return Promise.resolve()
}

export const getItem = <T>(name: string): T | undefined => {
  if (map.has(name)) {
    const target = map.get(name)
    return target as T
    // return Promise.resolve<T>(target)
  } else {
    // return Promise.reject(new Error('not found'))
    return undefined
  }
}

export const removeItem = (name: string) => {
  map.delete(name)
  return Promise.resolve()
}

export const getItemList = (...names: string[]) => {
  const resList = names.map(name => {
    const val = getItem(name)
    if (!val) {
      throw new Error('not found by name:' + name)
    }

    return val
  })

  return resList
}
