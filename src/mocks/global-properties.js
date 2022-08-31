Object.defineProperty(window.HTMLHtmlElement.prototype, 'clientHeight', {
  get: function () {
    return this._mockClientHeight || 0
  }
})

Object.defineProperty(window.HTMLHtmlElement.prototype, 'offsetHeight', {
  get: function () {
    return this._mockOffsetHeight || 0
  }
})

Object.defineProperty(window.HTMLElement.prototype, 'offsetHeight', {
  get: function () {
    return this._mockOffsetHeight || 0
  }
})

Object.defineProperty(window.HTMLHtmlElement.prototype, 'offsetWidth', {
  get: function () {
    return this._mockOffsetWidth || 0
  }
})

Object.defineProperty(window.HTMLElement.prototype, 'getBoundingClientRect', {
  value: function getBoundingClientRect() {
    return this._mockClientRect || Element.prototype.getBoundingClientRect.call(this)
  }
})

Object.defineProperty(window.HTMLElement.prototype, 'trim', {
  value: function () {
    this.innerHTML = this.innerHTML.trim()
    return this
  }
})

Event.prototype.button = 0
