
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');

/**
 * Expose `SaaSquatch` integration.
 */

var SaaSquatch = module.exports = integration('SaaSquatch')
  .option('tenantAlias', '')
  .option('referralImage', '')
  .global('_sqh')
  .tag('<script src="//d2rcp9ak152ke1.cloudfront.net/assets/javascripts/squatch.min.js">');

/**
 * Initialize.
 *
 * @api public
 */

SaaSquatch.prototype.initialize = function(){
  window._sqh = window._sqh || [];
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

SaaSquatch.prototype.loaded = function(){
  return window._sqh && window._sqh.push !== Array.prototype.push;
};

/**
 * Identify.
 *
 * @api public
 * @param {Facade} identify
 */

SaaSquatch.prototype.identify = function(identify){
  var sqh = window._sqh;
  var accountId = identify.proxy('traits.accountId');
  var paymentProviderId = identify.proxy('traits.paymentProviderId');
  var accountStatus = identify.proxy('traits.accountStatus');
  var referralCode = identify.proxy('traits.referralCode');
  var image = identify.proxy('traits.referralImage') || this.options.referralImage;
  var opts = identify.options(this.name);
  var id = identify.userId();
  var email = identify.email();

  if (!(id || email)) return;
  if (this.called) return;

  var init = {
    tenant_alias: this.options.tenantAlias,
    first_name: identify.firstName(),
    last_name: identify.lastName(),
    user_image: identify.avatar(),
    email: email,
    user_id: id
  };

  if (accountId) init.account_id = accountId;
  if (paymentProviderId) init.payment_provider_id = paymentProviderId;
  if (init.payment_provider_id === 'null') init.payment_provider_id = null;
  if (accountStatus) init.account_status = accountStatus;
  if (referralCode) init.referral_code = referralCode;
  if (opts.checksum) init.checksum = opts.checksum;
  if (image) init.fb_share_image = image;

  sqh.push(['init', init]);
  this.called = true;
  this.load();
};

/**
 * Group.
 *
 * @api public
 * @param {Group} group
 */

SaaSquatch.prototype.group = function(group){
  var sqh = window._sqh;
  var id = group.groupId();
  var image = group.proxy('traits.referralImage') || this.options.referralImage;
  var opts = group.options(this.name);

  // tenant_alias is required.
  if (this.called) return;

  var init = {
    tenant_alias: this.options.tenantAlias,
    account_id: id
  };

  if (opts.checksum) init.checksum = opts.checksum;
  if (image) init.fb_share_image = image;

  sqh.push(['init', init]);
  this.called = true;
  this.load();
};
