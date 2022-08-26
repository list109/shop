const svgToMiniDataURI = require('mini-svg-data-uri')

module.exports = [
  {
    loader: 'url-loader',
    options: {
      generator: content => svgToMiniDataURI(content.toString())
    }
  }
]
