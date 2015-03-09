
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');

/**
 * Expose Alexa integration.
 */

var Alexa = module.exports = integration('Alexa')
  .assumesPageview()
  .global('_atrk_opts')
  .option('account', null)
  .option('domain', '')
  .option('dynamic', true)
  .tag('<script src="//d31qbv1cthcecs.cloudfront.net/atrk.js">');

/**
 * Initialize.
 *
 * @param {Object} page
 */

Alexa.prototype.initialize = function(page){
  var self = this;
  window._atrk_opts = {
    atrk_acct: this.options.account,
    domain: this.options.domain,
    dynamic: this.options.dynamic
  };
  this.load(function(){
    window.atrk();
    self.ready();
  });
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Alexa.prototype.loaded = function(){
  return !! window.atrk;
};
