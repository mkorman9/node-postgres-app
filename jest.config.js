const config = {
  verbose: true,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  roots: [
    'src'
  ],
  globalSetup: './.jest/setup.js',
  globalTeardown: './.jest/teardown.js'
};

module.exports = config;
