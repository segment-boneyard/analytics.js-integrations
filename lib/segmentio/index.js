
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var localstorage = require('store');
var protocol = require('protocol');
var utm = require('utm-params');
var ads = require('ad-params');
var send = require('send-json');
var cookie = require('cookie');
var clone = require('clone');
var uuid = require('uuid');
var top = require('top-domain');
var extend = require('extend');
var json = require('segmentio/json@1.0.0');

/**
 * Cookie options
 */

var options = {
  maxage: 31536000000, // 1y
  secure: false,
  path: '/'
};

/**
 * Expose `Segment` integration.
 */

var Segment = exports = module.exports = integration('Segment.io')
  .option('apiKey', '');

/**
 * Get the store.
 *
 * @return {Function}
 */

exports.storage = function(){
  return 'file:' == protocol()
    || 'chrome-extension:' == protocol()
    ? localstorage
    : cookie;
};

/**
 * Expose global for testing.
 */

exports.global = window;

/**
 * Initialize.
 *
 * https://github.com/segmentio/segmentio/blob/master/modules/segmentjs/segment.js/v1/segment.js
 *
 * @param {Object} page
 */

Segment.prototype.initialize = function(page){
  var self = this;
  this.ready();
  this.analytics.on('invoke', function(msg){
    var action = msg.action();
    var listener = 'on' + msg.action();
    self.debug('%s %o', action, msg);
    if (self[listener]) self[listener](msg);
    self.ready();
  });
};

/**
 * Loaded.
 *
 * @return {Boolean}
 */

Segment.prototype.loaded = function(){
  return true;
};

/**
 * Page.
 *
 * @param {Page} page
 */

Segment.prototype.onpage = function(page){
  this.send('/p', page.json());
};

/**
 * Identify.
 *
 * @param {Identify} identify
 */

Segment.prototype.onidentify = function(identify){
  this.send('/i', identify.json());
};

/**
 * Group.
 *
 * @param {Group} group
 */

Segment.prototype.ongroup = function(group){
  this.send('/g', group.json());
};

/**
 * Track.
 *
 * @param {Track} track
 */

Segment.prototype.ontrack = function(track){
  var json = track.json();
  delete json.traits; // TODO: figure out why we need traits.
  this.send('/t', json);
};

/**
 * Alias.
 *
 * @param {Alias} alias
 */

Segment.prototype.onalias = function(alias){
  var json = alias.json();
  var user = this.analytics.user();
  json.previousId = json.previousId || json.from || user.id() || user.anonymousId();
  json.userId = json.userId || json.to;
  delete json.from;
  delete json.to;
  this.send('/a', json);
};

/**
 * Normalize the given `msg`.
 *
 * @param {Object} msg
 * @api private
 */

Segment.prototype.normalize = function(msg){
  this.debug('normalize %o', msg);
  var user = this.analytics.user();
  var global = exports.global;
  var query = global.location.search;
  var ctx = msg.context = msg.context || msg.options || {};
  delete msg.options;
  msg.writeKey = this.options.apiKey;
  ctx.userAgent = navigator.userAgent;
  if (!ctx.library) ctx.library = { name: 'analytics.js', version: this.analytics.VERSION };
  if (query) ctx.campaign = utm(query);
  this.referrerId(query, ctx);
  msg.userId = msg.userId || user.id();
  msg.anonymousId = user.anonymousId();
  msg.messageId = uuid();
  msg.sentAt = new Date();
  this.debug('normalized %o', msg);
  return msg;
};

/**
 * Send `obj` to `path`.
 *
 * @param {String} path
 * @param {Object} obj
 * @param {Function} fn
 * @api private
 */

Segment.prototype.send = function(path, msg, fn){
  var url = scheme() + '//api.segment.io/v1' + path;
  var headers = { 'Content-Type': 'text/plain' };
  var fn = fn || noop;
  var self = this;

  // msg
  msg = this.normalize(msg);

  // send
  send(url, msg, headers, function(err, res){
    self.debug('sent %O, received %O', msg, arguments);
    if (err) return fn(err);
    res.url = url;
    fn(null, res);
  });
};

/**
 * Gets/sets cookies on the appropriate domain.
 *
 * @param {String} name
 * @param {Mixed} val
 */

Segment.prototype.cookie = function(name, val){
  var store = Segment.storage();
  if (arguments.length === 1) return store(name);
  var global = exports.global;
  var href = global.location.href;
  var domain = '.' + top(href);
  if ('.' == domain) domain = '';
  this.debug('store domain %s -> %s', href, domain);
  var opts = clone(options);
  opts.domain = domain;
  this.debug('store %s, %s, %o', name, val, opts);
  store(name, val, opts);
  if (store(name)) return;
  delete opts.domain;
  this.debug('fallback store %s, %s, %o', name, val, opts);
  store(name, val, opts);
};

/**
 * Add referrerId to context.
 *
 * TODO: remove.
 *
 * @param {Object} query
 * @param {Object} ctx
 * @api private
 */

Segment.prototype.referrerId = function(query, ctx){
  var stored = this.cookie('s:context.referrer');
  var ad;

  if (stored) stored = json.parse(stored);
  if (query) ad = ads(query);

  ad = ad || stored;

  if (!ad) return;
  ctx.referrer = extend(ctx.referrer || {}, ad);
  this.cookie('s:context.referrer', json.stringify(ad));
}

/**
 * Get the scheme.
 *
 * The function returns `http:`
 * if the protocol is `http:` and
 * `https:` for other protocols.
 *
 * @return {String}
 */

function scheme(){
  return 'http:' == protocol()
    ? 'http:'
    : 'https:';
}

/**
 * Noop
 */

function noop(){}
