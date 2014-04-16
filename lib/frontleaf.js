
var callback = require('callback');
var integration = require('integration');
var is = require('is');
var load = require('load-script');

/**
 * Expose plugin.
 */

module.exports = exports = function (analytics) {
  analytics.addIntegration(Frontleaf);
};


/**
 * Expose `Frontleaf` integration.
 */

var Frontleaf = exports.Integration = integration('Frontleaf')
  .assumesPageview()
  .readyOnInitialize()
  .global('_fl')
  .global('_flBaseUrl')
  .option('baseUrl', 'https://api.frontleaf.com')
  .option('token', '')
  .option('stream', '');


/**
 * Initialize.
 *
 * http://docs.frontleaf.com/#/technical-implementation/tracking-customers/tracking-beacon
 *
 * @param {Object} page
 */

Frontleaf.prototype.initialize = function (page) {
  window._fl = window._fl || [];
  window._flBaseUrl = window._flBaseUrl || this.options.baseUrl;

  this._push('setApiToken', this.options.token);
  this._push('setStream', this.options.stream);

  this.load();
};


/**
 * Loaded?
 *
 * @return {Boolean}
 */

Frontleaf.prototype.loaded = function () {
  return is.array(window._fl) && window._fl.ready === true ;
};


/**
 * Load.
 *
 * @param {Function} fn
 */

Frontleaf.prototype.load = function (fn) {
  if (document.getElementById('_fl')) return callback.async(fn);

  var script = load(window._flBaseUrl + '/lib/tracker.js', fn);
  script.id = '_fl';
};


/**
 * Identify.
 *
 * @param {Identify} identify
 */

Frontleaf.prototype.identify = function (identify) {
  var userId = identify.userId();
  if (userId) {
    this._push('setUser', {
      id : userId,
      name : identify.name() || identify.username(),
      data : clean(identify.traits())
    });
  }
};


/**
 * Group.
 *
 * @param {Group} group
 */

Frontleaf.prototype.group = function (group) {
  var groupId = group.groupId();
  if (groupId) {
    this._push('setAccount', {
      id : groupId,
      name : group.proxy('traits.name'),
      data : clean(group.traits())
    });
  }
};


/**
 * Track.
 *
 * @param {Track} track
 */

Frontleaf.prototype.track = function (track) {
  var event = track.event();
  if (event) {
    this._push('event', event, clean(track.properties()));
  }
};


/**
 * Push a command onto the global Frontleaf queue.
 *
 * @param {String} command
 * @return {Object} args
 * @api private
 */

Frontleaf.prototype._push = function (command) {
  var args = [].slice.call(arguments, 1);
  window._fl.push(function(t) { t[command].apply(command, args); });
}


/**
 * Clean all nested objects and arrays.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function clean(obj) {
  var ret = {};

  // Remove traits/properties that are already represented
  // outside of the data container
  var excludeKeys = ["id","name","firstName","lastName"];
  var len = excludeKeys.length;
  for (var i = 0; i < len; i++) {
    clear(obj, excludeKeys[i]);
  }

  // Flatten nested hierarchy, preserving arrays
  obj = flatten(obj);

  // Discard nulls, represent arrays as comma-separated strings
  for (var key in obj) {
    var val = obj[key];
    if (null == val) {
      continue;
    }

    if (is.array(val)) {
      ret[key] = val.toString();
      continue;
    }

    ret[key] = val;
  }

  return ret;
}

/**
 * Remove a property from an object if set.
 *
 * @param {Object} obj
 * @param {String} key
 * @api private
 */

function clear(obj, key) {
  if (obj.hasOwnProperty(key)) {
    delete obj[key];
  }
}


/**
 * Flatten a nested object into a single level space-delimited
 * hierarchy.
 *
 * Based on https://github.com/hughsk/flat
 *
 * @param {Object} source
 * @return {Object}
 * @api private
 */

function flatten(source) {
  var output = {};

  function step(object, prev) {
    Object.keys(object).forEach(function(key) {
      var value = object[key];
      var newKey = prev ? prev + ' ' + key : key;

      if (!is.array(value) && is.object(value)) {
        return step(value, newKey);
      }

      output[newKey] = value
    })
  }

  step(source);

  return output;
}
