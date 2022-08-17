import ProductForm from '../../../components/product-form/index.js'

export default class Edit {
  element
  subElements = {}
  components = {}

  async render() {
    const element = document.createElement('div')

    element.innerHTML = this.template

    this.element = element.firstElementChild

    this.subElements = this.getSubElements(this.element)

    this.initComponents()

    await this.renderComponents()

    return this.element
  }

  get template() {
    return `
      <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Products</a> / Edit
          </h1>
        </div>
        <div class="content-box full-height">
          <div class="product-form" data-elem="productForm"></div>
        </div>
      </div>
    `
  }

  initComponents() {
    const productId = location.pathname.split('/').slice(-1)[0]
    const productForm = new ProductForm(productId)

    this.components.productForm = productForm
  }

  async renderComponents() {
    Object.keys(this.components)
      .filter(component => component !== 'productForm')
      .forEach(component => {
        const root = this.subElements[component]
        const { element } = this.components[component]

        root.append(element)
      })

    const element = await this.components.productForm.render()
    this.subElements.productForm.append(element)
  }

  getSubElements($element) {
    const elements = $element.querySelectorAll('[data-elem]')

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.elem] = subElement

      return accum
    }, {})
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy()
    }
  }
}
