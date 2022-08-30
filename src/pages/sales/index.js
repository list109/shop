import RangePicker from '../../components/range-picker/index.js'
import SortableTable from '../../components/sortable-table/index.js'
import header from '../../components/sortable-table/patterns/orders.js'

export default class Page {
  element
  subElements = {}
  components = {}

  updateTableComponent(from, to) {
    this.components.sortableTable.update({ createdAt_gte: from, createdAt_lte: to })
  }

  async render() {
    const element = document.createElement('div')

    element.innerHTML = this.template

    this.element = element.firstElementChild

    this.subElements = this.getSubElements(this.element)

    this.initComponents()

    this.renderComponents()
    this.initEventListeners()

    return this.element
  }

  get template() {
    return `
    <div class="sales full-height flex-column">
      <div class="content__top-panel">
        <h1 class="page-title">Sales</h1>
        <div data-elem="rangePicker"></div>
      </div>
      <div data-elem="sortableTable" class="full-height flex-column"></div>
    </div>`
  }

  getSubElements($element) {
    const elements = $element.querySelectorAll('[data-elem]')

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.elem] = subElement

      return accum
    }, {})
  }

  initComponents() {
    const to = new Date()
    const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000)

    const rangePicker = new RangePicker({
      from,
      to
    })

    const tableUrl = `${
      process.env.BACKEND_URL
    }api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`

    const sortableTable = new SortableTable(header, {
      url: tableUrl,
      isSortLocally: false,
      start: 0,
      end: 30,
      step: 30,
      label: 'Sellers table',
      sorted: {
        id: 'createdAt',
        order: 'desc'
      }
    })

    this.components.rangePicker = rangePicker
    this.components.sortableTable = sortableTable
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component]
      const { element } = this.components[component]

      root.append(element)
    })
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      let { from, to } = event.detail
      from = from.toISOString()
      to = to.toISOString()
      this.updateTableComponent(from, to)
    })
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy()
    }
  }
}
