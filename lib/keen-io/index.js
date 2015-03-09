
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var clone = require('clone');

/**
 * Expose `Keen IO` integration.
 */

var Keen = module.exports = integration('Keen IO')
  .global('Keen')
  .option('projectId', '')
  .option('readKey', '')
  .option('writeKey', '')
  .option('ipAddon', false)
  .option('uaAddon', false)
  .option('urlAddon', false)
  .option('referrerAddon', false)
  .option('trackNamedPages', true)
  .option('trackAllPages', false)
  .option('trackCategorizedPages', true)
  .tag('<script src="//d26b395fwzu5fz.cloudfront.net/3.0.7/{{ lib }}.min.js">');

/**
 * Initialize.
 *
 * https://keen.io/docs/
 */

Keen.prototype.initialize = function(){
  var options = this.options;
  !(function(a,b){
    if (void 0===b[a]){
      b["_"+a]={},
      b[a]=function(c){
        b["_"+a].clients=b["_"+a].clients||{},
        b["_"+a].clients[c.projectId]=this,
        this._config=c
      },
      b[a].ready=function(c){
        b["_"+a].ready=b["_"+a].ready||[],b["_"+a].ready.push(c)
      };
      for (var c=["addEvent","setGlobalProperties","trackExternalLink","on"],d=0;d<c.length;d++){
        var e=c[d],
        f=function(a){
          return function(){
            return this["_"+a]=this["_"+a]||[],this["_"+a].push(arguments),this
          }
        };
        b[a].prototype[e]=f(e)
      }
    }
  })("Keen",window);
  this.client = new window.Keen({
    projectId: options.projectId,
    writeKey: options.writeKey,
    readKey: options.readKey
  });

  // if you have a read-key, then load the full keen library
  var lib = this.options.readKey ? 'keen' : 'keen-tracker';
  this.load({ lib: lib }, this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Keen.prototype.loaded = function(){
  return !!(window.Keen && window.Keen.prototype.configure);
};

/**
 * Page.
 *
 * @param {Page} page
 */

Keen.prototype.page = function(page){
  var category = page.category();
  var props = page.properties();
  var name = page.fullName();
  var opts = this.options;

  // all pages
  if (opts.trackAllPages) {
    this.track(page.track());
  }

  // named pages
  if (name && opts.trackNamedPages) {
    this.track(page.track(name));
  }

  // categorized pages
  if (category && opts.trackCategorizedPages) {
    this.track(page.track(category));
  }
};

/**
 * Identify.
 *
 * TODO: migrate from old `userId` to simpler `id`
 * https://keen.io/docs/data-collection/data-enrichment/#add-ons
 *
 * Set up the Keen addons object. These must be specifically
 * enabled by the settings in order to include the plugins, or else
 * Keen will reject the request.
 *
 * @param {Identify} identify
 */

Keen.prototype.identify = function(identify){
  var traits = identify.traits();
  var id = identify.userId();
  var user = {};
  if (id) user.userId = id;
  if (traits) user.traits = traits;
  var props = { user: user };
  this.addons(props, identify);
  this.client.setGlobalProperties(function(){
    return clone(props);
  });
};

/**
 * Track.
 *
 * @param {Track} track
 */

Keen.prototype.track = function(track){
  var props = track.properties();
  this.addons(props, track);
  this.client.addEvent(track.event(), props);
};

/**
 * Attach addons to `obj` with `msg`.
 *
 * @param {Object} obj
 * @param {Facade} msg
 */

Keen.prototype.addons = function(obj, msg){
  var options = this.options;
  var addons = [];

  if (options.ipAddon) {
    addons.push({
      name: 'keen:ip_to_geo',
      input: { ip: 'ip_address' },
      output: 'ip_geo_info'
    });
    obj.ip_address = '${keen.ip}';
  }

  if (options.uaAddon) {
    addons.push({
      name: 'keen:ua_parser',
      input: { ua_string: 'user_agent' },
      output: 'parsed_user_agent'
    });
    obj.user_agent = '${keen.user_agent}';
  }

  if (options.urlAddon) {
    addons.push({
      name: 'keen:url_parser',
      input: { url: 'page_url' },
      output: 'parsed_page_url'
    });
    obj.page_url = document.location.href;
  }

  if (options.referrerAddon) {
    addons.push({
      name: 'keen:referrer_parser',
      input: {
        referrer_url: 'referrer_url',
        page_url: 'page_url'
      },
      output: 'referrer_info'
    });
    obj.referrer_url = document.referrer;
    obj.page_url = document.location.href;
  }

  obj.keen = {
    timestamp: msg.timestamp(),
    addons: addons
  };
};
