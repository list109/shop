import { screen, within, waitFor } from '@testing-library/react'
import { prepareForDom } from '../../utils/prepare-for-dom.js'
import { server } from '../../mocks/server/server.js'
import ColumnChart from './index.js'
import { getDaysBetweenDates } from '../../utils/get-days-between-dates.js'
import fetchJson from '../../utils/fetch-json.js'
import { stringToDate } from '../../utils/string-to-date.js'
import { getUrlObject } from '../../utils/get-url-object.js'

const BACKEND_URL = `${HOST}/api/dashboard/orders`

const getColumnChart = prepareForDom(obj => new ColumnChart({ ...obj }))

function setup({ url, from, to, ...rest } = {}) {
  const stuff = getStuff({ url, from, to })
  const columnChart = getColumnChart({ url: stuff.url, ...rest })
  columnChart.render()
  const container = screen.getByTestId('column-chart-container')

  return { columnChart, container, ...stuff }
}

function update(obj) {
  const stuff = getStuff(obj)
  return { ...stuff }
}

function getStuff({ url = BACKEND_URL, from = '', to = '' }) {
  const fromDate = stringToDate(from)
  const toDate = stringToDate(to)

  url = getUrlObject(url, { from: fromDate, to: toDate })
  const totalDays = getDaysBetweenDates(fromDate, toDate)

  return { url, totalDays, from: fromDate, to: toDate }
}

async function getTotalValue(url) {
  const data = await fetchJson(url)
  return Object.values(data).reduce((acc, i) => acc + i, 0)
}

describe('ColumnChart', () => {
  beforeAll(() => server.listen())

  afterEach(() => server.resetHandlers())

  afterEach(() => (document.body.innerHTML = ''))

  afterAll(() => server.close())

  it('should be in the document', () => {
    const { columnChart } = setup()

    expect(screen.getByRole('figure')).toBeInTheDocument()

    columnChart.clear()
  })

  it('should have a specified label', () => {
    const { columnChart } = setup({ label: 'Total orders' })

    expect(screen.getByRole('figure')).toHaveAccessibleName(/^Total orders/)

    columnChart.clear()
  })

  it('should have the exact quantity of columns whenever it gets data', async () => {
    const { totalDays, columnChart } = setup({ from: '2020/4/10', to: '2020/5/10' })

    const list = await screen.findByRole('list')
    const columns = within(list).getAllByRole('listitem')

    expect(columns).toHaveLength(totalDays)

    const { from, to, totalDays: newTotalDays } = update({ from: '2019/5/15', to: '2019/7/8' })

    await columnChart.instance.update({ from, to })

    const newColumns = within(list).getAllByRole('listitem')
    expect(newColumns).toHaveLength(newTotalDays)

    columnChart.clear()
  })

  it('should have the correct output value whenever it gets data', async () => {
    const { columnChart, url } = setup({ from: '2020/4/10', to: '2020/5/10' })
    const totalValue = await getTotalValue(url)

    const output = await screen.findByRole('status')

    expect(output).toHaveTextContent(totalValue)

    const { url: newUrl, from, to } = update({ from: '2019/5/15', to: '2019/7/8' })
    const newTotalValue = await getTotalValue(newUrl)

    await columnChart.instance.update({ from, to })

    expect(output).not.toHaveTextContent(totalValue)
    expect(output).toHaveTextContent(newTotalValue)

    columnChart.clear()
  })

  it('should have the value null when data is missing', async () => {
    const { columnChart, container } = setup({
      url: 'https://course-js.javascript.ru/api/empty_object'
    })

    await waitFor(() => expect(container).toHaveAttribute('aria-hidden', 'false'))

    const output = screen.getByRole('status')
    expect(output).toHaveTextContent(0)

    columnChart.clear()
  })

  it('should indicate loading while fetching data', async () => {
    const { columnChart, container } = setup({ from: '2020/4/10', to: '2020/5/10' })

    expect(container).toHaveAttribute('aria-hidden', 'true')

    await waitFor(() => expect(container).toHaveAttribute('aria-hidden', 'false'))

    columnChart.instance.update({ from: new Date(2019, 5, 15), to: new Date(2019, 7, 8) })

    expect(container).toHaveAttribute('aria-hidden', 'true')

    await waitFor(() => expect(container).toHaveAttribute('aria-hidden', 'false'))

    columnChart.clear()
  })
})
