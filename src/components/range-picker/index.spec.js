import RangePicker from './index.js'
import {
  getByRole,
  getByText,
  getByTestId,
  prettyDOM,
  screen,
  getAllByRole,
  logRoles
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const getDaysBetweenDates = (from, to) => {
  const millisecondsToDays = ms => ms / (24 * 60 * 60 * 1000)
  const milliseconds = Math.abs(new Date(to).setHours(24) - new Date(from))

  return millisecondsToDays(milliseconds)
}

function getRangePicker({ from, to } = {}) {
  from ??= new Date(2019, 9, 2)
  to ??= new Date(2019, 10, 5)
  let rangePicker = new RangePicker({ from, to })

  return {
    get element() {
      return rangePicker.element
    },
    render() {
      document.body.append(rangePicker.element)
    },
    clear() {
      rangePicker.destroy()
      rangePicker = null
    }
  }
}

function getRangeCells(from, to) {}

describe('RangePicker', () => {
  it('should initially show only input', () => {
    const rangePicker = getRangePicker()
    const input = getByRole(rangePicker.element, 'combobox', { expanded: false })
    const selector = getByRole(rangePicker.element, 'dialog')

    expect(input).toBeInstanceOf(HTMLElement)
    expect(selector).toBeEmptyDOMElement()
  })

  it('should be opened on click', async () => {
    const rangePicker = getRangePicker()
    rangePicker.render()
    const input = getByRole(rangePicker.element, 'combobox', { expanded: false })
    const selector = getByRole(rangePicker.element, 'dialog')
    const user = userEvent.setup()

    await user.click(input)

    expect(input).toHaveFocus()
    expect(input).toHaveAttribute('aria-expanded', expect.stringMatching('true'))
    expect(selector).not.toBeEmptyDOMElement()

    rangePicker.clear()
  })

  it('should be closed on second click', async () => {
    const rangePicker = getRangePicker()
    const input = getByRole(rangePicker.element, 'combobox', { expanded: false })
    const selector = getByRole(rangePicker.element, 'dialog')
    const user = userEvent.setup()

    await user.click(input)
    await user.click(input)

    expect(input).toHaveAttribute('aria-expanded', expect.stringMatching('false'))
  })

  it('should be closed wherever a date range is chosen', async () => {
    const rangePicker = getRangePicker()
    const input = getByRole(rangePicker.element, 'combobox')
    const selector = getByRole(rangePicker.element, 'dialog')
    const user = userEvent.setup()
    rangePicker.render()

    expect(input).toHaveAttribute('aria-expanded', 'false')

    await user.click(input)

    expect(input).toHaveAttribute('aria-expanded', 'true')

    const month1 = getByRole(selector, 'grid', { name: /^Октябрь$/i })
    const firstDate = getByRole(month1, 'gridcell', { name: '1' })
    const secondDate = getByRole(month1, 'gridcell', { name: '15' })

    await user.click(firstDate)
    await user.click(secondDate)

    expect(input).toHaveAttribute('aria-expanded', 'false')

    rangePicker.clear()
  })

  it("should show selected dates 'dateFrom-dateTo' in input", () => {
    const rangePicker = getRangePicker()
    rangePicker.render()
    const input = getByRole(rangePicker.element, 'combobox', { expanded: false })
    const dateFrom = getByText(input, '02.10.2019')
    const dateTo = getByText(input, '05.11.2019')

    expect(dateFrom).toBeInTheDocument()
    expect(dateTo).toBeInTheDocument()

    rangePicker.clear()
  })

  it("should highlight selected 'from' and 'to' dates in calendar", async () => {
    const rangePicker = getRangePicker({
      from: new Date(2019, 9, 12),
      to: new Date(2019, 10, 25)
    })
    const input = getByRole(rangePicker.element, 'combobox', { expanded: false })
    const selector = getByRole(rangePicker.element, 'dialog')
    const user = userEvent.setup()

    await user.click(input)

    const from = getByTestId(selector, /from selected/i)
    const to = getByTestId(selector, 'to selected')

    expect(from).toHaveTextContent('12')
    expect(to).toHaveTextContent('25')
  })

  it('should highlight selected dates range in calendar', async () => {
    const from = new Date(2020, 5, 8)
    const to = new Date(2020, 6, 13)
    const totalDays = getDaysBetweenDates(from, to)
    const RANGE_BORDERS_COUNT = 2
    const rangePicker = getRangePicker({ from, to })
    const input = getByRole(rangePicker.element, 'combobox', { expanded: false })
    const selector = getByRole(rangePicker.element, 'dialog')
    const user = userEvent.setup()

    await user.click(input)

    const selectedBetween = getAllByRole(selector, 'strong').slice(1, -1)

    expect(selectedBetween).toHaveLength(totalDays - RANGE_BORDERS_COUNT)
  })

  it('should clear highlighting of previous selection', async () => {
    const rangePicker = getRangePicker()
    const input = getByRole(rangePicker.element, 'combobox', { expanded: false })
    const selector = getByRole(rangePicker.element, 'dialog')
    const user = userEvent.setup()

    await user.click(input)

    const from = getByTestId(selector, /from selected/i)
    const prevDate = from.previousElementSibling

    await user.click(prevDate)

    const selectedBetween = getAllByRole(selector, 'strong').slice(1, -1)

    expect(selectedBetween).toHaveLength(0)
  })

  it('should keep selected dates range after reopening', async () => {
    const rangePicker = getRangePicker()
    const input = getByRole(rangePicker.element, 'combobox', { expanded: false })
    const selector = getByRole(rangePicker.element, 'dialog')
    const user = userEvent.setup()

    // open date picker
    await user.click(input)

    const from = getByTestId(selector, /from selected/i)
    const prevDate = from.previousElementSibling
    const nextDate = from.nextElementSibling

    await user.click(prevDate)
    await user.click(nextDate)

    expect(getByTestId(selector, /from selected/i)).toHaveTextContent('1')
    expect(getByTestId(selector, 'to selected')).toHaveTextContent('3')
  })

  it('should show correct initial months in calendar', async () => {
    const rangePicker = getRangePicker()
    const input = getByRole(rangePicker.element, 'combobox', { expanded: false })
    const selector = getByRole(rangePicker.element, 'dialog')
    const user = userEvent.setup()

    rangePicker.render()
    // open date picker
    await user.click(input)

    const months = getAllByRole(selector, 'grid')
    const month1 = getByRole(selector, 'grid', { name: /^Октябрь$/i })
    const month2 = getByRole(selector, 'grid', { name: /^Ноябрь$/i })

    expect(months).toHaveLength(2)
    expect(month1).toBeInTheDocument()
    expect(month2).toBeInTheDocument()

    rangePicker.clear()
  })

  it('should have ability to switch to the next couple of months', async () => {
    const rangePicker = getRangePicker()
    const input = getByRole(rangePicker.element, 'combobox', { expanded: false })
    const selector = getByRole(rangePicker.element, 'dialog')
    const user = userEvent.setup()
    rangePicker.render()
    // open date picker
    await user.click(input)

    const prevMonthButton = getByRole(selector, 'button', { name: /next month/i })

    await user.click(prevMonthButton)

    const months = getAllByRole(selector, 'grid')
    const month2 = getByRole(selector, 'grid', { name: /^Ноябрь$/i })
    const month1 = getByRole(selector, 'grid', { name: /^Декабрь$/i })

    expect(months).toHaveLength(2)
    expect(month1).toBeInTheDocument()
    expect(month2).toBeInTheDocument()

    rangePicker.clear()
  })

  it('should have ability to switch to the previous couple of months', async () => {
    const rangePicker = getRangePicker()
    const input = getByRole(rangePicker.element, 'combobox', { expanded: false })
    const selector = getByRole(rangePicker.element, 'dialog')
    const user = userEvent.setup()
    rangePicker.render()
    // open date picker
    await user.click(input)

    const prevMonthButton = getByRole(selector, 'button', { name: 'previous month' })

    await user.click(prevMonthButton)

    const months = getAllByRole(selector, 'grid')
    const month1 = getByRole(selector, 'grid', { name: /^Сентябрь$/i })
    const month2 = getByRole(selector, 'grid', { name: /^Октябрь$/i })

    expect(months).toHaveLength(2)
    expect(month1).toBeInTheDocument()
    expect(month2).toBeInTheDocument()

    rangePicker.clear()
  })

  it('should have ability to select all dates in two visible months', async () => {
    const rangePicker = getRangePicker()
    const input = getByRole(rangePicker.element, 'combobox', { expanded: false })
    const selector = getByRole(rangePicker.element, 'dialog')
    const user = userEvent.setup()
    rangePicker.render()
    // open date picker
    await user.click(input)
    getByRole(rangePicker.element, 'combobox', { expanded: true })

    const month1 = getByRole(selector, 'grid', { name: /^Октябрь$/i })
    const month2 = getByRole(selector, 'grid', { name: /^Ноябрь$/i })
    const firstDate = getByRole(month1, 'gridcell', { name: '1' })
    const secondDate = getByRole(month2, 'gridcell', { name: '30' })

    // choose border dates
    await user.click(firstDate)
    await user.click(secondDate)

    expect(input).toHaveAttribute('aria-expanded', 'false')

    let highlighted = getAllByRole(selector, 'strong')
    // change "from" and "to" dates
    let from = getByTestId(selector, /from selected/i)
    let to = getByTestId(selector, 'to selected')

    expect(from).toHaveTextContent('1')
    expect(to).toHaveTextContent('30')
    expect(highlighted).toHaveLength(61)

    // open date picker
    await user.click(input)
    expect(input).toHaveAttribute('aria-expanded', 'true')

    from = getByTestId(selector, /from selected/i)
    to = getByTestId(selector, 'to selected')

    // check selection after second opening
    expect(highlighted).toHaveLength(61)
    expect(from).toHaveTextContent('1')
    expect(to).toHaveTextContent('30')

    rangePicker.clear()
  })

  it('should have ability to select dates range bigger than two months', async () => {
    const rangePicker = getRangePicker()
    const input = getByRole(rangePicker.element, 'combobox', { expanded: false })
    const selector = getByRole(rangePicker.element, 'dialog')
    const user = userEvent.setup()
    rangePicker.render()

    // open date picker
    await user.click(input)

    const month1 = getByRole(selector, 'grid', { name: /^Октябрь$/i })
    const firstDate = getByRole(month1, 'gridcell', { name: '1' })

    // change "from" date
    await user.click(firstDate)

    // got to the next couple of months
    const nextMonthButton = getByRole(selector, 'button', { name: 'next month' })
    await user.click(nextMonthButton)

    const month2 = getByRole(selector, 'grid', { name: /^Декабрь$/i })
    const secondDate = getByRole(month2, 'gridcell', { name: '31' })
    // change "to" date
    await user.click(secondDate)

    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveTextContent(/01.{1}10.{1}2019.+31.{1}12.{1}2019/)

    rangePicker.clear()
  })

  it("should not change dates 'from' and 'to' inside input element if selected only one date", async () => {
    const rangePicker = getRangePicker()
    const input = getByRole(rangePicker.element, 'combobox', { expanded: false })
    const selector = getByRole(rangePicker.element, 'dialog')
    const user = userEvent.setup()
    rangePicker.render()

    // open date picker
    await user.click(input)

    const month1 = getByRole(selector, 'grid', { name: /^Октябрь$/i })
    const firstDate = getByRole(month1, 'gridcell', { name: '1' })

    // change "from" date
    await user.click(firstDate)
    // close date picker
    await user.click(input)

    expect(input).toHaveTextContent(/02.{1}10.{1}2019.+05.{1}11.{1}2019/)

    rangePicker.clear()
  })

  it('should have ability to select minimal dates range equal two days', async () => {
    const rangePicker = getRangePicker()
    const input = getByRole(rangePicker.element, 'combobox', { expanded: false })
    const selector = getByRole(rangePicker.element, 'dialog')
    const user = userEvent.setup()
    rangePicker.render()

    // open date picker
    await user.click(input)

    const month1 = getByRole(selector, 'grid', { name: /^Октябрь$/i })
    const firstDate = getByRole(month1, 'gridcell', { name: '1' })
    const secondDate = getByRole(month1, 'gridcell', { name: '2' })

    await user.click(firstDate)
    await user.click(secondDate)

    const highlighted = getAllByRole(month1, 'strong')

    expect(highlighted).toHaveLength(2)

    // close date picker
    await user.click(input)

    expect(input).toHaveTextContent(/01.{1}10.{1}2019.+02.{1}10.{1}2019/)

    rangePicker.clear()
  })

  // TODO: maybe we need fix this behaviour in DateRange component?
  it('should have ability to select minimal dates range equal one day', async () => {
    const rangePicker = getRangePicker()
    const input = getByRole(rangePicker.element, 'combobox', { expanded: false })
    const selector = getByRole(rangePicker.element, 'dialog')
    const user = userEvent.setup()
    rangePicker.render()

    // open date picker
    await user.click(input)

    const month1 = getByRole(selector, 'grid', { name: /^Октябрь$/i })
    const firstDate = getByRole(month1, 'gridcell', { name: '1' })
    const secondDate = getByRole(month1, 'gridcell', { name: '1' })

    // change "from" date to "01.10.2019"
    await user.click(firstDate)
    // change "to" date to "01.10.2019"
    await user.click(secondDate)

    const from = getByTestId(selector, /from selected/i)
    const to = getByTestId(selector, /to selected/i)

    expect(from).toBe(to)

    // close date picker
    await user.click(input)
    expect(input).toHaveTextContent(/01.{1}10.{1}2019.+01.{1}10.{1}2019/)

    rangePicker.clear()
  })

  it('should have ability select more than 1 year dates range', async () => {
    const MONTHS_COUNT = 12
    const rangePicker = getRangePicker()
    const input = getByRole(rangePicker.element, 'combobox', { expanded: false })
    const selector = getByRole(rangePicker.element, 'dialog')
    const user = userEvent.setup()
    rangePicker.render()

    // open date picker
    await user.click(input)

    const month1 = getByRole(selector, 'grid', { name: /^Октябрь$/i })
    const firstDate = getByRole(month1, 'gridcell', { name: '1' })

    // change "from" date to "01.10.2019"
    await user.click(firstDate)

    const nextMonthButton = getByRole(selector, 'button', { name: 'next month' })

    for (let i = 0; i < MONTHS_COUNT; i++) {
      await user.click(nextMonthButton)
    }

    const month2 = getByRole(selector, 'grid', { name: /^Ноябрь$/i })
    const secondDate = getByRole(month2, 'gridcell', { name: '1' })
    // change "to" date "01.11.2020"
    await user.click(secondDate)

    // close date picker
    await user.click(input)

    expect(input).toHaveTextContent(/01.{1}10.{1}2019.+01.{1}11.{1}2020/)

    rangePicker.clear()
  })
})
