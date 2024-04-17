export const createSubscribe = <T>() => {
  type Func = (opt: T) => void

  type FuncType = {
    func: Func
    index: number
  }
  const funcs: FuncType[] = []

  const subscribe = (func: Func, index: number = Infinity) => {
    funcs.push({ func, index })

    if (index < Infinity) {
      funcs.sort((a, b) => {
        return a.index - b.index
      })
    }

    return () => unSubscribe(func)
  }

  const unSubscribe = (func?: Func) => {
    if (!func) return clear()
    for (let i = funcs.length - 1; i >= 0; i--) {
      const t = funcs[i]
      if (func === t.func) {
        funcs.splice(i, 1)
      }
    }
  }

  const clear = () => {
    funcs.splice(0)
  }

  const register = (opt: T) => {
    if (!funcs.length) return

    funcs.forEach(t => {
      const func = t.func
      func(opt)
    })
  }

  return [register, subscribe, unSubscribe, clear] as const
}
