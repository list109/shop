Object.defineProperty(window.HTMLHtmlElement.prototype, 'clientHeight', {
  get: function () {
    return this._mockClientHeight || 0
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
