export function prepareForDom(getComponent) {
  return obj => {
    let instance = getComponent(obj)

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
