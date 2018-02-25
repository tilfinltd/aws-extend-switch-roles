module.exports = function(config) {
  config.set({
    basePath: '.',
    frameworks: ['mocha', 'chai', 'fixture'],
    files: [
      {
        pattern: 'test/fixtures/**/*',
      },
      'src/lib/*.js',
      'test/**/*.test.js'
    ],
    preprocessors: {
      'test/**/*.html': ['html2js'],
      'test/**/*.json': ['json_fixtures']
    },
    reporters: ['progress'],
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
      'karma-fixture',
      'karma-html2js-preprocessor',
      'karma-json-fixtures-preprocessor'
    ]
  })
}
