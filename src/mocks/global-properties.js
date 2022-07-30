Object.defineProperty(window.HTMLHtmlElement.prototype, 'clientHeight', {
  get: function () {
    return this._mockClientHeight || 0
  }
})
