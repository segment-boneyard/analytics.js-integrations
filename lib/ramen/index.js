
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
  var property;
  var ramenSettings = {};
  var opts = identify.options(this.name);
  var user_opts = opts.user;
  var created = identify.created();
  var name = identify.name();
  var id = identify.uid();
  var email = identify.email();

  // We need email addresses
  if (!email) return;

  // Send a name in as well
  if (!name) name = email;

  ramenSettings.organization_id = this.options.organization_id;
  ramenSettings.user = {
    name: name,
    id: id,
    email: email
  };

  if (created) ramenSettings.user.created_at = Math.round(created / 1000);

  // Iterate through user options and load them on ramenSettings.user
  if (user_opts) {
    for (property in user_opts) {
      if (user_opts.hasOwnProperty(property)) {
        ramenSettings.user[property] = user_opts[property];
      }
    }

    // Delete user from opts so we don't override in the next loop
    del(opts, 'user');
  }

  // Iterate through options and load them on ramenSettings
  for (property in opts) {
    if (opts.hasOwnProperty(property)) {
      ramenSettings[property] = opts[property];
    }
  }

  // For tracking purposes
  ramenSettings._partner = 'segment.com';

  // Expose ramenSettings so Ramen.go() can see it
  window.ramenSettings = ramenSettings;

  // Ramen.go() will figure things out if called multiple times
  window.Ramen.go();
};
