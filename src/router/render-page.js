import errorLoadingPage from '../pages/errorLoading/index.js'
import * as notifications from '../components/notification/index.js'

export default async function (path) {
  const main = document.querySelector('main')

  main.classList.add('is-loading')

  let Page

  try {
    const { default: page } = await import(
      /* webpackChunkName: "[request]" */ `../pages/${path}/index.js`
    )
    Page = page
  } catch (err) {
    Page = errorLoadingPage
    new notifications.OnError(`Could not load the page (${err.message})`)
  }

  const page = new Page()
  const element = await page.render()

  main.classList.remove('is-loading')

  const contentNode = document.querySelector('#content')

  contentNode.innerHTML = ''
  contentNode.append(element)

  return page
}
