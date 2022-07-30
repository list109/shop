import { rest } from 'msw'

export const response = rest.get(/\/api\/response\/\d{3}/, (req, res, ctx) => {
  const code = req.url.pathname.split('/').slice(-1)[0]

  return res(ctx.status(code))
})
