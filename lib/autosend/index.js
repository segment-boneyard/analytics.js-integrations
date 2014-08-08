
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');

/**
 * Expose `Autosend` integration.
 */

var Autosend = module.exports = integration('Autosend')
  .global('_autosend')
  .option('appKey', '')
  .tag('<script id="asnd-tracker" src="https://manage.autosend.io/static/js/v1/autosend.js" data-auth-key="{{ appKey }}">');

/**
 * Initialize.
 *
 * http://autosend.io/faq/install-autosend-using-javascript/
 *
 * @param {Object} page
 */

Autosend.prototype.initialize = function(page){

  window._autosend = window._autosend || []; 
  (function(){var a,b,c;a=function(f){return function(){window._autosend.push([f].concat(Array.prototype.slice.call(arguments,0))); }; }; b=["identify", "track", "cb"];for(c=0;c<b.length;c++){window._autosend[b[c]]=a(b[c]); } })();
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Autosend.prototype.loaded = function(){
  return !! (window._autosend);
};

/**
 * Identify.
 *
 * http://autosend.io/faq/install-autosend-using-javascript/
 *
 * @param {Identify} identify
 */

Autosend.prototype.identify = function(identify){
  
  var id = identify.userId();
  if (!id) return;

  var traits = identify.traits();
  traits['id'] = id;
  
  window._autosend.identify(traits);
};


/**
 * Track.
 *
 * http://autosend.io/faq/install-autosend-using-javascript/
 *
 * @param {Track} track
 */

Autosend.prototype.track = function(track){
  window._autosend.track(track.event());
};
