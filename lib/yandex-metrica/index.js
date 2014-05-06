
var callback = require('callback');
var integration = require('integration');
var load = require('load-script');

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(Yandex);
};

/**
 * Expose `Yandex` integration.
 */

var Yandex = exports.Integration = integration('Yandex Metrica')
  .assumesPageview()
  .readyOnInitialize()
  .global('yandex_metrika_callbacks')
  .global('Ya')
  .option('counterId', null);

/**
 * Initialize.
 *
 * http://api.yandex.com/metrika/
 * https://metrica.yandex.com/22522351?step=2#tab=code
 *
 * @param {Object} page
 */

Yandex.prototype.initialize = function(page){
  var id = this.options.counterId;

  push(function(){
    window['yaCounter' + id] = new window.Ya.Metrika({ id: id });
  });

  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Yandex.prototype.loaded = function(){
  return !! (window.Ya && window.Ya.Metrika);
};

/**
 * Load.
 *
 * @param {Function} callback
 */

Yandex.prototype.load = function(callback){
  load('//mc.yandex.ru/metrika/watch.js', callback);
};

/**
 * Push a new callback on the global Yandex queue.
 *
 * @param {Function} callback
 */

function push(callback){
  window.yandex_metrika_callbacks = window.yandex_metrika_callbacks || [];
  window.yandex_metrika_callbacks.push(callback);
}