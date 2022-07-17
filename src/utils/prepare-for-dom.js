export function prepareForDom(getComponent) {
  return (...args) => {
    let instance = getComponent(...args)

    return {
      get instance() {
        return instance
      },
      get element() {
        return instance.element
      },
      render() {
        document.body.append(instance.element)
      },
      clear() {
        instance.destroy()
        instance = null
      }
    }
  }
}
