module.exports = function(config) {
  config.set({
    basePath: '.',
    frameworks: ['mocha', 'chai', 'fixture'],
    files: [
      {
        pattern: 'test/fixtures/**/*',
      },
      'src/sanitizer.js',
      'src/lib/*.js',
      'test/**/*.test.js'
    ],
    preprocessors: {
      'test/**/*.html': ['html2js'],
      'test/**/*.json': ['json_fixtures'],
      'src/**/*.js': ['coverage']
    },
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      reporters: [
        // generates ./coverage/lcov.info
        { type:'lcovonly', subdir: '.' },
        // generates ./coverage/coverage-final.json
        { type:'json', subdir: '.' },
      ]
    },
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['Chrome', 'ChromeHeadless', 'MyHeadlessChrome'],
    customLaunchers: {
      MyHeadlessChrome: {
        base: 'ChromeHeadless',
        flags: ['--disable-translate', '--disable-extensions', '--remote-debugging-port=9223']
      }
    },
    jsonFixturesPreprocessor: {
      variableName: '__json__'
    },
    plugins: [
      'karma-chrome-launcher',
      'karma-mocha',
      'karma-chai',
      'karma-coverage',
      'karma-fixture',
      'karma-html2js-preprocessor',
      'karma-json-fixtures-preprocessor'
    ]
  })
}
