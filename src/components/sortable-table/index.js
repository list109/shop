import fetchJson from '../../utils/fetch-json.js'

export default class SortableTable {
  element
  subElements = {}
  data = []
  _loadType = null

  set loadType(type) {
    const { header } = this.subElements
    const thElements = header.querySelectorAll('th')

    for (const th of thElements) {
      const { sortable } = th.dataset
      if (sortable) {
        th.setAttribute('aria-disabled', type === null ? 'false' : 'true')
      }
    }

    this.element.classList[type ? 'add' : 'remove']('sortable-table_loading')

    this._loadType = type
  }

  get loadType() {
    return this._loadType
  }

  onWindowScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect()

    if (
      bottom < document.documentElement.clientHeight &&
      !this.loadType &&
      !this.isSortLocally &&
      this.data.length &&
      this.isDataOnServer
    ) {
      this.start = this.end
      this.end = this.start + this.step

      this.loadType = 'onscroll'

      const data = await this.loadData(this.url, {
        _start: this.start,
        _end: this.end
      })

      if (this.loadType !== 'onscroll') return
      this.loadType = null

      if (data.length < 1) this.isDataOnServer = false

      this.append(data)
    }
  }

  onSortClick = event => {
    const column = event.target.closest('[data-sortable]')
    const toggleOrder = order => {
      const orders = {
        asc: 'desc',
        desc: 'asc'
      }

      return orders[order]
    }

    if (column && !this.loadType) {
      const { id, order } = column.dataset
      const newOrder = toggleOrder(order)

      this.sorted = {
        id,
        order: newOrder
      }

      column.dataset.order = newOrder
      column.append(this.subElements.arrow)

      if (this.isSortLocally) {
        this.sortLocally(id, newOrder)
      } else {
        this.start = 1
        this.end = this.start + this.step
        this.sortOnServer(id, newOrder, this.start, this.end)
      }
    }
  }

  onProductClick = ({ target }) => {
    const row = target.closest('tr')

    if (row) {
      const link = document.createElement('a')
      link.href = `/products/${row.dataset.id}`
      link.click()
    }
  }

  constructor(
    headersConfig = [],
    {
      url = '',
      sorted = {
        id: headersConfig.find(item => item.sortable).id,
        order: 'asc'
      },
      isSortLocally = false,
      step = 20,
      start = 1,
      end = start + step
    } = {}
  ) {
    this.headersConfig = headersConfig
    this.url = new URL(url)
    this.isSortLocally = isSortLocally
    this.sorted = sorted
    this.step = step
    this.start = start
    this.end = end

    this.render()
  }

  async render() {
    const wrapper = document.createElement('div')

    wrapper.innerHTML = this.getTable()

    const element = wrapper.firstElementChild

    this.element = element
    this.subElements = this.getSubElements(element)

    this.loadType = 'initial'
    const data = await this.loadData(this.url)
    if (this.loadType === 'initial') this.loadType = null

    this.renderRows(data)
    this.initEventListeners()
    return this.element
  }

  async loadData(
    url = this.url,
    queryParams = {
      _sort: this.sorted.id,
      _order: this.sorted.order,
      _start: this.start,
      _end: this.end
    }
  ) {
    this.isDataOnServer = true
    this.setParams(url, queryParams)

    let data

    try {
      data = await fetchJson(url)
    } catch (err) {
      this.element.dispatchEvent(new CustomEvent('error', { detail: err }))
      data = []
    }

    return data
  }

  setParams(url, queryParams = {}) {
    Object.keys(queryParams).forEach(param => {
      const value = queryParams[param]
      url.searchParams[value ? 'set' : 'delete'](param, value)
    })
  }

  addRows(data) {
    this.data = data
    this.subElements.body.innerHTML = this.getTableRows(data)
  }

  append(data) {
    const rows = document.createElement('tbody')

    this.data = [...this.data, ...data]

    rows.innerHTML = this.getTableRows(data)

    // TODO: This is comparison of performance append vs insertAdjacentHTML
    // console.time('timer');
    // this.subElements.body.insertAdjacentHTML('beforeend', rows.innerHTML);
    this.subElements.body.append(...rows.childNodes)
    // console.timeEnd('timer');
  }

  async update(externalParams = {}) {
    if (this.loadType === 'update') return
    this.loadType = 'update'

    this.addRows([])

    this.start = 1
    this.end = this.start + this.step

    const data = await this.loadData(this.url, {
      _start: this.start,
      _end: this.end,
      ...externalParams
    })

    this.loadType = null

    this.renderRows(data)
  }

  getTableHeader() {
    return `
      <thead data-testid="thead">
        <tr data-elem="header" class="sortable-table__header sortable-table__row">
          ${this.headersConfig.map(item => this.getHeaderRow(item)).join('')}
        </tr>
      </thead>`
  }

  getHeaderRow({ id, title, sortable }) {
    const order = this.sorted.id === id ? this.sorted.order : 'asc'

    return `
      <th class="sortable-table__cell" data-id="${id}" data-order="${order}" ${
      sortable ? 'aria-disabled="true" data-sortable' : ''
    }>
        <span>${title}</span>
        ${this.getHeaderSortingArrow(id)}
      </th>
    `
  }

  getHeaderSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : ''

    return isOrderExist
      ? `<span data-elem="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : ''
  }

  getTableBody(data) {
    return `
      <tbody data-elem="body" class="sortable-table__body" data-testid="tbody">
        ${this.getTableRows(data)}
      </tbody>`
  }

  getTableRows(data) {
    return data
      .map(
        item => `<tr data-id="${item.id}" class="sortable-table__row">
          ${this.getTableRow(item, data)}
        </tr>`
      )
      .join('')
  }

  getTableRow(item) {
    const cells = this.headersConfig.map(({ id, template }) => {
      return {
        id,
        template
      }
    })

    return cells
      .map(({ id, template }) => {
        const value = id.split('.').reduce((item, prop) => item[prop], item)

        return template ? template(value) : `<td class="sortable-table__cell">${value}</td>`
      })
      .join('')
  }

  getTable() {
    return `
      <div class="sortable-table" data-testid="container">
      
        <table class="sortable-table__table" role="grid">
          ${this.getTableHeader()}
          ${this.getTableBody(this.data)}
        </table>

        <div data-elem="loading" class="loading-line sortable-table__loading-line"  role="progress"></div>
        
        <div data-elem="placeholder" class="sortable-table__empty-placeholder" data-testid="placeholder">
          <p>No products</p>
        </div>


      </div>`
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick)
    this.subElements.body.addEventListener('pointerdown', this.onProductClick)
    document.addEventListener('scroll', this.onWindowScroll)
  }

  sortLocally(id, order) {
    const sortedData = this.sortData(id, order)

    this.subElements.body.innerHTML = this.getTableRows(sortedData)
  }

  async sortOnServer(id, order, start, end) {
    this.loadType = 'onsort'

    this.addRows([])

    const data = await this.loadData(this.url, {
      _sort: id,
      _order: order,
      _start: start,
      _end: end
    })

    if (this.loadType !== 'onsort') return
    this.loadType = null

    this.renderRows(data)
  }

  renderRows(data) {
    if (data.length) {
      this.element.classList.remove('sortable-table_empty')
      this.addRows(data)
    } else {
      this.element.classList.add('sortable-table_empty')
    }
  }

  sortData(id, order) {
    const arr = [...this.data]
    const column = this.headersConfig.find(item => item.id === id)
    const { sortType, customSorting } = column
    const direction = order === 'asc' ? 1 : -1

    return arr.sort((a, b) => {
      switch (sortType) {
        case 'number':
          return direction * (a[id] - b[id])
        case 'string':
          return direction * a[id].localeCompare(b[id], 'ru')
        case 'custom':
          return direction * customSorting(a, b)
        default:
          return direction * (a[id] - b[id])
      }
    })
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-elem]')

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.elem] = subElement

      return accum
    }, {})
  }

  remove() {
    this.element.remove()
    document.removeEventListener('scroll', this.onWindowScroll)
  }

  destroy() {
    this.remove()
    this.subElements = {}
  }
}
