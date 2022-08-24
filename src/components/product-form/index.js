import SortableList from '../sortable-list/index.js'
import escapeHtml from '../../utils/escape-html.js'
import fetchJson from '../../utils/fetch-json.js'

export default class ProductForm {
  element
  subElements = {}
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  }

  onSubmit = event => {
    event.preventDefault()

    this.save()
  }

  uploadImage = () => {
    const fileInput = document.createElement('input')

    fileInput.type = 'file'
    fileInput.accept = 'image/*'

    fileInput.onchange = async () => {
      const [file] = fileInput.files

      if (file) {
        const formData = new FormData()
        const { uploadImage, imageListContainer } = this.subElements

        formData.append('image', file)

        uploadImage.classList.add('is-loading')
        uploadImage.disabled = true

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
          },
          body: formData
        })

        imageListContainer.firstElementChild.append(this.getImageItem(result.data.link, file.name))

        uploadImage.classList.remove('is-loading')
        uploadImage.disabled = false

        // Remove input from body
        fileInput.remove()
      }
    }

    // must be in body for IE
    fileInput.hidden = true
    document.body.appendChild(fileInput)
    fileInput.click()
  }

  constructor(productId) {
    this.productId = productId
  }

  template() {
    return `
      <div class="product-form">

      <form role="form" data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label" for="title">Product's name</label>
            <p class="required">
              <input required
                id="title"
                value=""
                type="text"
                name="title"
                class="form-control"
                placeholder="Product's name"
                data-testid="title">
            </p>
          </fieldset>
        </div>

        <div class="form-group form-group__wide">
          <label class="form-label" for="description">Description</label>
          <p class="required">
            <textarea required
              id="description"
              class="form-control"
              name="description"
              placeholder="Product's description"
              data-testid="description"></textarea>
          </p>
        </div>

        <div class="form-group form-group__wide">
          <label class="form-label">Photo</label>

          <div data-element="imageListContainer"></div>

          <button data-element="uploadImage" type="button" class="button-primary-outline">
            <span>Upload</span>
          </button>
        </div>

        <div class="form-group form-group__half_left">
          <label class="form-label" for="subcategory">Category</label>
            ${this.createCategoriesSelect()}
        </div>

        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label" for="price">Price ($)</label>
            <p class="required">
              <input required
                id="price"
                value=""
                type="number"
                name="price"
                class="form-control"
                placeholder="${this.defaultFormData.price}"
                data-testid="price">
            </p>
          </fieldset>
          <fieldset>
            <label class="form-label" for="discount">Discount ($)</label>
            <p class="required">
              <input required
                id="discount"
                value=""
                type="number"
                name="discount"
                class="form-control"
                placeholder="${this.defaultFormData.discount}"
                data-testid="discount">
            </p>
          </fieldset>
        </div>

        <div class="form-group form-group__part-half">
          <label class="form-label" for="quantity">Quantity</label>
          <p class="required">
            <input required
              id="quantity"
              value=""
              type="number"
              class="form-control"
              name="quantity"
              placeholder="${this.defaultFormData.quantity}"
              data-testid="quantity">
          </p>
        </div>

        <div class="form-group form-group__part-half">
          <label class="form-label" for="status">Status</label>
          
            <select id="status" class="form-control" name="status" data-testid="status">
              <option value="1">Active</option>
              <option value="0">Unactive</option>
            </select>
        </div>

        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            ${this.productId ? 'Save' : 'Add'} the product
          </button>
        </div>
      </form>
    </div>
    `
  }

  async render() {
    const categoriesPromise = this.loadCategoriesList()
    const productPromise = this.productId
      ? this.loadProductData(this.productId)
      : Promise.resolve([this.defaultFormData])

    const [categoriesData, productResponse] = await Promise.all([categoriesPromise, productPromise])
    const [productData] = productResponse

    this.formData = productData
    this.categories = categoriesData

    this.renderForm()

    if (this.subElements.productForm) {
      this.setFormData()
      this.createImagesList()
      this.initEventListeners()
    }

    return this.element
  }

  renderForm() {
    const element = document.createElement('div')
    element.innerHTML = this.formData ? this.template() : this.getEmptyTemplate()

    this.element = element.firstElementChild
    this.subElements = this.getSubElements(element)
  }

  getEmptyTemplate() {
    return `<div>
      <h1 class="page-title">the Page has not been found</h1>
      <p>Sorry, but it seems the given product does not exist</p>
    </div>`
  }

  async save() {
    const product = this.getFormData()
    const result = await fetchJson(`${process.env.BACKEND_URL}api/rest/products`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    })

    this.dispatchEvent(result.id)
  }

  getFormData() {
    const { productForm, imageListContainer } = this.subElements
    const excludedFields = ['images']
    const formatToNumber = ['price', 'quantity', 'discount', 'status']
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item))
    const values = {}

    for (const field of fields) {
      values[field] = formatToNumber.includes(field)
        ? parseInt(productForm[field].value)
        : productForm[field].value
    }

    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img')

    values.images = []
    values.id = this.productId

    for (const image of imagesHTMLCollection) {
      values.images.push({
        url: image.src,
        source: image.alt
      })
    }

    return values
  }

  dispatchEvent(id) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id })
      : new CustomEvent('product-saved')

    this.element.dispatchEvent(event)
  }

  setFormData() {
    const { productForm } = this.subElements
    const excludedFields = ['images']
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item))

    fields.forEach(item => {
      const element = productForm.querySelector(`#${item}`)

      element.value = this.formData[item] || this.defaultFormData[item]
    })
  }

  async loadProductData(productId) {
    return await fetchJson(`${process.env.BACKEND_URL}api/rest/products?id=${productId}`)
  }

  async loadCategoriesList() {
    return await fetchJson(
      `${process.env.BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`
    )
  }

  createCategoriesSelect() {
    const wrapper = document.createElement('div')

    wrapper.innerHTML =
      '<select class="form-control" id="subcategory" name="subcategory" data-testid="subcategory"></select>'

    const select = wrapper.firstElementChild

    for (const category of this.categories) {
      for (const child of category.subcategories) {
        select.append(new Option(`${category.title} > ${child.title}`, child.id))
      }
    }

    return select.outerHTML
  }

  getSubElements(element) {
    const subElements = {}
    const elements = element.querySelectorAll('[data-element]')

    for (const item of elements) {
      subElements[item.dataset.element] = item
    }

    return subElements
  }

  createImagesList() {
    const { imageListContainer } = this.subElements
    const { images } = this.formData

    const items = images.map(({ url, source }) => this.getImageItem(url, source))

    const sortableList = new SortableList({
      items
    })

    imageListContainer.append(sortableList.element)
  }

  getImageItem(url, name) {
    const wrapper = document.createElement('div')

    wrapper.innerHTML = `
      <li class="products-edit__image-list-item sortable-list__item">
        <span>
          <img src="../icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
          <span class="sortable-list__item-title">${escapeHtml(name)}</span>
        </span>

        <button type="button">
          <img src="../icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`

    return wrapper.firstElementChild
  }

  initEventListeners() {
    const { productForm, uploadImage } = this.subElements

    productForm.addEventListener('submit', this.onSubmit)
    uploadImage.addEventListener('click', this.uploadImage)
  }

  destroy() {
    this.remove()
    this.element = null
    this.subElements = {}
  }

  remove() {
    this.element.remove()
  }
}
