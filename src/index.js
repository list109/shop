import Router from './router/index.js'
import tooltip from './components/tooltip/index.js'

tooltip.initialize()

const router = Router.instance()

router
  .addRoute(/^$/, 'dashboard')
  .addRoute(/^products$/, 'products/list')
  .addRoute(/^products\/add$/, 'products/edit')
  .addRoute(/^products\/([\w()-]+)$/, 'products/edit')
  .addRoute(/^sales$/, 'sales')
  .addRoute(/^categories$/, 'categories')
  .addRoute(/^404\/?$/, 'error404')
  .setNotFoundPagePath('error404')
  .listen()

document.addEventListener('route', ({ detail }) => {
  const { pageLabel } = detail.page.element.dataset
  const activeLinks = document.querySelectorAll('.sidebar__nav .active')
  const linkToActive = document.querySelector(`.sidebar__nav [data-page=${pageLabel}]`)

  activeLinks.forEach(link => link.classList.remove('active'))
  linkToActive.parentElement.classList.add('active')
  return
})
