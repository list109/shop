export default class RangeSlider {
  element
  currentThumb
  currentCursorShift

  onPointerDown = ({ target, clientX }) => {
    const { elem: dataName } = target.dataset

    if (this.currentThumb) return

    if (dataName.startsWith('thumb')) {
      this.currentThumb = target
      this.currentCursorShift = this.getCurrentCursorShift({ target, clientX })
      this.element.classList.add('range-slider_dragging')

      document.addEventListener('pointermove', this.onDragging)
      document.addEventListener('pointerup', this.onPointerUp)
    }
  }

  onPointerUp = () => {
    const { from, to } = this.subElements
    this.currentThumb = null
    this.currentCursorShift = null
    this.element.classList.remove('range-slider_dragging')
    document.removeEventListener('pointermove', this.onDragging)
    document.removeEventListener('pointerup', this.onPointerUp)

    this.element.dispatchEvent(
      new CustomEvent('slider-change', {
        bubbles: true,
        detail: {
          from: from.textContent,
          to: to.textContent
        }
      })
    )
  }

  onDragging = ({ clientX }) => {
    const { thumbLeft, thumbRight, progress, inner, from, to } = this.subElements
    const innerCoords = inner.getBoundingClientRect()
    const rightThumbCoords = thumbRight.getBoundingClientRect()
    const leftThumbCoords = thumbLeft.getBoundingClientRect()

    let point

    if (this.currentThumb === thumbRight) {
      clientX -= this.currentCursorShift
      point = Math.min(clientX, innerCoords.right)
      point = Math.max(point, leftThumbCoords.right)

      thumbRight.style.right = `${100 - this.convertToPersent(point)}%`
      to.textContent = Math.max(Math.round(this.getFraction(point) * this.max), from.textContent)
    }

    if (this.currentThumb === thumbLeft) {
      clientX += this.currentCursorShift
      point = Math.max(clientX, innerCoords.left)
      point = Math.min(point, rightThumbCoords.left)

      thumbLeft.style.left = `${this.convertToPersent(point)}%`
      from.textContent = Math.min(Math.round(this.getFraction(point) * this.max), to.textContent)
    }

    progress.style.right = thumbRight.style.right
    progress.style.left = thumbLeft.style.left
  }

  getCurrentCursorShift({ target: thumbElement, clientX }) {
    const { right, left } = thumbElement.getBoundingClientRect()

    return thumbElement === this.subElements.thumbRight ? clientX - left : right - clientX
  }

  convertToPersent = point => {
    const pointInPercent = this.getFraction(point) * 100

    return pointInPercent.toFixed(5)
  }

  getFraction = point => {
    const { inner } = this.subElements
    const innerCoords = inner.getBoundingClientRect()

    return (point - innerCoords.left) / innerCoords.width || 0
  }

  constructor({ max, prefix = '' }) {
    this.max = max
    this.prefix = prefix

    this.render()
  }

  async render() {
    const wrapper = document.createElement('div')

    wrapper.innerHTML = this.template

    this.element = wrapper.firstElementChild

    this.subElements = this.getSubElements(this.element)

    this.initEventListeners()
  }

  getSubElements(element) {
    const subElements = {}

    for (const subElement of element.querySelectorAll('[data-elem]')) {
      subElements[subElement.dataset.elem] = subElement
    }

    return subElements
  }

  get template() {
    return `
    <div class="range-slider">
      <span>${this.prefix}<output data-elem="from" data-testid="from">0</output></span>
      <div data-elem="inner" data-testid="inner" class="range-slider__inner">
        <span data-elem="progress" class="range-slider__progress" style="left: 0%; right: 0%;"></span>
        <span data-elem="thumbLeft" class="range-slider__thumb-left" style="left: 0%;" data-testid="thumbLeft"></span>
        <span data-elem="thumbRight" class="range-slider__thumb-right" style="right: 0%;" data-testid="thumbRight"></span>
      </div>
      <span>${this.prefix}<output data-elem="to" data-testid="to">${this.max}</output></span>
    </div>`
  }

  initEventListeners() {
    const { inner } = this.subElements

    inner.addEventListener('pointerdown', this.onPointerDown)
  }

  destroy() {
    this.element.remove()
  }
}
