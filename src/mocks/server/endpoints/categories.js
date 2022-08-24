import { rest } from 'msw'

const getRandomInteger = range => Math.round(Math.random() * range)

const getCategory = ({ name, value, ...rest }) => ({
  id: `${name}-${value}`,
  title: `${name}-${value}`,
  weight: value,
  ...rest
})

const generateResponse = length => {
  const res = []
  let subcatCounter = 1
  const subcatQuantity = 3

  for (let i = 0; i < length; i++) {
    const randomInt = getRandomInteger(100)
    const count = randomInt - (randomInt % subcatQuantity)

    const subcategories = [subcatCounter++, subcatCounter++, subcatCounter++].map(value =>
      getCategory({
        name: 'subcategory',
        value,
        category: `category-${i}`,
        count: count / 3
      })
    )

    const category = getCategory({
      name: 'category',
      value: i,
      count,
      subcategories
    })

    res.push(category)
  }

  return res
}

export const categories = rest.get('*/api/rest/categories', (req, res, ctx) => {
  const body = generateResponse(10)

  return res(ctx.json(body))
})
