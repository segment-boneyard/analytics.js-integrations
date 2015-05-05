
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var Identify = require('facade').Identify;
var Track = require('facade').Track;
var callback = require('callback');
var load = require('load-script');
var onBody = require('on-body');
var each = require('each');
var is = require('is');
var pick = require('pick');
var omit = require('omit');

/**
 * Expose `GoSquared` integration.
 */

var GoSquared = module.exports = integration('GoSquared')
  .assumesPageview()
  .global('_gs')
  .option('apiSecret', '')
  .option('anonymizeIP', false)
  .option('cookieDomain', null)
  .option('useCookies', true)
  .option('trackHash', false)
  .option('trackLocal', false)
  .option('trackParams', true)
  .tag('<script src="//d1l6p2sc9645hc.cloudfront.net/tracker.js">');

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
  var user = this.analytics.user();
  push(options.apiSecret);

  each(options, function(name, value){
    if ('apiSecret' == name) return;
    if (null == value) return;
    push('set', name, value);
  });

  self.identify(new Identify({
    traits: user.traits(),
    userId: user.id()
  }));

  self.load(this.ready);
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
 * Page.
 *
 * https://www.gosquared.com/docs/tracking/api/#pageviews
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
 * https://www.gosquared.com/docs/tracking/identify
 *
 * @param {Identify} identify
 */

GoSquared.prototype.identify = function(identify){
  var traits = identify.traits({
    createdAt: 'created_at',
    firstName: 'first_name',
    lastName: 'last_name',
    title: 'company_position',
    industry: 'company_industry'
  });

  // https://www.gosquared.com/docs/tracking/api/#properties
  var specialKeys = [
    'id',
    'email',
    'name',
    'first_name',
    'last_name',
    'username',
    'description',
    'avatar',
    'phone',
    'created_at',
    'company_name',
    'company_size',
    'company_position',
    'company_industry'
  ];

  // Segment allows traits to all be in a flat object
  // GoSquared requires all custom properties to be in a `custom` object,

  // select all special keys
  var props = pick.apply(null, [traits].concat(specialKeys));
  props.custom = omit(specialKeys, traits);

  var id = identify.userId();

  if (id) {
    push('identify', id, props);
  } else {
    push('properties', props);
  }

  var email = identify.email();
  var username = identify.username();

  var name = email || username || id;
  if (name) push('set', 'visitorName', name);
};

/**
 * Track.
 *
 * https://www.gosquared.com/docs/tracking/events
 *
 * @param {Track} track
 */

GoSquared.prototype.track = function(track){
  push('event', track.event(), track.properties());
};

/**
 * Checked out.
 *
 * https://www.gosquared.com/docs/tracking/ecommerce
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
