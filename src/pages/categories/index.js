import fetchJson from '../../utils/fetch-json.js'
import SortableList from '../../components/sortable-list/index.js'
import * as notifications from '../../components/notification/index.js'

export default class Categories {
  components = []

  onHeaderClick(header) {
    header.closest('.category').classList.toggle('category_open')
  }

  async onReorder(items) {
    const body = items.reduce((arr, item, i) => {
      arr.push({ id: item.dataset.id, weight: i + 1 })
      return arr
    }, [])

    try {
      await fetchJson(`${process.env.BACKEND_URL}api/rest/subcategories`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body)
      })
    } catch (err) {
      new notifications.OnError(`Could not send data (${err.message})`)
      return
    }

    new notifications.OnSuccess('Category order saved')
  }

  async render() {
    this.data = await this.loadCategoriesList()

    const element = document.createElement('div')

    element.innerHTML = this.template

    this.element = element.firstElementChild

    this.appendLists()

    this.initEventListeners()

    return this.element
  }

  async loadCategoriesList() {
    let categories

    try {
      categories = await fetchJson(
        `${process.env.BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`
      )
    } catch (err) {
      new notifications.OnError(`Categories page: Could not load data (${err.message})`)
    }

    return categories
  }

  get template() {
    return `
    <div class="categories">
      <div class="content__top-panel">
      <h1 class="page-title">Categories</h1>
      </div>  
      ${this.data ? this.getBodyTemplate() : this.getErrorTemplate()}
    </div>`
  }

  getBodyTemplate() {
    return `
      <p>Subcategories can be dragged to change their order within the category.</p>
      <div data-elem="categoriesContainer">${this.getCategories(this.data)}</div>
    `
  }

  getErrorTemplate() {
    return '<p>Could not load data</p>'
  }

  getCategories(categories) {
    return categories
      .map(
        category => `
          <div class="category category_open" data-id="${category.id}">
            <header class="category__header">${category.title}</header>
            <div class="category__body">
              ${this.getCategory(category)}
            </div>
          </div>`
      )
      .join('')
  }

  getCategory(category) {
    const subcategories = this.getSubcategories(category.subcategories)

    return `<div class="subcategory-list">${subcategories}</div>`
  }

  getSubcategories(subcategories) {
    return subcategories
      .map(
        ({ id, title, count }) =>
          `<li class="categories__sortable-list-item" data-id="${id}" data-grab-handle>
            <strong>${title}</strong>
            <span><b>${count}</b> product${count > 1 ? 's' : ''}</span>
          </li>`
      )
      .join('')
  }

  appendLists() {
    const containers = this.element.querySelectorAll('.subcategory-list')
    containers.forEach(container => {
      const sortableList = new SortableList({ items: [...container.children] })
      container.append(sortableList.element)

      this.components.push(sortableList)
    })
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', ({ target }) => {
      if (target.closest('.category__header')) {
        this.onHeaderClick(target)
      }
    })

    this.element.addEventListener(
      'sortable-list-reorder',
      ({ target: { children } }) => void this.onReorder([...children])
    )
  }

  destroy() {
    this.components.forEach(component => component.destroy())
  }
}
