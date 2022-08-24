import { rest } from 'msw'

export const products = [
  rest.get(/\/api\/rest\/products/, (req, res, ctx) => {
    const body = process.env.PRODUCT_BODY || []

    return res(ctx.json(body))
  })
]
