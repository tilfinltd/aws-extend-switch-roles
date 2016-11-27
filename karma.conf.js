module.exports = function(config) {
  config.set({
    basePath: '.',
    frameworks: ['jasmine', 'fixture'],
    files: [
      {
        pattern: 'spec/fixtures/**/*',
      },
      'js/**/*.js',
      'spec/**/*.spec.js'
    ],
    preprocessors: {
      'spec/**/*.html': ['html2js'],
      'spec/**/*.json': ['json_fixtures']
    },
    reporters: ['progress'],
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['PhantomJS'],
    jsonFixturesPreprocessor: {
      variableName: '__json__'
    },
    plugins: [
      'karma-jasmine',
      'karma-fixture',
      'karma-html2js-preprocessor',
      'karma-json-fixtures-preprocessor',
      'karma-phantomjs-launcher'
    ]
  })
}
