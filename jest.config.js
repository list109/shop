module.exports = {
  verbose: true,
  setupFilesAfterEnv: ['./src/mocks/jest-setup-files-after-env.js'],
  testEnvironment: 'jsdom',
  globals: {
    HOST: 'https://course-js.javascript.ru'
  }
}
