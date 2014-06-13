
/**
 * Module dependencies.
 */

var assert = require('assert');
var Cloud = require('mocha-cloud');

/**
 * Saucelabs credentials.
 */

var user = process.env.SAUCE_USERNAME;
var key = process.env.SAUCE_ACCESS_KEY;

/**
 * Initialize a new `Cloud`.
 */

var cloud = new Cloud('integrations', user, key);
cloud.browser('iphone', '5.0', 'Mac 10.6');
cloud.browser('ipad', '6', 'Mac 10.8');
cloud.url('http://localhost:4202/?cloud=true');

cloud.on('init', function(browser){
  console.log('  init : %s %s', browser.browserName, browser.version);
});

cloud.on('start', function(browser){
  console.log('  start : %s %s', browser.browserName, browser.version);
});

cloud.on('end', function(browser, res){
  console.log('  end : %s %s : %d failures', browser.browserName, browser.version, res.failures);
});

cloud.start();