import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { prepareForDom } from '../../utils/prepare-for-dom.js'
import { server } from '../../mocks/server/server.js'
import RangeSlider from './index.js'

const SUBCATEGORY_DATA = [
  {
    category: 'category-1',
    count: 35,
    id: 'subcategory-1',
    title: 'subcategory-1',
    weight: 2
  },
  {
    category: 'category-1',
    count: 40,
    id: 'subcategory-2',
    title: 'subcategory-2',
    weight: 3
  },
  {
    category: 'category-1',
    count: 25,
    id: 'subcategory-3',
    title: 'subcategory-3',
    weight: 4
  }
]

function createListItems() {
  const wrapper = document.createElement('div')

  wrapper.innerHTML = getListItemsTemplate(SUBCATEGORY_DATA)
  return [...wrapper.children]
}

function getListItemsTemplate(data) {
  return data
    .map(
      ({ id, title, count }) =>
        `<li class="categories__sortable-list-item" data-id="${id}" data-grab-handle>
    <strong>${title}</strong>
    <span><b>${count}</b> product${count > 1 ? 's' : ''}</span>
    </li>`
    )
    .join('')
}

function arrangeElements({ list, listItems }) {
  const coords = { left: 100, x: 100, right: 800, top: 100, y: 100, bottom: 420 }
  list._mockClientRect = { ...coords }
  listItems[0]['_mockClientRect'] = { ...coords, bottom: 200 }
  listItems[1]['_mockClientRect'] = { ...coords, top: 210, y: 210, bottom: 310 }
  listItems[2]['_mockClientRect'] = { ...coords, top: 320, y: 320 }

  list._mockOffsetWidth = 700
  list._mockOffsetHeight = 320

  document.documentElement._mockClientHeight = 900

  listItems.forEach(item => {
    item['_mockOffsetWidth'] = 700
    item['_mockOffsetHeight'] = 100
  })
}

function getPlaceholderOf(item) {
  const placeholder = screen.queryByTestId('placeholder')
  placeholder._mockClientRect = item.getBoundingClientRect()
  return placeholder
}

const grabItem = function (target, { x, y }) {
  return this.pointer({
    target,
    keys: '[MouseLeft>]',
    coords: { clientX: x, clientY: y }
  })
}

const dragItemTo = function (target, { x, y }) {
  return this.pointer({
    target,
    coords: { clientX: x, clientY: y }
  })
}

const releaseItem = function () {
  return this.pointer('[/MouseLeft]')
}

function setup() {
  const listItems = createListItems()

  const rangeSlider = getRangeSlider({ items: listItems })
  rangeSlider.render()

  const { element: list } = rangeSlider
  const user = userEvent.setup()

  arrangeElements({ list, listItems })

  return {
    rangeSlider,
    list,
    getListItems: list => within(list).getAllByRole('listitem'),
    user,
    grabItem: grabItem.bind(user),
    dragItemTo: dragItemTo.bind(user),
    releaseItem: releaseItem.bind(user)
  }
}

const getRangeSlider = prepareForDom(obj => new RangeSlider({ ...obj }))

describe('SortableList', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  afterEach(() => (document.body.innerHTML = ''))

  it('should be in the document', () => {
    const { rangeSlider, list } = setup()

    expect(list).toBeInTheDocument()

    rangeSlider.clear()
  })

  it('should have the li elements rendered', () => {
    const { rangeSlider, getListItems, list } = setup()
    const listItems = getListItems(list)

    listItems.forEach(item => expect(item).toBeInTheDocument())

    expect(listItems).toHaveLength(3)

    rangeSlider.clear()
  })

  it('should has a placeholder on the place where the item has been grabed', async () => {
    const { rangeSlider, list, grabItem, releaseItem, getListItems } = setup()
    const listItems = getListItems(list)

    for (let i = 0; i < listItems.length; i++) {
      await grabItem(listItems[i], { x: 110, y: 110 })

      const placeholder = getPlaceholderOf(listItems[i])
      expect(placeholder).toBeInTheDocument()
      expect(getListItems(list).indexOf(placeholder)).toBe(i)
      await releaseItem()
    }

    rangeSlider.clear()
  })

  it('should keep the first item at the initial position if it was released at the upper point', async () => {
    const { rangeSlider, list, grabItem, dragItemTo, releaseItem, getListItems } = setup()
    const [firstItem] = getListItems(list)

    expect(getListItems(list).indexOf(firstItem)).toBe(0)

    await grabItem(firstItem, { x: 110, y: 110 })

    await dragItemTo(document.body, { x: 110, y: 40 })

    const { left, top } = firstItem.style

    expect(left).toBe('100px')
    expect(top).toBe('30px')
    expect(getListItems(list).indexOf(firstItem)).toBe(3)

    await releaseItem()

    expect(getListItems(list).indexOf(firstItem)).toBe(0)

    rangeSlider.clear()
  })

  it('should change the position of the first element if it was released below its initial place', async () => {
    const { rangeSlider, list, grabItem, dragItemTo, releaseItem, getListItems } = setup()
    const [firstItem] = getListItems(list)

    expect(getListItems(list).indexOf(firstItem)).toBe(0)

    await grabItem(firstItem, { x: 110, y: 110 })
    await dragItemTo(document.body, { x: 110, y: 270 })
    await releaseItem()

    expect(getListItems(list).indexOf(firstItem)).toBe(1)

    await grabItem(firstItem, { x: 110, y: 220 })
    await dragItemTo(document.body, { x: 110, y: 500 })
    await releaseItem()

    expect(getListItems(list).indexOf(firstItem)).toBe(2)

    rangeSlider.clear()
  })

  it('should change the position of the last element if it was released upper its initial place', async () => {
    const { rangeSlider, list, grabItem, dragItemTo, releaseItem, getListItems } = setup()
    const lastItem = getListItems(list).slice(-1)[0]

    expect(getListItems(list).indexOf(lastItem)).toBe(2)

    await grabItem(lastItem, { x: 110, y: 330 })
    await dragItemTo(document.body, { x: 110, y: 250 })

    await releaseItem()
    expect(getListItems(list).indexOf(lastItem)).toBe(1)

    await grabItem(lastItem, { x: 110, y: 220 })
    await dragItemTo(document.body, { x: 110, y: 40 })
    await releaseItem()

    expect(getListItems(list).indexOf(lastItem)).toBe(0)

    rangeSlider.clear()
  })

  it('should keep the last item at the initial position if it was released at the point down below', async () => {
    const { rangeSlider, list, grabItem, dragItemTo, releaseItem, getListItems } = setup()

    const lastItem = getListItems(list).slice(-1)[0]

    expect(getListItems(list).indexOf(lastItem)).toBe(2)

    await grabItem(lastItem, { x: 110, y: 330 })

    await dragItemTo(document.body, { x: 110, y: 500 })

    const { left, top } = lastItem.style

    expect(left).toBe('100px')
    expect(top).toBe('490px')
    expect(getListItems(list).indexOf(lastItem)).toBe(2)

    await releaseItem()

    expect(getListItems(list).indexOf(lastItem)).toBe(2)

    rangeSlider.clear()
  })

  it('should change the position of the middle item when it is dragged upwards', async () => {
    const { rangeSlider, list, grabItem, dragItemTo, releaseItem, getListItems } = setup()
    const middleItem = getListItems(list)[1]

    expect(getListItems(list).indexOf(middleItem)).toBe(1)

    await grabItem(middleItem, { x: 110, y: 220 })
    await dragItemTo(document.body, { x: 110, y: 40 })
    await releaseItem()

    expect(getListItems(list).indexOf(middleItem)).toBe(0)

    rangeSlider.clear()
  })

  it('should change the position of the middle item when it is dragged downwards', async () => {
    const { rangeSlider, list, grabItem, dragItemTo, releaseItem, getListItems } = setup()
    const middleItem = getListItems(list)[1]

    expect(getListItems(list).indexOf(middleItem)).toBe(1)

    await grabItem(middleItem, { x: 110, y: 220 })
    await dragItemTo(document.body, { x: 110, y: 500 })
    await releaseItem()

    expect(getListItems(list).indexOf(middleItem)).toBe(2)

    rangeSlider.clear()
  })

  it('should not have a support to grab two or more items', async () => {
    const { rangeSlider, list, user, getListItems } = setup()
    const [firstItem, middleItem] = getListItems(list)

    expect(firstItem).not.toHaveClass('sortable-list__item_dragging')

    expect(getListItems(list).indexOf(firstItem)).toBe(0)

    await user.pointer({ keys: '[TouchA>]', target: firstItem })

    expect(firstItem).toHaveClass('sortable-list__item_dragging')

    await user.pointer({ keys: '[TouchB>]', target: middleItem })

    expect(middleItem).not.toHaveClass('sortable-list__item_dragging')

    rangeSlider.clear()
  })
})
