import { screen, within, waitFor, fireEvent } from '@testing-library/react'
import { prepareForDom } from '../../utils/prepare-for-dom.js'
import { server } from '../../mocks/server/server.js'
import userEvent from '@testing-library/user-event'
import SortableTable from './index.js'
import header from '../../pages/dashboard/bestsellers-header.js'

const BACKEND_URL = `${HOST}/api/dashboard/bestsellers`

const getSortableTable = prepareForDom(
  obj => new SortableTable(header, { step: 20, start: 1, end: 21, ...obj })
)

function setup({ url = BACKEND_URL, ...rest } = {}) {
  const sortableTable = getSortableTable({ url, ...rest })
  sortableTable.render()

  const thead = screen.getByTestId('thead')
  const tbody = screen.getByTestId('tbody')
  const container = screen.getByTestId('container')
  const placeholder = screen.getByTestId('placeholder')
  const thElements = within(thead).getAllByRole('columnheader')
  const user = userEvent.setup()

  return { sortableTable, thead, thElements, tbody, container, placeholder, user }
}

const waitLoading = element => {
  return waitFor(() => {
    if (element.classList.contains('sortable-table_loading') === false) {
      return true
    }
    throw new Error('not loaded')
  })
}

describe('SortableTable', () => {
  beforeAll(() => server.listen())

  afterEach(() => server.resetHandlers())

  afterEach(() => (document.body.innerHTML = ''))

  afterAll(() => server.close())

  it('should be in the document', async () => {
    const { sortableTable } = setup()

    expect(screen.getByRole('grid')).toBeInTheDocument()

    await waitLoading(sortableTable.element)

    sortableTable.clear()
  })

  it('should render the exact quantity of head columns', async () => {
    const { sortableTable, thElements } = setup()

    expect(thElements).toHaveLength(header.length)

    await waitLoading(sortableTable.element)

    sortableTable.clear()
  })

  it('should render the exact quantity of cells', async () => {
    const { sortableTable, tbody } = setup()
    const tdElements = await within(tbody).findAllByRole('cell')
    const expectedQuantity = sortableTable.instance.data.length * header.length

    expect(tdElements).toHaveLength(expectedQuantity)

    sortableTable.clear()
  })

  it('should have the exact quantity of rows', async () => {
    const { sortableTable, tbody } = setup()

    const tdElements = await within(tbody).findAllByRole('row')
    const expectedQuantity = sortableTable.instance.data.length

    expect(tdElements).toHaveLength(expectedQuantity)

    sortableTable.clear()
  })

  it('should sort locally', async () => {
    const { sortableTable, user, tbody, thead } = setup({ isSortLocally: true })

    await waitLoading(sortableTable.element)

    for (let i = 0; i < header.length; i++) {
      const { sortable, title } = header[i]
      if (!sortable) {
        continue
      }

      const th = within(thead).getByRole('columnheader', { name: title })

      await user.click(th)

      let rows = within(tbody).getAllByRole('row')
      let firstRow = rows[0]
      let lastRow = rows[rows.length - 1]
      let topCell = within(firstRow).getAllByRole('cell')[i]
      let bottomCell = within(lastRow).getAllByRole('cell')[i]
      let topValue = parseInt(topCell.textContent, 10) || 2
      let bottomValue = parseInt(bottomCell.textContent, 10) || 1

      expect(topValue).toBeGreaterThan(bottomValue)

      await user.click(th)

      rows = within(tbody).getAllByRole('row')
      firstRow = rows[0]
      lastRow = rows[rows.length - 1]
      topCell = within(firstRow).getAllByRole('cell')[i]
      bottomCell = within(lastRow).getAllByRole('cell')[i]
      topValue = parseInt(topCell.textContent, 10) || 1
      bottomValue = parseInt(bottomCell.textContent, 10) || 2

      expect(topValue).toBeLessThan(bottomValue)
    }

    sortableTable.clear()
  })

  it('should sort on the server', async () => {
    const { sortableTable, user, tbody, thead } = setup({ isSortLocally: false })

    await waitLoading(sortableTable.element)

    for (let i = 0; i < header.length; i++) {
      const { sortable, title } = header[i]
      if (!sortable) {
        continue
      }

      const th = within(thead).getByRole('columnheader', { name: title })

      await user.click(th)

      await waitLoading(sortableTable.element)

      let rows = within(tbody).getAllByRole('row')
      let firstRow = rows[0]
      let lastRow = rows[rows.length - 1]
      let topCell = within(firstRow).getAllByRole('cell')[i]
      let bottomCell = within(lastRow).getAllByRole('cell')[i]
      let topValue = parseInt(topCell.textContent, 10) || 2
      let bottomValue = parseInt(bottomCell.textContent, 10) || 1

      expect(topValue).toBeGreaterThan(bottomValue)

      await user.click(th)

      await waitLoading(sortableTable.element)

      rows = within(tbody).getAllByRole('row')
      firstRow = rows[0]
      lastRow = rows[rows.length - 1]
      topCell = within(firstRow).getAllByRole('cell')[i]
      bottomCell = within(lastRow).getAllByRole('cell')[i]
      topValue = parseInt(topCell.textContent, 10) || 1
      bottomValue = parseInt(bottomCell.textContent, 10) || 2

      expect(topValue).toBeLessThan(bottomValue)
    }

    sortableTable.clear()
  })

  it('shoud have no ways to sort while loading', async () => {
    const { sortableTable, user, thElements } = setup({ isSortLocally: false })

    const sortableHeaders = thElements.filter(({ dataset }) => dataset.sortable === 'true')

    // //first loading
    sortableHeaders.forEach(th => expect(th).toHaveAttribute('aria-disabled', 'true'))

    await waitLoading(sortableTable.element)

    sortableHeaders.forEach(th => expect(th).toHaveAttribute('aria-disabled', 'false'))

    //second loading
    await user.click(sortableHeaders[0])

    sortableHeaders.forEach(th => expect(th).toHaveAttribute('aria-disabled', 'true'))

    await waitLoading(sortableTable.element)

    sortableHeaders.forEach(th => expect(th).toHaveAttribute('aria-disabled', 'false'))

    //third loading
    document.documentElement._mockClientHeight = 10
    fireEvent.scroll(document)
    document.documentElement._mockClientHeight = null

    sortableHeaders.forEach(th => expect(th).toHaveAttribute('aria-disabled', 'true'))

    await waitLoading(sortableTable.element)

    sortableHeaders.forEach(th => expect(th).toHaveAttribute('aria-disabled', 'false'))

    sortableTable.clear()
  })

  it('should indicate loading while data is being fetching', async () => {
    const { sortableTable, container } = setup()

    expect(container).toHaveClass('sortable-table_loading')

    await waitFor(() => {
      expect(container).not.toHaveClass('sortable-table_loading')
    })

    sortableTable.clear()
  })

  it('should indicate loading while data is being updating', async () => {
    const { sortableTable, container } = setup()

    await waitLoading(sortableTable.element)

    sortableTable.instance.update()

    expect(container).toHaveClass('sortable-table_loading')

    await waitFor(() => {
      expect(container).not.toHaveClass('sortable-table_loading')
    })

    sortableTable.clear()
  })

  it('should have a placeholder if no data is present', async () => {
    const { sortableTable, container, placeholder } = setup({ url: `${HOST}/api/empty_array` })

    expect(container).toHaveClass('sortable-table_loading')
    expect(container).not.toHaveClass('sortable-table_empty')

    await waitFor(() => {
      expect(container).not.toHaveClass('sortable-table_loading')
    })
    expect(container).toHaveClass('sortable-table_empty')

    expect(placeholder).toHaveTextContent(/No products/i)

    sortableTable.clear()
  })

  it('should have an error message if data loading has failed', async () => {
    const { sortableTable, container, placeholder } = setup({ url: `${HOST}/api/response/404` })

    expect(container).toHaveClass('sortable-table_loading')
    expect(container).not.toHaveClass('sortable-table_empty')

    await waitFor(() => {
      expect(container).not.toHaveClass('sortable-table_loading')
    })
    expect(container).toHaveClass('sortable-table_empty')
    expect(placeholder).toHaveTextContent(/No products/i)

    sortableTable.clear()
  })

  it('should have no body rows when there is loading new data', async () => {
    const { sortableTable, tbody, container, user } = setup({ isSortLocally: false })
    const name = header.find(({ sortable }) => sortable === true).title
    const sortableTh = screen.getByRole('columnheader', { name })

    //first loading
    expect(tbody.trim()).toBeEmptyDOMElement()
    expect(container).toHaveClass('sortable-table_loading')

    await waitLoading(sortableTable.element)

    expect(within(tbody).queryAllByRole('row')).not.toHaveLength(0)

    //second loading
    await user.click(sortableTh)

    expect(tbody.trim()).toBeEmptyDOMElement()
    expect(container).toHaveClass('sortable-table_loading')

    await waitLoading(sortableTable.element)

    expect(within(tbody).queryAllByRole('row')).not.toHaveLength(0)

    //third loading
    document.documentElement._mockClientHeight = 10
    fireEvent.scroll(document)
    document.documentElement._mockClientHeight = null

    expect(container).toHaveClass('sortable-table_loading')

    await waitLoading(sortableTable.element)

    expect(within(tbody).queryAllByRole('row')).not.toHaveLength(0)

    sortableTable.clear()
  })

  it('should have body rows while loading extra data', async () => {
    const { sortableTable, tbody, container } = setup()

    await waitLoading(sortableTable.element)

    expect(within(tbody).queryAllByRole('row')).not.toHaveLength(0)

    // loading additional data with scroll

    document.documentElement._mockClientHeight = 10
    fireEvent.scroll(document)
    document.documentElement._mockClientHeight = null

    expect(container).toHaveClass('sortable-table_loading')

    expect(within(tbody).queryAllByRole('row')).not.toHaveLength(0)

    await waitLoading(sortableTable.element)

    sortableTable.clear()
  })
})
