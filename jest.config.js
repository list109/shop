module.exports = {
  verbose: true,
  setupFilesAfterEnv: ['./jest-setup-files-after-env.js'],
  testEnvironment: 'jsdom',
  globals: {
    HOST: 'https://course-js.javascript.ru'
  }
}
