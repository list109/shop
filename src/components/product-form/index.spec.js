import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { prepareForDom } from '../../utils/prepare-for-dom'
import { server } from '../../mocks/server/server.js'
import ProductForm from '../../components/product-form/index.js'

const getProductForm = prepareForDom(productId => new ProductForm(productId))

function getFormFields(form) {
  return ['title', 'description', 'quantity', 'subcategory', 'status', 'price', 'discount'].reduce(
    (obj, id) => ({
      ...obj,
      [id]: within(form).getByTestId(id)
    }),
    {}
  )
}

function getSubcategoriesData() {
  return this.categories.reduce((arr, { subcategories }) => arr.concat(subcategories), [])
}

async function setup(productId) {
  const productForm = getProductForm(productId)
  // a DOM element is created in the render method rather than constructor
  await productForm.instance.render()
  // put the DOM element itself into the Document
  productForm.render()

  const { instance } = productForm
  const user = userEvent.setup()
  const form = screen.queryByRole('form')

  return {
    productForm,
    user,
    form,
    instance,
    getSubcategoriesData: getSubcategoriesData.bind(instance)
  }
}

describe('ProductForm', () => {
  const env = process.env

  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...env, BACKEND_URL: HOST }
  })

  afterEach(() => {
    process.env.BACKEND_URL = env
  })

  afterEach(() => (document.body.innerHTML = ''))

  it('should be in the document', async () => {
    const { productForm } = await setup()

    expect(productForm.element).toBeInTheDocument()

    productForm.clear()
  })

  it('should have categories to choose', async () => {
    const { productForm, getSubcategoriesData, form } = await setup()

    const { subcategory: subcategoryField } = getFormFields(form)

    expect(subcategoryField.options).toHaveLength(getSubcategoriesData().length)

    productForm.clear()
  })

  it('should put loaded data in the fields', async () => {
    const response = {
      title: 'Super Product',
      description: 'Really good product',
      quantity: 5,
      subcategory: 'subcategory-2',
      status: 1,
      images: [
        {
          source: '3452.jpg',
          url: '"https://www.example.com/3452.jpg"'
        }
      ],
      price: 250,
      discount: 0
    }

    process.env.PRODUCT_BODY = [response]

    const { productForm, form } = await setup('product-id')

    const { title, description, quantity, subcategory, status, price, discount } =
      getFormFields(form)

    expect(title).toHaveValue('Super Product')
    expect(description).toHaveValue('Really good product')
    expect(quantity).toHaveValue(5)
    expect(subcategory).toHaveValue('subcategory-2')
    expect(status).toHaveValue('1')
    expect(price).toHaveValue(250)
    expect(discount).toHaveValue(0)

    const image = screen.queryByAltText(response.images[0].source)
    expect(image).toHaveAttribute('src', response.images[0].url)

    productForm.clear()
  })

  it('should render a message if the id is wrong', async () => {
    process.env.PRODUCT_BODY = []

    const { productForm, form } = await setup('wrong-product-id')

    expect(form).not.toBeInTheDocument()

    const message = screen.queryByText('Sorry, but it seems the given product does not exist')

    expect(message).toBeInTheDocument()

    productForm.clear()
  })

  it('should have specific the fields to be required', async () => {
    const { productForm, form } = await setup()

    const formFields = getFormFields(form)
    const fieldNames = Object.keys(formFields)

    fieldNames
      .filter(fieldName => fieldName.match(/subcategory|status/) === null)
      .forEach(fieldName => expect(formFields[fieldName]).toBeRequired())

    fieldNames
      .filter(fieldName => fieldName.match(/subcategory|status/))
      .forEach(fieldName => expect(formFields[fieldName]).not.toBeRequired())

    productForm.clear()
  })
})
