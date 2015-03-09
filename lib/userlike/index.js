
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var Identify = require('facade').Identify;
var clone = require('clone');

/**
 * Expose Userlike integration.
 */

var Userlike = module.exports = integration('Userlike')
  .assumesPageview()
  .global('userlikeConfig')
  .global('userlikeData')
  .option('secretKey', '')
  .tag('<script src="//userlike-cdn-widgets.s3-eu-west-1.amazonaws.com/{{ secretKey }}.js">');

/**
 * Initialize.
 *
 * @param {Object} page
 */
Userlike.prototype.initialize = function(page){
  var self = this;
  var user = this.analytics.user();
  var identify = new Identify({
    userId: user.id(),
    traits: user.traits()
  });

  segment_base_info = clone(this.options);

  segment_base_info.visitor = {
    name: identify.name(),
    email: identify.email()
  };

  if (!window.userlikeData)
    window.userlikeData = {
      custom:{}
    }

  window.userlikeData.custom.segmentio = segment_base_info;

  this.load(function(){
    self.ready();
  });
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */
Userlike.prototype.loaded = function(){
  return !! (window.userlikeConfig && window.userlikeData);
};
