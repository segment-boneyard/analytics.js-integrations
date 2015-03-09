
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var tick = require('next-tick');
var bind = require('bind');
var when = require('when');

/**
 * Expose `Yandex` integration.
 */

var Yandex = module.exports = integration('Yandex Metrica')
  .assumesPageview()
  .global('yandex_metrika_callbacks')
  .global('Ya')
  .option('counterId', null)
  .option('clickmap', false)
  .option('webvisor', false)
  .tag('<script src="//mc.yandex.ru/metrika/watch.js">');

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
  var clickmap = this.options.clickmap;
  var webvisor = this.options.webvisor;

  push(function(){
    window['yaCounter' + id] = new window.Ya.Metrika({
      id: id,
      clickmap: clickmap,
      webvisor: webvisor
    });
  });

  var loaded = bind(this, this.loaded);
  var ready = this.ready;
  this.load(function(){
    when(loaded, function(){
      tick(ready);
    });
  });
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
 * Push a new callback on the global Yandex queue.
 *
 * @param {Function} callback
 */

function push(callback){
  window.yandex_metrika_callbacks = window.yandex_metrika_callbacks || [];
  window.yandex_metrika_callbacks.push(callback);
}
