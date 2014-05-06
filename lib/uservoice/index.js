
var alias = require('alias');
var callback = require('callback');
var clone = require('clone');
var convertDates = require('convert-dates');
var integration = require('integration');
var load = require('load-script');
var push = require('global-queue')('UserVoice');
var unix = require('to-unix-timestamp');

/**
 * Expose plugin.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(UserVoice);
};

/**
 * Expose `UserVoice` integration.
 */

var UserVoice = exports.Integration = integration('UserVoice')
  .assumesPageview()
  .readyOnInitialize()
  .global('UserVoice')
  .global('showClassicWidget')
  .option('apiKey', '')
  .option('classic', false)
  .option('forumId', null)
  .option('showWidget', true)
  .option('mode', 'contact')
  .option('accentColor', '#448dd6')
  .option('smartvote', true)
  .option('trigger', null)
  .option('triggerPosition', 'bottom-right')
  .option('triggerColor', '#ffffff')
  .option('triggerBackgroundColor', 'rgba(46, 49, 51, 0.6)')
  // BACKWARDS COMPATIBILITY: classic options
  .option('classicMode', 'full')
  .option('primaryColor', '#cc6d00')
  .option('linkColor', '#007dbf')
  .option('defaultMode', 'support')
  .option('tabLabel', 'Feedback & Support')
  .option('tabColor', '#cc6d00')
  .option('tabPosition', 'middle-right')
  .option('tabInverted', false);

/**
 * When in "classic" mode, on `construct` swap all of the method to point to
 * their classic counterparts.
 */

UserVoice.on('construct', function(integration){
  if (!integration.options.classic) return;
  integration.group = undefined;
  integration.identify = integration.identifyClassic;
  integration.initialize = integration.initializeClassic;
});

/**
 * Initialize.
 *
 * @param {Object} page
 */

UserVoice.prototype.initialize = function(page){
  var options = this.options;

  var opts = formatOptions(options);
  push('set', opts);
  push('autoprompt', {});
  if (options.showWidget) {
    options.trigger
      ? push('addTrigger', options.trigger, opts)
      : push('addTrigger', opts);
  }

  this.load();
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

UserVoice.prototype.loaded = function(){
  return !! (window.UserVoice && window.UserVoice.push !== Array.prototype.push);
};

/**
 * Load.
 *
 * @param {Function} callback
 */

UserVoice.prototype.load = function(callback){
  var key = this.options.apiKey;
  load('//widget.uservoice.com/' + key + '.js', callback);
};

/**
 * Identify.
 *
 * @param {Identify} identify
 */

UserVoice.prototype.identify = function(identify){
  var traits = identify.traits({ created: 'created_at' });
  traits = convertDates(traits, unix);
  push('identify', traits);
};

/**
 * Group.
 *
 * @param {Group} group
 */

UserVoice.prototype.group = function(group){
  var traits = group.traits({ created: 'created_at' });
  traits = convertDates(traits, unix);
  push('identify', { account: traits });
};

/**
 * Initialize (classic).
 *
 * @param {Object} options
 * @param {Function} ready
 */

UserVoice.prototype.initializeClassic = function(){
  var options = this.options;
  window.showClassicWidget = showClassicWidget; // part of public api
  if (options.showWidget) showClassicWidget('showTab', formatClassicOptions(options));
  this.load();
};

/**
 * Identify (classic).
 *
 * @param {Identify} identify
 */

UserVoice.prototype.identifyClassic = function(identify){
  push('setCustomFields', identify.traits());
};

/**
 * Format the options for UserVoice.
 *
 * @param {Object} options
 * @return {Object}
 */

function formatOptions(options){
  return alias(options, {
    forumId: 'forum_id',
    accentColor: 'accent_color',
    smartvote: 'smartvote_enabled',
    triggerColor: 'trigger_color',
    triggerBackgroundColor: 'trigger_background_color',
    triggerPosition: 'trigger_position'
  });
}

/**
 * Format the classic options for UserVoice.
 *
 * @param {Object} options
 * @return {Object}
 */

function formatClassicOptions(options){
  return alias(options, {
    forumId: 'forum_id',
    classicMode: 'mode',
    primaryColor: 'primary_color',
    tabPosition: 'tab_position',
    tabColor: 'tab_color',
    linkColor: 'link_color',
    defaultMode: 'default_mode',
    tabLabel: 'tab_label',
    tabInverted: 'tab_inverted'
  });
}

/**
 * Show the classic version of the UserVoice widget. This method is usually part
 * of UserVoice classic's public API.
 *
 * @param {String} type ('showTab' or 'showLightbox')
 * @param {Object} options (optional)
 */

function showClassicWidget(type, options){
  type = type || 'showLightbox';
  push(type, 'classic_widget', options);
}
