import createUniqueId from './create-unique-id.js'

describe('createUniqueId', () => {
  it('should return an id if only prefix is present', () => {
    const id = createUniqueId({ prefix: 'prefix' })
    expect(id).toMatch(/^prefix$/)
  })

  it('should return a different id if it is not unique and only prefix is present', () => {
    document.body.innerHTML = '<div id="prefix"></div>'
    const id = createUniqueId({ prefix: 'prefix' })
    expect(id).toMatch(/^prefix-\d{5}$/)
    document.body.innerHTML = ''
  })

  it('should return an id if only middle is present', () => {
    const id = createUniqueId({ middle: 'middle' })
    expect(id).toMatch(/^middle$/)
  })

  it('should return a different id if it is not unique and only middle is present', () => {
    document.body.innerHTML = '<div id="middle"></div>'
    const id = createUniqueId({ middle: 'middle' })
    expect(id).toMatch(/^middle-\d{5}$/)
    document.body.innerHTML = ''
  })

  it('should return an id if only suffix is present', () => {
    const id = createUniqueId({ suffix: 'suffix' })
    expect(id).toMatch(/^suffix$/)
  })

  it('should return a different id if it is not unique and only suffix is present', () => {
    document.body.innerHTML = '<div id="suffix"></div>'
    const id = createUniqueId({ suffix: 'suffix' })
    expect(id).toMatch(/^suffix-\d{5}$/)
    document.body.innerHTML = ''
  })

  it('should return an id if all argument are present', () => {
    const id = createUniqueId({
      prefix: 'prefix',
      middle: 'middle',
      suffix: 'suffix'
    })
    expect(id).toMatch(/^prefix-middle-suffix$/)
  })

  it('should return a different id if it is not unique and all arguments are present', () => {
    document.body.innerHTML = '<div id="prefix-middle-suffix"></div>'
    const id = createUniqueId({
      prefix: 'prefix',
      middle: 'middle',
      suffix: 'suffix'
    })
    expect(id).toMatch(/^prefix-middle-suffix-\d{5}$/)
    document.body.innerHTML = ''
  })

  it('should return an id if both prefix and suffix are present', () => {
    const id = createUniqueId({ prefix: 'prefix', suffix: 'suffix' })
    expect(id).toMatch(/^prefix-suffix$/)
  })

  it('should return a different id if it is not unique and both prefix and suffix are present', () => {
    document.body.innerHTML = '<div id="prefix-suffix"></div>'
    const id = createUniqueId({ prefix: 'prefix', suffix: 'suffix' })
    expect(id).toMatch(/^prefix-suffix-\d{5}$/)
    document.body.innerHTML = ''
  })

  it('should return a different id if it has already returned the one with the same value', () => {
    expect(createUniqueId({ middle: 'id-12' })).toMatch(/^id-12$/)
    expect(createUniqueId({ middle: 'id-12' })).not.toMatch(/^id-12$/)
    expect(createUniqueId({ middle: 'id-12' })).toMatch(/^id-12-\d{5}$/)
  })
})
