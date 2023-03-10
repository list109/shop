import RangePicker from './index.js'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { prepareForDom } from '../../utils/prepare-for-dom.js'
import { getDaysBetweenDates } from '../../utils/get-days-between-dates.js'
import { stringToDate } from '../../utils/string-to-date.js'

const getRangePicker = prepareForDom(
  obj =>
    new RangePicker({
      from: new Date(2019, 9, 2),
      to: new Date(2019, 10, 5),
      ...obj
    })
)

function setup({ from, to, ...rest } = {}) {
  const args = { ...rest }
  let fromDate
  let toDate

  if (from) {
    fromDate = stringToDate(from)
    args.from = fromDate
  }

  if (to) {
    toDate = stringToDate(to)
    args.to = toDate
  }

  const rangePicker = getRangePicker(args)
  rangePicker.render()

  const totalDays = getDaysBetweenDates(fromDate, toDate)
  const input = screen.getByRole('combobox', { expanded: false })
  const selector = screen.getByRole('dialog')
  const user = userEvent.setup()

  return { rangePicker, input, selector, user, totalDays }
}

describe('RangePicker', () => {
  afterEach(() => (document.body.innerHTML = ''))

  it('should initially show only input', () => {
    const { rangePicker, input, selector } = setup()

    expect(input).toBeInstanceOf(HTMLElement)
    expect(selector).toBeEmptyDOMElement()

    rangePicker.clear()
  })

  it('should be opened on click', async () => {
    const { rangePicker, input, selector, user } = setup()

    await user.click(input)

    expect(input).toHaveFocus()
    expect(input).toHaveAttribute('aria-expanded', expect.stringMatching('true'))
    expect(selector).not.toBeEmptyDOMElement()

    rangePicker.clear()
  })

  it('should be closed on second click', async () => {
    const { rangePicker, input, user } = setup()

    await user.click(input)
    await user.click(input)

    expect(input).toHaveAttribute('aria-expanded', expect.stringMatching('false'))

    rangePicker.clear()
  })

  it('should be closed wherever a date range is chosen', async () => {
    const { rangePicker, input, user } = setup()

    expect(input).toHaveAttribute('aria-expanded', 'false')

    await user.click(input)

    expect(input).toHaveAttribute('aria-expanded', 'true')

    const month1 = screen.getByRole('grid', { name: /^October$/i })
    const firstDate = within(month1).getByRole('gridcell', { name: '1' })
    const secondDate = within(month1).getByRole('gridcell', { name: '15' })

    await user.click(firstDate)
    await user.click(secondDate)

    expect(input).toHaveAttribute('aria-expanded', 'false')

    rangePicker.clear()
  })

  it("should show selected dates 'dateFrom-dateTo' in input", () => {
    const { rangePicker } = setup()

    const dateFrom = screen.queryByText('02/10/2019')
    const dateTo = screen.queryByText('05/11/2019')

    expect(dateFrom).toBeInTheDocument()
    expect(dateTo).toBeInTheDocument()

    rangePicker.clear()
  })

  it("should highlight selected 'from' and 'to' dates in calendar", async () => {
    const { rangePicker, input, user } = setup({ from: '2019/9/12', to: '2019/10/25' })

    await user.click(input)

    const from = screen.getByTestId(/from selected/i)
    const to = screen.getByTestId(/to selected/i)

    expect(from).toHaveTextContent('12')
    expect(to).toHaveTextContent('25')

    rangePicker.clear()
  })

  it('should highlight selected dates range in calendar', async () => {
    const RANGE_BORDERS_COUNT = 2
    const { rangePicker, input, user, totalDays } = setup({ from: '2020/5/8', to: '2020/6/13' })

    await user.click(input)

    const selectedBetween = screen.getAllByRole('strong').slice(1, -1)

    expect(selectedBetween).toHaveLength(totalDays - RANGE_BORDERS_COUNT)

    rangePicker.clear()
  })

  it('should clear highlighting of previous selection', async () => {
    const { rangePicker, input, user } = setup()

    await user.click(input)

    const month1 = screen.getByRole('grid', { name: /^October$/i })
    const someDate = within(month1).getByRole('gridcell', { name: '1' })

    await user.click(someDate)

    const selectedBetween = screen.getAllByRole('strong').slice(1, -1)

    expect(selectedBetween).toHaveLength(0)

    rangePicker.clear()
  })

  it('should keep selected dates range after reopening', async () => {
    const { rangePicker, input, user } = setup()

    // open date picker
    await user.click(input)

    const month1 = screen.getByRole('grid', { name: /^October$/i })
    const prevDate = within(month1).getByRole('gridcell', { name: '1' })
    const nextDate = within(month1).getByRole('gridcell', { name: '3' })

    await user.click(prevDate)
    await user.click(nextDate)

    expect(screen.getByTestId(/from selected/i)).toHaveTextContent('1')
    expect(screen.getByTestId(/to selected/i)).toHaveTextContent('3')

    rangePicker.clear()
  })

  it('should show correct initial months in calendar', async () => {
    const { rangePicker, input, user } = setup()

    // open date picker
    await user.click(input)

    const months = screen.getAllByRole('grid')
    const month1 = screen.getByRole('grid', { name: /^October$/i })
    const month2 = screen.getByRole('grid', { name: /^November$/i })

    expect(months).toHaveLength(2)
    expect(month1).toBeInTheDocument()
    expect(month2).toBeInTheDocument()

    rangePicker.clear()
  })

  it('should have ability to switch to the next couple of months', async () => {
    const { rangePicker, input, user } = setup()

    // open date picker
    await user.click(input)

    const prevMonthButton = screen.getByRole('button', { name: /next month/i })

    await user.click(prevMonthButton)

    const months = screen.getAllByRole('grid')
    const month2 = screen.getByRole('grid', { name: /^November$/i })
    const month1 = screen.getByRole('grid', { name: /^December$/i })

    expect(months).toHaveLength(2)
    expect(month1).toBeInTheDocument()
    expect(month2).toBeInTheDocument()

    rangePicker.clear()
  })

  it('should have ability to switch to the previous couple of months', async () => {
    const { rangePicker, input, user } = setup()

    // open date picker
    await user.click(input)

    const prevMonthButton = screen.getByRole('button', { name: 'previous month' })

    await user.click(prevMonthButton)

    const months = screen.getAllByRole('grid')
    const month1 = screen.getByRole('grid', { name: /^September$/i })
    const month2 = screen.getByRole('grid', { name: /^October$/i })

    expect(months).toHaveLength(2)
    expect(month1).toBeInTheDocument()
    expect(month2).toBeInTheDocument()

    rangePicker.clear()
  })

  it('should have ability to select all dates in two visible months', async () => {
    const { rangePicker, input, user } = setup()

    // open date picker
    await user.click(input)
    expect(input).toHaveAttribute('aria-expanded', 'true')

    const month1 = screen.getByRole('grid', { name: /^October$/i })
    const month2 = screen.getByRole('grid', { name: /^November$/i })
    const firstDate = within(month1).getByRole('gridcell', { name: '1' })
    const secondDate = within(month2).getByRole('gridcell', { name: '30' })

    // choose border dates
    await user.click(firstDate)
    await user.click(secondDate)

    expect(input).toHaveAttribute('aria-expanded', 'false')

    let highlighted = screen.getAllByRole('strong')
    // change "from" and "to" dates
    let from = screen.getByTestId(/from selected/i)
    let to = screen.getByTestId(/to selected/i)

    expect(from).toHaveTextContent('1')
    expect(to).toHaveTextContent('30')
    expect(highlighted).toHaveLength(61)

    // open date picker
    await user.click(input)
    expect(input).toHaveAttribute('aria-expanded', 'true')

    from = screen.getByTestId(/from selected/i)
    to = screen.getByTestId(/to selected/i)

    // check selection after second opening
    expect(highlighted).toHaveLength(61)
    expect(from).toHaveTextContent('1')
    expect(to).toHaveTextContent('30')

    rangePicker.clear()
  })

  it('should have ability to select dates range bigger than two months', async () => {
    const { rangePicker, input, user } = setup()

    // open date picker
    await user.click(input)

    const month1 = screen.getByRole('grid', { name: /^October$/i })
    const firstDate = within(month1).getByRole('gridcell', { name: '1' })

    // change "from" date
    await user.click(firstDate)

    // got to the next couple of months
    const nextMonthButton = screen.getByRole('button', { name: 'next month' })
    await user.click(nextMonthButton)

    const month2 = screen.getByRole('grid', { name: /^December$/i })
    const secondDate = within(month2).getByRole('gridcell', { name: '31' })
    // change "to" date
    await user.click(secondDate)

    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveTextContent(/01.{1}10.{1}2019.+31.{1}12.{1}2019/)

    rangePicker.clear()
  })

  it("should not change dates 'from' and 'to' inside input element if selected only one date", async () => {
    const { rangePicker, input, user } = setup()

    // open date picker
    await user.click(input)

    const month1 = screen.getByRole('grid', { name: /^October$/i })
    const firstDate = within(month1).getByRole('gridcell', { name: '1' })

    // change "from" date
    await user.click(firstDate)
    // close date picker
    await user.click(input)

    expect(input).toHaveTextContent(/02.{1}10.{1}2019.+05.{1}11.{1}2019/)

    rangePicker.clear()
  })

  it('should have ability to select minimal dates range equal two days', async () => {
    const { rangePicker, input, user } = setup()

    // open date picker
    await user.click(input)

    const month1 = screen.getByRole('grid', { name: /^October$/i })
    const firstDate = within(month1).getByRole('gridcell', { name: '1' })
    const secondDate = within(month1).getByRole('gridcell', { name: '2' })

    await user.click(firstDate)
    await user.click(secondDate)

    const highlighted = within(month1).getAllByRole('strong')

    expect(highlighted).toHaveLength(2)

    // close date picker
    await user.click(input)

    expect(input).toHaveTextContent(/01.{1}10.{1}2019.+02.{1}10.{1}2019/)

    rangePicker.clear()
  })

  // TODO: maybe we need fix this behaviour in DateRange component?
  it('should have ability to select minimal dates range equal one day', async () => {
    const { rangePicker, input, user } = setup()

    // open date picker
    await user.click(input)

    const month1 = screen.getByRole('grid', { name: /^October$/i })
    const firstDate = within(month1).getByRole('gridcell', { name: '1' })
    const secondDate = within(month1).getByRole('gridcell', { name: '1' })

    // change "from" date to "01.10.2019"
    await user.click(firstDate)
    // change "to" date to "01.10.2019"
    await user.click(secondDate)

    const from = screen.getByTestId(/from selected/i)
    const to = screen.getByTestId(/to selected/i)

    expect(from).toBe(to)

    // close date picker
    await user.click(input)
    expect(input).toHaveTextContent(/01.{1}10.{1}2019.+01.{1}10.{1}2019/)

    rangePicker.clear()
  })

  it('should have ability select more than 1 year dates range', async () => {
    const MONTHS_COUNT = 12
    const { rangePicker, input, user } = setup()

    // open date picker
    await user.click(input)

    const month1 = screen.getByRole('grid', { name: /^October$/i })
    const firstDate = within(month1).getByRole('gridcell', { name: '1' })

    // change "from" date to "01.10.2019"
    await user.click(firstDate)

    const nextMonthButton = screen.getByRole('button', { name: 'next month' })

    for (let i = 0; i < MONTHS_COUNT; i++) {
      await user.click(nextMonthButton)
    }

    const month2 = screen.getByRole('grid', { name: /^November$/i })
    const secondDate = within(month2).getByRole('gridcell', { name: '1' })
    // change "to" date "01.11.2020"
    await user.click(secondDate)

    // close date picker
    await user.click(input)

    expect(input).toHaveTextContent(/01.{1}10.{1}2019.+01.{1}11.{1}2020/)

    rangePicker.clear()
  })
})
