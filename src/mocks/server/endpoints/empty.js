import { rest } from 'msw'

export const empty = [
  rest.get('*/api/empty_object', (req, res, ctx) => {
    return res(ctx.json({}))
  }),
  rest.get('*/api/empty_array', (req, res, ctx) => {
    return res(ctx.json([]))
  })
]
