import { rest } from 'msw'

const cache = {}

export const orders = rest.get(/\/api\/dashboard\/(orders|customers)/, (req, res, ctx) => {
  const from = new Date(req.url.searchParams.get('from'))
  const to = new Date(req.url.searchParams.get('to'))
  const data = {}

  let currentDate = new Date(from)

  if (cache[to - from]) {
    return res(ctx.json(cache[to - from]))
  }

  do {
    const prop = currentDate
      .toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' })
      .split(/[-./]/)
      .reverse()
      .join('-')
    data[prop] = Math.floor(Math.random() * 101)
    currentDate.setDate(currentDate.getDate() + 1)
  } while (currentDate <= to)

  cache[to - from] = data

  return res(ctx.json(data))
})
