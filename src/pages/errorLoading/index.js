export default class {
  element

  async render() {
    const element = document.createElement('div')

    element.innerHTML = `
      <div class="error-loading">
        <h1 class="page-title">Loading error</h1>
        <p>Sorry, but the page could not be loaded</p>
      </div>
    `

    this.element = element.firstElementChild

    return this.element
  }
}
