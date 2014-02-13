/**
 * Module dependencies.
 */

var integration = require('integration');
var load = require('load-script');

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(SaaSquatch);
};


/**
 * Expose `SaaSquatch` integration.
 */

var SaaSquatch = exports.Integration = integration('SaaSquatch')
  .readyOnInitialize()
  .option('tenantAlias', '')
  .option('autofillSelector', '') // Make this an advanced option
  .global('_sqh');

/**
 * Initialize
 *
 * @param {Page} page
 */

SaaSquatch.prototype.initialize = function(page){};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

SaaSquatch.prototype.loaded = function(){
  return window._sqh && window._sqh.push != [].push;
};

/**
 * Load the SaaSquatch library.
 *
 * @param {Function} fn
 */

SaaSquatch.prototype.load = function(fn){
  load('//d2rcp9ak152ke1.cloudfront.net/assets/javascripts/squatch.min.js', fn);
};

/**
 * Identify.
 *
 * @param {Facade} identify
 */

SaaSquatch.prototype.identify = function(identify){
  var sqh = window._sqh = window._sqh || [];
  var id = identify.userId();
  var accountId = identify.accountId();
  var email = identify.email();

  if (this.called) return;
  if (!(id && email && accountId)){ 
    var opts = {
      tenant_alias: this.options.tenantAlias,
    }
  }else{
    var opts = {
      tenant_alias: this.options.tenantAlias,
      account_id: identify.accountId(),
      user_id: identify.userId(),
      email: identify.email(),
      first_name: identify.firstName(),
      last_name: identify.lastName()
    };
    
    if(identify.saasquatchChecksum()){
      opts.checksum = identify.saasquatchChecksum();
    }
    if(identify.fbShareImage()){
      opts.fb_share_image = identify.fbShareImage();
    }
    if(identify.avatar()){
      opts.user_image = identify.avatar();
    }
  };
  
  sqh.push(['init', opts]);

  if(this.options.autofillSelector){
    sqh.push(['autofill', this.options.autofillSelector);
  }

  this.called = true;
  this.load();
};
