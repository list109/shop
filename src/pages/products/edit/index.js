import ProductForm from '../../../components/product-form/index.js'

export default class Edit {
  element
  subElements = {}
  components = {}
  productId = location.pathname.split('/').slice(-1)[0]

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
      <div class="products-edit" data-page-label="products">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Список товаров</a> / ${
              this.productId === 'add' ? 'Добавить товар' : 'Редактировать'
            }
          </h1>
        </div>
        <div class="content-box full-height">
          <div class="product-form" data-elem="productForm"></div>
        </div>
      </div>
    `
  }

  initComponents() {
    const productForm = new ProductForm(this.productId === 'add' ? null : this.productId, {
      label: 'Product form'
    })

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
