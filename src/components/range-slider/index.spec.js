import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { prepareForDom } from '../../utils/prepare-for-dom'
import RangeSlider from './index.js'

const getRangeSlider = prepareForDom(obj => new RangeSlider({ ...obj }))

function setup(obj) {
  const rangeSlider = getRangeSlider(obj)
  rangeSlider.render()
  const thumbLeft = screen.getByTestId('thumbLeft')
  const thumbRight = screen.getByTestId('thumbRight')
  const inner = screen.getByTestId('inner')
  const to = screen.getByTestId('to')
  const from = screen.getByTestId('from')
  const user = userEvent.setup()

  return { rangeSlider, thumbLeft, thumbRight, inner, to, from, user }
}

describe('RangeSlider', () => {
  afterEach(() => (document.body.innerHTML = ''))

  it('should be in the document', () => {
    const rangeSlider = getRangeSlider({ max: 4000 })
    rangeSlider.render()

    expect(rangeSlider.element).toBeInTheDocument()

    rangeSlider.clear()
  })
  it('should indicate initial range values', () => {
    const { rangeSlider, from, to } = setup({ max: 4000 })

    expect(from).toHaveTextContent('0')
    expect(to).toHaveTextContent('4000')

    rangeSlider.clear()
  })
  it('should have a specific class when either thumb is being held', async () => {
    const { rangeSlider, thumbRight, thumbLeft, user } = setup({ max: 4000 })

    await user.pointer({ keys: '[MouseLeft>]', target: thumbLeft })
    expect(rangeSlider.element).toHaveClass('range-slider_dragging')

    await user.pointer('[/MouseLeft]')

    await user.pointer({ keys: '[MouseLeft>]', target: thumbRight })
    expect(rangeSlider.element).toHaveClass('range-slider_dragging')

    rangeSlider.clear()
  })
  it('should have ability to change the range From value', async () => {
    const { rangeSlider, thumbRight, thumbLeft, inner, from, user } = setup({ max: 4000 })

    inner._mockClientRect = { left: 100, right: 400, width: 300 }
    thumbLeft._mockClientRect = { left: 92, right: 100, width: 8 }
    thumbRight._mockClientRect = { left: 400, right: 408, width: 8 }

    await user.pointer({ keys: '[MouseLeft>]', target: thumbLeft, coords: { clientX: 98 } })
    await user.pointer({ target: inner, coords: { clientX: 248 } })
    expect(from).toHaveTextContent(rangeSlider.instance.max / 2)

    rangeSlider.clear()
  })
  it('should have ability to change the To range value', async () => {
    const { rangeSlider, thumbRight, thumbLeft, inner, to, user } = setup({ max: 4000 })

    inner._mockClientRect = { left: 100, right: 400, width: 300 }
    thumbLeft._mockClientRect = { left: 92, right: 100, width: 8 }
    thumbRight._mockClientRect = { left: 400, right: 408, width: 8 }

    await user.pointer({ keys: '[MouseLeft>]', target: thumbRight, coords: { clientX: 404 } })
    await user.pointer({ target: inner, coords: { clientX: 254 } })
    expect(to).toHaveTextContent(rangeSlider.instance.max / 2)

    rangeSlider.clear()
  })
  it('should not go outside the left edge if it is the left thumb', async () => {
    const { rangeSlider, thumbRight, thumbLeft, inner, from, user } = setup({ max: 4000 })

    inner._mockClientRect = { left: 100, right: 400, width: 300 }
    thumbLeft._mockClientRect = { left: 92, right: 100, width: 8 }
    thumbRight._mockClientRect = { left: 400, right: 408, width: 8 }

    await user.pointer({ keys: '[MouseLeft>]', target: thumbLeft, coords: { clientX: 98 } })
    await user.pointer({ coords: { clientX: 50 } })
    expect(from).toHaveTextContent(0)

    rangeSlider.clear()
  })
  it('should not go outside the right thumb position if it is the left thumb', async () => {
    const { rangeSlider, thumbRight, thumbLeft, inner, from, user } = setup({ max: 4000 })

    inner._mockClientRect = { left: 100, right: 400, width: 300 }
    thumbLeft._mockClientRect = { left: 92, right: 100, width: 8 }
    thumbRight._mockClientRect = { left: 250, right: 258, width: 8 }

    await user.pointer({ keys: '[MouseLeft>]', target: thumbLeft, coords: { clientX: 98 } })
    await user.pointer({ coords: { clientX: 500 } })
    expect(from).toHaveTextContent(rangeSlider.instance.max / 2)

    rangeSlider.clear()
  })
  it('should not go outside the right edge if it is the right thumb', async () => {
    const { rangeSlider, thumbRight, thumbLeft, inner, to, user } = setup({ max: 4000 })

    inner._mockClientRect = { left: 100, right: 400, width: 300 }
    thumbLeft._mockClientRect = { left: 92, right: 100, width: 8 }
    thumbRight._mockClientRect = { left: 400, right: 408, width: 8 }

    await user.pointer({ keys: '[MouseLeft>]', target: thumbRight, coords: { clientX: 404 } })
    await user.pointer({ coords: { clientX: 450 } })
    expect(to).toHaveTextContent(rangeSlider.instance.max)

    rangeSlider.clear()
  })
  it('should not go outside the left thumb position if it is the right thumb', async () => {
    const { rangeSlider, thumbRight, thumbLeft, inner, to, user } = setup({ max: 4000 })

    inner._mockClientRect = { left: 100, right: 400, width: 300 }
    thumbLeft._mockClientRect = { left: 242, right: 250, width: 8 }
    thumbRight._mockClientRect = { left: 400, right: 408, width: 8 }

    await user.pointer({ keys: '[MouseLeft>]', target: thumbRight, coords: { clientX: 404 } })
    await user.pointer({ coords: { clientX: 50 } })
    expect(to).toHaveTextContent(rangeSlider.instance.max / 2)

    rangeSlider.clear()
  })
  it('should have equal values if both thumbs meet in the center', async () => {
    const { rangeSlider, thumbRight, thumbLeft, inner, from, to, user } = setup({ max: 4000 })

    inner._mockClientRect = { left: 100, right: 400, width: 300 }
    thumbLeft._mockClientRect = { left: 92, right: 100, width: 8 }
    thumbRight._mockClientRect = { left: 400, right: 408, width: 8 }

    await user.pointer({ keys: '[MouseLeft>]', target: thumbLeft, coords: { clientX: 404 } })
    await user.pointer({ coords: { clientX: 250 } })

    await user.pointer('[/MouseLeft]')

    await user.pointer({ keys: '[MouseLeft>]', target: thumbRight, coords: { clientX: 240 } })

    expect(from.toHaveTextContent).toEqual(to.toHaveTextContent)

    rangeSlider.clear()
  })

  it('should make up the total if both thumbs are against each other no matter where they meet', async () => {
    const { rangeSlider, thumbRight, thumbLeft, inner, from, to, user } = setup({ max: 4000 })

    inner._mockClientRect = { left: 100, right: 400, width: 300 }
    thumbLeft._mockClientRect = { left: 92, right: 100, width: 8 }
    thumbRight._mockClientRect = { left: 400, right: 408, width: 8 }

    await user.pointer({ keys: '[MouseLeft>]', target: thumbLeft, coords: { clientX: 404 } })
    await user.pointer({ coords: { clientX: 200 } })

    await user.pointer('[/MouseLeft]')

    await user.pointer({ keys: '[MouseLeft>]', target: thumbRight, coords: { clientX: 50 } })

    const total = parseInt(to.textContent, 10) + parseInt(from.textContent, 10)
    expect(total).toEqual(rangeSlider.instance.max)

    rangeSlider.clear()
  })
})
