import { orders } from './endpoints/orders.js'
import { empty } from './endpoints/empty.js'
import { bestsellers } from './endpoints/bestsellers.js'
import { response } from './endpoints/response.js'

export const handlers = [].concat(bestsellers, orders, empty, response)
