
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');

/**
 * Expose Mailchimp integration.
 */

var Mailchimp = module.exports = integration('Mailchimp')
  .assumesPageview()
  .global('$mcGoal')
  .option('uuid', null)
  .option('dc', null)
  .tag('<script src="//downloads.mailchimp.com/js/goal.min.js">');

/**
 * Initialize.
 *
 * @param {Object} page
 */

Mailchimp.prototype.initialize = function(page){
  var self = this;

  window.$mcGoal = {
    settings: {
      uuid: this.options.uuid,
      dc: this.options.dc
    }
  };

  console.log(window.$mcGoal);

 this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Mailchimp.prototype.loaded = function(){
  return !! (window.$mcGoal && window.$mcGoal.process);
};
