import fetchJson from '../../utils/fetch-json.js'
import getUniqueId from '../../utils/create-unique-id'

export default class ColumnChart {
  element
  subElements = {}
  chartHeight = 50
  data = []

  calculateValue = data => data.reduce((accum, item) => accum + item, 0)

  constructor({
    id = '',
    label = '',
    link = '',
    url = '',
    from = new Date(),
    to = new Date(),
    valuePrefix = ''
  } = {}) {
    this.id = id
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
    this.subElements.container.setAttribute('aria-hidden', 'true')

    this.url.searchParams.set('from', this.from.toISOString())
    this.url.searchParams.set('to', this.to.toISOString())

    const data = await fetchJson(this.url)

    this.element.classList.remove('column-chart_loading')
    this.subElements.container.setAttribute('aria-hidden', 'false')

    return data
  }

  getColumnBody(data) {
    const maxValue = Math.max(...data)

    return data
      .map(item => {
        const scale = this.chartHeight / maxValue
        const percent = ((item / maxValue) * 100).toFixed(0)

        return `<li style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}%"></li>`
      })
      .join('')
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : ''
  }

  get template() {
    const id = this.id ? `id=${this.id}` : ''
    const captionId = getUniqueId({
      prefix: this.id,
      middle: 'caption'
    })

    return `
      <figure ${id} class="column-chart column-chart_loading" style="--chart-height: ${
      this.chartHeight
    }"
      aria-labelledby="${captionId}">
        <figcaption id="${captionId}" class="column-chart__title" role="caption">
          ${this.label}
          ${this.getLink()}
        </figcaption>
        <div data-element="container" class="column-chart__container" data-testid="column-chart-container" 
        aria-hidden="false">
          <p class="column-chart__header">${this.valuePrefix}
            <output data-element="output">${this.calculateValue(this.data)}</output>
          </p>
          <ul data-element="body" class="column-chart__chart">
            ${this.getColumnBody(this.data)}
          </ul>
        </div>
      </figure>
    `
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]')

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement

      return accum
    }, {})
  }

  async update({ from, to }) {
    this.from = from
    this.to = to

    const data = await this.loadData()
    this.data = Object.values(data)
    this.rerender()
  }

  rerender() {
    this.subElements.output.textContent = this.calculateValue(this.data)
    this.subElements.body.innerHTML = this.getColumnBody(this.data)
  }

  destroy() {
    this.element.remove()
  }
}
