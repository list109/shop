import { orders } from './endpoints/orders.js'
import { empty } from './endpoints/empty.js'
import { bestsellers } from './endpoints/bestsellers.js'
import { response } from './endpoints/response.js'
import { categories } from './endpoints/categories.js'
import { products } from './endpoints/products.js'

export const handlers = [].concat(bestsellers, orders, empty, response, categories, products)
