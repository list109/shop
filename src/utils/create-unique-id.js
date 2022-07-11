const uniqueCache = new Set()

function getUniqueId({ prefix = '', middle = '', suffix = '' } = {}) {
  let id = [prefix, middle, suffix]
    .filter(text => Boolean(text.length))
    .reduce((accum, text) => `${accum}-${text}`, '')
    .replace(/^-/, '')

  while (id === '' || document.getElementById(id) || uniqueCache.has(id)) {
    id = id.length ? id + '-' : ''
    id += getRandomInteger()
  }
  uniqueCache.add(id)
  return id
}

function getRandomInteger(length = 5) {
  let integer

  do {
    integer = (10 ** length * Math.random()).toFixed()
  } while (integer.toString().length < length)

  return integer
}

export default getUniqueId
