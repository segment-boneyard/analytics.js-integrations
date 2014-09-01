/**
 * Module dependencies.
 */
var integration = require('analytics.js-integration');
var tick = require('next-tick');

/**
 * Expose Usersnap integration.
 */

var Usersnap = module.exports = integration('Usersnap')
    .assumesPageview()
    .global('Usersnap')
    .global('_usersnapconfig')
    .option('apiKey', '')
    .tag('<script src="//api.usersnap.com/load/{{ apiKey }}.js">');

/**
 * Initialize.
 *
 *
 * @param {Object} page
 */

Usersnap.prototype.initialize = function(page) {
    var ready = this.ready;
    window._usersnapconfig = window._usersnapconfig || {};
    if (window._usersnapconfig.loadHandler) {
        var lh = window._usersnapconfig.loadHandler;
        window._usersnapconfig.loadHandler = function() {
            tick(ready);
            lh.apply(arguments);
        };
    } else {
        window._usersnapconfig.loadHandler = function() {
            tick(ready);
        };
    }
    this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Usersnap.prototype.loaded = function() {
    return !!window.UserSnap;
};
