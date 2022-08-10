import SortableTable from '../../../components/sortable-table/index.js'
import RangeSlider from '../../../components/range-slider/index.js'
import header from './products-list-header'

export default class Products {
  element
  subElements = {}
  components = {}

  updateTableComponent(params) {
    this.components.sortableTable.update(params)
  }

  async initComponent() {
    const url = `${process.env.BACKEND_URL}api/rest/products?_embed=subcategory.category`

    const sortableTable = new SortableTable(header, {
      url,
      isSortLocally: false,
      start: 1,
      end: 30,
      step: 30
    })

    const rangeSlider = new RangeSlider({ max: 4000, prefix: '$' })

    this.components.sortableTable = sortableTable
    this.components.rangeSlider = rangeSlider
  }

  get template() {
    return `
    <div class="products-list full-height flex-column">
      <div class="content__top-panel">
        <h2 class="page-title">Products</h2>
        <a href="/products/add" class="button-primary">Add a product</a>
      </div>
      <div class="content-box content-box_small">

        <form class="form-inline">

          <div class="form-group">
            <label class="form-label">Sort by:</label>
            <input data-elem="filterName" type="text" class="form-control" placeholder="Product's name" />
          </div>
          
          <div data-elem="rangeSlider" class="form-group">
            <label class="form-label">Price:</label>
            <!-- range-slider component -->
          </div>

          <div class="form-group">
            <label class="form-label">Status:</label>
            <select data-elem="filterStatus" class="form-control">
              <option value selected>Anything</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
        
        </form>
      </div>

      <div data-elem="sortableTable" class="product-list__container">
        <!-- sortable-table component -->
      </div>

    </div>`
  }

  async render() {
    const wrapper = document.createElement('div')

    wrapper.innerHTML = this.template

    this.element = wrapper.firstElementChild
    this.subElements = this.getSubElements(this.element)

    await this.initComponent()

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
    const { rangeSlider, filterName, filterStatus } = this.subElements

    rangeSlider.addEventListener('slider-change', event => {
      const { from, to } = event.detail
      this.updateTableComponent({ price_gte: from, price_lte: to })
    })

    filterName.addEventListener('input', ({ target }) => {
      this.updateTableComponent({ title_like: target.value })
    })

    filterStatus.addEventListener('input', ({ target }) => {
      this.updateTableComponent({ status: target.value })
    })
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy()
    }
  }
}
