
var integration = require('integration');
var load = require('load-script');

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(Alexa);
};

/**
 * Expose Alexa integration.
 */

var Alexa = exports.Integration = integration('Alexa')
  .assumesPageview()
  .readyOnLoad()
  .global('_atrk_opts')
  .option('account', null)
  .option('domain', '')
  .option('dynamic', true);

/**
 * Initialize.
 *
 * @param {Object} page
 */

Alexa.prototype.initialize = function(page){
  window._atrk_opts = {
    atrk_acct: this.options.account,
    domain: this.options.domain,
    dynamic: this.options.dynamic
  };
  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Alexa.prototype.loaded = function(){
  return !! window.atrk;
};

/**
 * Load the Alexa library.
 *
 * @param {Function} callback
 */

Alexa.prototype.load = function(callback){
  load('//d31qbv1cthcecs.cloudfront.net/atrk.js', function(err){
    if (err) return callback(err);
    window.atrk();
    callback();
  });
};
