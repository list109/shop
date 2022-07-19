import { rest } from 'msw'

export const absence = rest.get('*/api/absence', (req, res, ctx) => res(ctx.json({})))
