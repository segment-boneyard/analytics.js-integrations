
var Identify = require('facade').Identify;
var Track = require('facade').Track;
var callback = require('callback');
var integration = require('integration');
var load = require('load-script');
var onBody = require('on-body');
var each = require('each');

/**
 * User reference.
 */

var user;

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(GoSquared);
  user = analytics.user(); // store reference for later
};

/**
 * Expose `GoSquared` integration.
 */

var GoSquared = exports.Integration = integration('GoSquared')
  .assumesPageview()
  .readyOnLoad()
  .global('_gs')
  .option('siteToken', '')
  .option('anonymizeIP', false)
  .option('cookieDomain', null)
  .option('useCookies', true)
  .option('trackHash', false)
  .option('trackLocal', false)
  .option('trackParams', true);

/**
 * Initialize.
 *
 * https://www.gosquared.com/developer/tracker
 * Options: https://www.gosquared.com/developer/tracker/configuration
 *
 * @param {Object} page
 */

GoSquared.prototype.initialize = function(page){
  var self = this;
  var options = this.options;
  push(options.siteToken);

  each(options, function(name, value){
    if ('siteToken' == name) return;
    if (null == value) return;
    push('set', name, value);
  });

  self.identify(new Identify({
    traits: user.traits(),
    userId: user.id()
  }));

  self.load();
};

/**
 * Loaded? (checks if the tracker version is set)
 *
 * @return {Boolean}
 */

GoSquared.prototype.loaded = function(){
  return !! (window._gs && window._gs.v);
};

/**
 * Load the GoSquared library.
 *
 * @param {Function} callback
 */

GoSquared.prototype.load = function(callback){
  load('//d1l6p2sc9645hc.cloudfront.net/tracker.js', callback);
};

/**
 * Page.
 *
 * https://www.gosquared.com/developer/tracker/pageviews
 *
 * @param {Page} page
 */

GoSquared.prototype.page = function(page){
  var props = page.properties();
  var name = page.fullName();
  push('track', props.path, name || props.title)
};

/**
 * Identify.
 *
 * https://www.gosquared.com/developer/tracker/tagging
 *
 * @param {Identify} identify
 */

GoSquared.prototype.identify = function(identify){
  var traits = identify.traits({ userId: 'userID' });
  var username = identify.username();
  var email = identify.email();
  var id = identify.userId();
  if (id) push('set', 'visitorID', id);
  var name =  email || username || id;
  if (name) push('set', 'visitorName', name);
  push('set', 'visitor', traits);
};

/**
 * Track.
 *
 * https://www.gosquared.com/developer/tracker/events
 *
 * @param {Track} track
 */

GoSquared.prototype.track = function(track){
  push('event', track.event(), track.properties());
};

/**
 * Checked out.
 *
 * @param {Track} track
 * @api private
 */

GoSquared.prototype.completedOrder = function(track){
  var products = track.products();
  var items = [];

  each(products, function(product){
    var track = new Track({ properties: product });
    items.push({
      category: track.category(),
      quantity: track.quantity(),
      price: track.price(),
      name: track.name(),
    });
  })

  push('transaction', track.orderId(), {
    revenue: track.total(),
    track: true
  }, items);
};

/**
 * Push to `_gs.q`.
 *
 * @param {...} args
 * @api private
 */

function push(){
  var _gs = window._gs = window._gs || function(){
    (_gs.q = _gs.q || []).push(arguments);
  };
  _gs.apply(null, arguments);
}
