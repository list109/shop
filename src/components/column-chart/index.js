import fetchJson from '../../utils/fetch-json.js'

export default class ColumnChart {
  element
  subElements = {}
  chartHeight = 50
  data = []

  calculateValue = data => `${this.valuePrefix}${data.reduce((accum, item) => accum + item, 0)}`

  constructor({
    label = '',
    link = '',
    url = '',
    from = new Date(),
    to = new Date(),
    valuePrefix = ''
  } = {}) {
    this.label = label
    this.link = link
    this.url = new URL(url)
    this.from = from
    this.to = to
    this.valuePrefix = valuePrefix

    this.render()
  }

  async render() {
    const element = document.createElement('div')

    element.innerHTML = this.template
    this.element = element.firstElementChild
    this.subElements = this.getSubElements(this.element)

    const data = await this.loadData()
    this.data = Object.values(data)
    this.rerender()

    return this.element
  }
  async loadData() {
    this.element.classList.add('column-chart_loading')

    this.url.searchParams.set('from', this.from.toISOString())
    this.url.searchParams.set('to', this.to.toISOString())

    const data = await fetchJson(this.url)

    this.element.classList.remove('column-chart_loading')

    return data
  }

  getColumnBody(data) {
    const maxValue = Math.max(...data)

    return data
      .map(item => {
        const scale = this.chartHeight / maxValue
        const percent = ((item / maxValue) * 100).toFixed(0)

        return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}%"></div>`
      })
      .join('')
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : ''
  }

  get template() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.calculateValue(this.data)}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getColumnBody(this.data)}
          </div>
        </div>
      </div>
    `
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]')

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement

      return accum
    }, {})
  }

  rerender() {
    this.subElements.header.textContent = this.calculateValue(this.data)
    this.subElements.body.innerHTML = this.getColumnBody(this.data)
  }

  destroy() {
    this.element.remove()
  }
}
