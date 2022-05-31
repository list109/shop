class Tooltip {
  static instance;

  element;

  onMouseOver = event => {
    const element = event.target.closest('[data-tooltip]');

    if (element) {
      this.render(element.dataset.tooltip);
      this.moveTooltip(event);

      document.addEventListener('pointermove', this.onMouseMove);
    }
  };

  onMouseMove = event => {
    this.moveTooltip(event);
  };

  onMouseOut = () => {
    this.removeTooltip();
  };

  removeTooltip() {
    if (this.element) {
      this.element.remove();
      this.element = null;

      document.removeEventListener('pointermove', this.onMouseMove);
    }
  }

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  initEventListeners() {
    document.addEventListener('pointerover', this.onMouseOver);
    document.addEventListener('pointerout', this.onMouseOut);
  }

  initialize() {
    this.initEventListeners();
  }

  render(html) {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML = html;

    document.body.append(this.element);
  }

  moveTooltip({ clientX, clientY }) {
    // TODO: Add logic for window borders
    const { offsetWidth: width, offsetHeight: height } = this.element;
    const { clientWidth: viewportWidth, clientHeight: viewportHeight } = document.documentElement;

    const left = clientX + 10;
    const top = clientY + 10;

    const posX = Math.min(viewportWidth - width, left);
    const directPosY = Math.min(viewportHeight - height, top);
    const reversePosY = clientY - height;
    const posY = clientY > directPosY ? reversePosY : directPosY;

    this.element.style.left = posX + 'px';
    this.element.style.top = posY + 'px';
  }

  destroy() {
    document.removeEventListener('pointerover', this.onMouseOver);
    document.removeEventListener('pointerout', this.onMouseOut);
    this.removeTooltip();
  }
}

const tooltip = new Tooltip();

export default tooltip;
