
var assert = require('assert');
var Integrations = require('../index.js');
var sandbox = require('clear-env');
var object = require('object');

/**
 * Initialize mocha.
 */

mocha.setup({
  ui: 'bdd',
  ignoreLeaks: true,
  slow: 300,
  timeout: 10000
});

/**
 * Assert we have the right number of integrations.
 */

describe('integrations', function(){
  it('should export our integrations', function(){
    assert.equal(84, object.length(Integrations));
  });
});

/**
 * Load integration tests.
 */

require('./tests');

/**
 * Run tests.
 */

if (window.mochaPhantomJS) {
  mochaPhantomJS.run();
} else {
  if (window.saucelabs) {
    saucelabs(mocha.run());
  } else {
    mocha.run();
  }
}
