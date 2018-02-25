module.exports = function(config) {
  config.set({
    basePath: '.',
    frameworks: ['mocha', 'chai', 'fixture'],
    files: [
      {
        pattern: 'spec/fixtures/**/*',
      },
      'src/lib/*.js',
      'spec/**/*.spec.js'
    ],
    preprocessors: {
      'spec/**/*.html': ['html2js'],
      'spec/**/*.json': ['json_fixtures']
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
