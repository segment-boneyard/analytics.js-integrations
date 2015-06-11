
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var defaults = require('defaults');
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
  var traits = identify.traits();
  var opts = identify.options(this.name);
  var user_opts = opts.user;
  var created = identify.created();
  var company_created = identify.companyCreated();
  var name = identify.name();
  var id = identify.uid();
  var email = identify.email();
  var group = this.analytics.group();

  // We need email addresses
  if (!email) return;

  // Send a name in as well
  if (!name) name = email;

  if (traits.company !== null && !is.object(traits.company)) {
    delete traits.company;
  }

  if (traits.company) {
    defaults(traits.company, group.traits());
  }

  if (company_created) {
    del(traits.company, 'created_at');
    del(traits.company, 'created');
    del(traits.company, 'createdAt');
    traits.company.created_at = Math.round(company_created / 1000);
  }

  ramenSettings.organization_id = this.options.organization_id;
  ramenSettings.user = {
    name: name,
    id: id,
    email: email
  };

  if (created) ramenSettings.user.created_at = Math.round(created / 1000);

  // Iterate through company traits and load them on ramenSettings.company
  if (traits.company) {
    ramenSettings.company = {};
    for (property in traits.company) {
      if (traits.company.hasOwnProperty(property)) {
        ramenSettings.company[property] = traits.company[property];
      }
    }
  }

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

  if (ramenSettings.auth_hash_timestamp) {
    ramenSettings.timestamp = ramenSettings.auth_hash_timestamp;
    del(ramenSettings, 'auth_hash_timestamp');
  }

  // For tracking purposes
  ramenSettings._partner = 'segment.com';

  // Expose ramenSettings so Ramen.go() can see it
  window.ramenSettings = ramenSettings;

  // Ramen.go() will figure things out if called multiple times
  window.Ramen.go();
};

Ramen.prototype.group = function(group) {
  // If there is not already a ramenSettings object, or if Ramen isn't loaded,
  // then do nothing here.
  if (!(window.ramenSettings && window.Ramen)) {
    return;
  }

  var property;
  var props = group.properties();
  props.created_at = group.created();
  if (props.created_at) {
    props.created_at = Math.round(props.created_at / 1000);
  }
  del(props, 'created');
  del(props, 'createdAt');
  var id = group.groupId();
  if (id) props.id = id;

  // Iterate through properties and send them along to Ramen through ramenSettings
  window.ramenSettings.company = {};
  for (property in props) {
    if (props.hasOwnProperty(property)) {
      window.ramenSettings.company[property] = props[property];
    }
  }

  window.Ramen.go();
};
