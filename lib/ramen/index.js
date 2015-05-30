
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var is = require('is');
var tick = require('next-tick');
var del = require('obj-case').del;

/**
 * Expose `Ramen` integration.
 */

var Ramen = module.exports = integration('Ramen')
  .global('Ramen')
  .global('ramenSettings')
  .option('organization_id', '')
  .tag('<script src="//cdn.ramen.is/assets/ramen.js">');

/**
 * Initialize.
 *
 * @api public
 */

Ramen.prototype.initialize = function(){
  var self = this;
  this.load(function() {
    tick(self.ready);
  });
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Ramen.prototype.loaded = function(){
  return is.object(window.Ramen);
};

/**
 * Identify.
 *
 * @api public
 * @param {Identify} identify
 */

Ramen.prototype.identify = function(identify){
  var ramenSettings = {};
  var opts = identify.options(this.name);
  var user_opts = opts.user;
  if (user_opts) {
    del(opts, 'user');
  }
  var created = identify.created();
  var name = identify.name();
  var id = identify.userId();
  var email = identify.email();

  if (!email) return;
  if (!id) id = email;
  if (!name) name = email;

  ramenSettings.organization_id = this.options.organization_id;
  ramenSettings.user = {
    name: name,
    id: id,
    email: email
  };

  if (created) ramenSettings.user.created_at = Math.round(created / 1000);

  if (user_opts) {
    for (var property in user_opts) {
      if (user_opts.hasOwnProperty(property)) {
        ramenSettings.user[property] = user_opts[property];
      }
    }
  }

  for (var property in opts) {
    if (opts.hasOwnProperty(property)) {
      ramenSettings[property] = opts[property];
    }
  }

  ramenSettings._partner = 'segment.com';
  window.ramenSettings = ramenSettings;
  window.Ramen.go();
};
