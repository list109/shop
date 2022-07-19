import { screen, within, waitFor } from '@testing-library/react'
import { prepareForDom } from '../../utils/prepare-for-dom.js'
import { server } from '../../mocks/server.js'
import ColumnChart from './index.js'
import { getDaysBetweenDates } from '../../utils/get-days-between-dates.js'
import fetchJson from '../../utils/fetch-json.js'
const BACKEND_URL = 'https://course-js.javascript.ru/api/dashboard/orders'

const getColumnChart = prepareForDom((...args) => new ColumnChart(...args))

const getUrl = ({ url, from, to }) => {
  const urlObj = new URL(url)
  urlObj.searchParams.set('from', from.toISOString())
  urlObj.searchParams.set('to', to.toISOString())
  return urlObj
}

describe('ColumnChart', () => {
  beforeAll(() => server.listen())

  afterEach(() => server.resetHandlers())

  afterAll(() => server.close())

  it('should be in the document', () => {
    const columnChart = getColumnChart({ url: BACKEND_URL })
    columnChart.render()

    expect(screen.getByRole('figure')).toBeInTheDocument()

    columnChart.clear()
  })

  it('should have a specified label', () => {
    const columnChart = getColumnChart({ url: BACKEND_URL, label: 'Total orders' })
    columnChart.render()

    expect(screen.getByRole('figure')).toHaveAccessibleName(/^Total orders/)

    columnChart.clear()
  })

  it('should have the exact quantity of columns whenever it gets data', async () => {
    const from = new Date(2020, 4, 10)
    const to = new Date(2020, 5, 10)
    const daysQuantity = getDaysBetweenDates(from, to)
    const url = getUrl({ url: BACKEND_URL, from, to })
    const columnChart = getColumnChart({ url })
    columnChart.render()

    const list = await screen.findByRole('list')
    const columns = within(list).getAllByRole('listitem')
    expect(columns).toHaveLength(daysQuantity)

    const newFrom = new Date(2019, 5, 15)
    const newTo = new Date(2019, 7, 8)
    const newDaysQuantity = getDaysBetweenDates(newFrom, newTo)

    await columnChart.instance.update({ from: newFrom, to: newTo })

    const newColumns = within(list).getAllByRole('listitem')
    expect(newColumns).toHaveLength(newDaysQuantity)

    columnChart.clear()
  })

  it('should have the correct output value whenever it gets data', async () => {
    const from = new Date(2020, 4, 10)
    const to = new Date(2020, 5, 10)
    const url = getUrl({ url: BACKEND_URL, from, to })
    const data = await fetchJson(url)
    const totalValue = Object.values(data).reduce((acc, i) => acc + i, 0)
    const columnChart = getColumnChart({ url })
    columnChart.render()

    const output = await screen.findByRole('status')

    expect(output).toHaveTextContent(totalValue)

    const newFrom = new Date(2019, 5, 15)
    const newTo = new Date(2019, 7, 8)
    const newUrl = getUrl({ url: BACKEND_URL, from: newFrom, to: newTo })
    const newData = await fetchJson(newUrl)
    const newTotalValue = Object.values(newData).reduce((acc, i) => acc + i, 0)

    await columnChart.instance.update({ from: newFrom, to: newTo })

    expect(output).not.toHaveTextContent(totalValue)
    expect(output).toHaveTextContent(newTotalValue)

    columnChart.clear()
  })

  it('should have the value null when data is missing', async () => {
    const columnChart = getColumnChart({
      url: 'https://course-js.javascript.ru/api/absence'
    })
    columnChart.render()

    const container = screen.getByTestId('column-chart-container')

    await waitFor(() => expect(container).toHaveAttribute('aria-hidden', 'false'))

    const output = screen.getByRole('status')
    expect(output).toHaveTextContent(0)

    columnChart.clear()
  })

  it('should indicate loading while fetching data', async () => {
    const from = new Date(2020, 4, 10)
    const to = new Date(2020, 5, 10)
    const url = getUrl({ url: BACKEND_URL, from, to })
    const columnChart = getColumnChart({ url })
    columnChart.render()
    const container = screen.getByTestId('column-chart-container')

    expect(container).toHaveAttribute('aria-hidden', 'true')

    await waitFor(() => expect(container).toHaveAttribute('aria-hidden', 'false'))

    columnChart.instance.update({ from: new Date(2019, 5, 15), to: new Date(2019, 7, 8) })

    expect(container).toHaveAttribute('aria-hidden', 'true')

    await waitFor(() => expect(container).toHaveAttribute('aria-hidden', 'false'))

    columnChart.clear()
  })
})
