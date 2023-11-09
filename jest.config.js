/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  fakeTimers: {
    enableGlobally: true,
    now: new Date('2023-11-08T12:00:00').getTime()
  }
};
