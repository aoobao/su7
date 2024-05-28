export const addHtmlEvent = <K extends keyof HTMLElementEventMap>(dom: HTMLElement, type: K, listener: (evt: HTMLElementEventMap[K]) => void) => {
  dom.addEventListener(type, listener, false)

  return () => {
    dom.removeEventListener(type, listener, false)
  }
}
