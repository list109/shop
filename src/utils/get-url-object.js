export const getUrlObject = (url, params = {}) => {
  const urlObj = new URL(url)

  Object.keys(params).forEach(param => {
    const value = params[param].toISOString ? params[param].toISOString() : params[param]

    return urlObj.searchParams.set(param, value)
  })

  return urlObj
}
