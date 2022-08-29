let currentNotificationInstance

export default class Notification {
  onClose = ({ target }) => {
    target.classList.contains('close') && this.remove()
  }

  constructor({ message, status, timer }) {
    this.message = message
    this.status = status
    currentNotificationInstance && currentNotificationInstance.close()
    currentNotificationInstance = this

    this.render()

    this.element.classList.add('show')

    this.initiateTimeout(timer)
    this.element.style.setProperty('--value', `${this.timeout / 1000}s`)

    this.initEventListeners()
  }

  render() {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = this.template
    this.element = wrapper.firstElementChild
    document.body.append(this.element)
  }

  get template() {
    return `
      <div class="notification notification_${this.status} inner-wrapper">     
        <div class="notification__content">${this.message}</div>
        <button class="close"></button>
        <div class="timer"></div>
      </div>`
  }

  initiateTimeout(timer) {
    switch (timer) {
      case undefined:
        this.timeout = this.getDefaultTimeout()
        break
      case 'slow':
        this.timeout = 5e3
        break
      case 'fast':
        this.timeout = 1500
        break
      default:
        this.timeout = timer
    }
    setTimeout(() => this.close(), this.timeout)
  }

  getDefaultTimeout() {
    return 3e3
  }

  initEventListeners() {
    this.element.addEventListener('click', this.onClose)
  }

  close() {
    this.element.parentNode && this.element.remove()
  }

  remove() {
    this.close()
    currentNotificationInstance = null
  }
}

export class OnSuccess extends Notification {
  constructor(message, timer) {
    super({ message, timer, status: 'success' })
  }
}

export class OnError extends Notification {
  getDefaultTimeout() {
    return 4e4
  }

  constructor(message, timer) {
    super({ message, timer, status: 'error' })
  }
}

export function removeCurrentNotification() {
  currentNotificationInstance &&
    currentNotificationInstance.remove &&
    currentNotificationInstance.remove()
}

export function sendNotification() {}
