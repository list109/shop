import RangePicker from '../../components/range-picker/index.js'
import SortableTable from '../../components/sortable-table/index.js'
import ColumnChart from '../../components/column-chart/index.js'
import header from './bestsellers-header.js'

export default class Page {
  element
  subElements = {}
  components = {}

  updateTableComponent(from, to) {
    this.components.sortableTable.update({ from, to })
  }

  updateChartsComponents(from, to) {
    this.components.ordersChart.update({ from, to })
    this.components.salesChart.update({ from, to })
    this.components.customersChart.update({ from, to })
  }

  async initComponents() {
    const to = new Date()
    const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000)

    const rangePicker = new RangePicker({
      from,
      to
    })

    const tableUrl = `${
      process.env.BACKEND_URL
    }api/dashboard/bestsellers?from=${from.toISOString()}&to=${to.toISOString()}`

    const sortableTable = new SortableTable(header, {
      url: tableUrl,
      isSortLocally: true,
      start: 1,
      end: 21,
      step: 20
    })

    const chartUrl = `${
      process.env.BACKEND_URL
    }api/dashboard/name?from=${from.toISOString()}&to=${to.toISOString()}`

    const ordersChart = new ColumnChart({
      id: 'column-chart-orders',
      url: chartUrl.replace('name', 'orders'),
      label: 'Total orders',
      link: '#'
    })

    const salesChart = new ColumnChart({
      id: 'column-chart-sales',
      url: chartUrl.replace('name', 'sales'),
      label: 'Total sales',
      valuePrefix: '$ '
    })

    const customersChart = new ColumnChart({
      id: 'column-chart-customers',
      url: chartUrl.replace('name', 'customers'),
      label: 'Total customers'
    })

    this.components.sortableTable = sortableTable
    this.components.ordersChart = ordersChart
    this.components.salesChart = salesChart
    this.components.customersChart = customersChart
    this.components.rangePicker = rangePicker
  }

  get template() {
    return `<div class="dashboard full-height flex-column" >
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <!-- RangePicker component -->
        <div data-elem="rangePicker"></div>
      </div>
      <div data-elem="chartsRoot" class="dashboard__charts">
        <!-- column-chart components -->
        <div data-elem="ordersChart" class="dashboard__chart_orders"></div>
        <div data-elem="salesChart" class="dashboard__chart_sales"></div>
        <div data-elem="customersChart" class="dashboard__chart_customers"></div>
      </div>

      <h3 class="block-title">Best sellers</h3>

      <div class="dashboard_table" data-elem="sortableTable">
        <!-- sortable-table component -->
      </div>
    </div>`
  }

  async render() {
    const element = document.createElement('div')

    element.innerHTML = this.template

    this.element = element.firstElementChild
    this.subElements = this.getSubElements(this.element)

    await this.initComponents()

    this.renderComponents()
    this.initEventListeners()

    return this.element
  }

  getSubElements($element) {
    const elements = $element.querySelectorAll('[data-elem]')

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.elem] = subElement

      return accum
    }, {})
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
      this.updateChartsComponents(from, to)
      this.updateTableComponent(from, to)
    })
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy()
    }
  }
}
