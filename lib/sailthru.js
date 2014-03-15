/**
* Module dependencies.
*/
var integration = require('integration');
var callback = require('callback');
var load = require('load-script');
  
/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(Sailthru);
};

/**
 * Expose `Sailthru` integration.
 */

var Sailthru = exports.Integration = integration('Sailthru Horizon')
  .assumesPageview()
  .readyOnInitialize()
  .global('Sailthru')
  .option('domain')
  .option('concierge', null)
  .option('cookieDomain', null)
  .option('useStoredTags', null)
  .option('tags', null);
  
/**
 * Initialize.
 *
 * http://http://docs.sailthru.com/documentation/products/horizon-data-collection/horizon-setup
 *
 * @param {Object} page
 */

Sailthru.prototype.initialize = function (page) {
  var properties = page.properties();
  var options = this.options;
  
  addProperties(properties);
  this.load(function(){
    setup(options);
  });
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Sailthru.prototype.loaded = function () {
  return !! window.Sailthru;
};


/**
 * Load.
 *
 * @param {Function} callback
 */

Sailthru.prototype.load = function (callback) {
  load('//ak.sail-horizon.com/horizon/v1.js', callback);
};


/**
 * Page.
 *
 * @param {Page} page
 */

Sailthru.prototype.page = function (page) {
  var properties = page.properties();
  var options = this.options;
  
  addProperties(properties);
  setup(options);
};


/**
 * Add new metatags to the page with prefix
 *
 * @param {String} prefix
 * @param {Array} tags
 * */

function addMetaTags(prefix, tags) {
  for (var name in tags) {
    var content = tags[name];
    addMetaTag(prefix + name, content);
  }
}


/**
 * Add new single metatag to the page header
 *
 * @param {String} name
 * @param {String} content
 * */

function addMetaTag(name, content) {
  var meta = document.createElement('meta');
  meta.name = name;
  meta.content = content;
  document.getElementsByTagName('head')[0].appendChild(meta); 
}


/**
 * Add user information properties for SailThru Horizon
 *
 * @param {Array} properties
 * */
function addProperties(properties) {
  if (properties) addMetaTags('sailthru.', properties);
}


/**
 * Setup SailThru Horizon service
 *
 * @param {Object} options
 * */

function setup(options) {
  if (window.Sailthru)
    Sailthru.setup({
      domain: options.domain,
      concierge: options.concierge,
      cookieDomain: options.cookieDomain,
      useStoredTags: options.useStoredTags,
      tags: options.tags
    });
}