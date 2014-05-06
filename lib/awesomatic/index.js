
var integration = require('integration');
var is = require('is');
var load = require('load-script');
var noop = function(){};
var onBody = require('on-body');

/**
 * User reference.
 */

var user;

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(Awesomatic);
  user = analytics.user(); // store for later
};

/**
 * Expose `Awesomatic` integration.
 */

var Awesomatic = exports.Integration = integration('Awesomatic')
  .assumesPageview()
  .global('Awesomatic')
  .global('AwesomaticSettings')
  .global('AwsmSetup')
  .global('AwsmTmp')
  .option('appId', '');

/**
 * Initialize.
 *
 * @param {Object} page
 */

Awesomatic.prototype.initialize = function(page){
  var self = this;
  var id = user.id();
  var options = user.traits();

  options.appId = this.options.appId;
  if (id) options.user_id = id;

  this.load(function(){
    window.Awesomatic.initialize(options, function(){
      self.emit('ready'); // need to wait for initialize to callback
    });
  });
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Awesomatic.prototype.loaded = function(){
  return is.object(window.Awesomatic);
};

/**
 * Load the Awesomatic library.
 *
 * @param {Function} callback
 */

Awesomatic.prototype.load = function(callback){
  var url = 'https://1c817b7a15b6941337c0-dff9b5f4adb7ba28259631e99c3f3691.ssl.cf2.rackcdn.com/gen/embed.js';
  load(url, callback);
};