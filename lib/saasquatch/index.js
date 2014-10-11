
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');

/**
 * Expose `SaaSquatch` integration.
 */

var SaaSquatch = module.exports = integration('SaaSquatch')
  .option('tenantAlias', '')
  .global('_sqh')
  .tag('<script src="//d2rcp9ak152ke1.cloudfront.net/assets/javascripts/squatch.min.js">');

/**
 * Initialize.
 *
 * @param {Page} page
 */

SaaSquatch.prototype.initialize = function(page){
  window._sqh = window._sqh || [];
  this.ready();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

SaaSquatch.prototype.loaded = function(){
  return window._sqh && window._sqh.push != [].push;
};

/**
 * Identify.
 *
 * @param {Facade} identify
 */

SaaSquatch.prototype.identify = function(identify){
  var sqh = window._sqh;
  var accountId = identify.proxy('traits.accountId');
  var image = identify.proxy('traits.referralImage');
  var opts = identify.options(this.name);
  var id = identify.userId();
  var email = identify.email();
  var self = this;

  if (!(id || email)) return;
  if (this.called) return;

  var init = {
    tenant_alias: this.options.tenantAlias,
    first_name: identify.firstName(),
    last_name: identify.lastName(),
    user_image: identify.avatar(),
    email: email,
    user_id: id,
  };

  if (accountId) init.account_id = accountId;
  if (opts.checksum) init.checksum = opts.checksum;
  if (image) init.fb_share_image = image;

  sqh.push(['init', init]);
  this.called = true;
  this.load(function(){
    self.emit('loaded');
  });
};
