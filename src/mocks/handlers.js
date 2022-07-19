import { orders } from './endpoints/orders.js'
import { absence } from './endpoints/absence.js'
export const handlers = [].concat(orders, absence)
