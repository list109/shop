import { rest } from 'msw'

const generateResponse = length => {
  const res = []

  for (let i = 0; i < length; i++) {
    res.push({
      images: ['http://www.example.com'],
      title: `${i + 1} - Really Goog Thing`,
      status: 1,
      quantity: 187 + i,
      price: 220 + i
    })
  }

  return res
}

export const bestsellers = rest.get('*/api/dashboard/bestsellers', (req, res, ctx) => {
  const order = req.url.searchParams.get('_order')
  const start = req.url.searchParams.get('_start')
  const end = req.url.searchParams.get('_end')
  const body = generateResponse(end - start)

  return res(ctx.json(order === 'asc' ? body : body.reverse()))
})
