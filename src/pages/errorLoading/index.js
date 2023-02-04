export default class {
  element

  async render() {
    const element = document.createElement('div')

    element.innerHTML = `
      <div class="error-loading">
        <h1 class="page-title">Ошибка загрузки</h1>
        <p>Извините, не удалось загрузить страницу</p>
      </div>
    `

    this.element = element.firstElementChild

    return this.element
  }
}
