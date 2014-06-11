
0.9.8 / 2014-06-05
==================

 * kenshoo: refactor
 * mixpanel: delete ip property too
 * mixpanel: delete reserved properties to avoid conflicts
 * quantcast: fix exception in identify()
 * chartbeat: fix issue where Chartbeat script loads and executes before document.body exists
 * chartbeat: replace obsolete protocol-specific script load URLs with protocol-agnostic URL
 * chartbeat: Preserve existing _sf_async_config values unless overridden by via settings/defaults
 * chartbeat: Add useCanonical to options and _sf_async_config with default value true

0.9.7 / 2014-06-04
==================

 * adwords: fix method name comflict

0.9.6 / 2014-06-04
==================

 * fix kissmetrics test

0.9.5 / 2014-06-04
==================

 * kissmetrics: test internal kissmetrics pageView is being called
 * kissmetrics: fix page calling logic in initialize
 * kissmetrics: fix kissmetrics to properly handle page views and assumes
 * woopra: fix woopra config
 * adwords: add remarketing to adwords
 * curebit: fix curebit double iframe issue
 * kissmetrics: fix kissmetrics page tracking
 * appcues: Adding Appcues integration.
 * google-analytics: fix custom metrics, remove from page/track/group, closes #177

0.9.4 / 2014-06-03
==================

 * properly check that facebook is loaded

0.9.3 / 2014-06-02
==================

 * curebit: make ready on load so iframes have a chance to be rendered

0.9.2 / 2014-06-02
==================

 * errorception: update testing api key
 * curebit: debug removing iframe for curebit on multiple .page() calls
 * curebit: change default for iframeId
 * facebook ads: migrate facebook ads to new javascript api

0.9.1 / 2014-05-30
==================

 * adroll: fixing user_id issue and adding tests

0.9.0 / 2014-05-29
==================

 * errorception: update key
 * awesomatic: skip tests
 * piwik: add goals / ecommerce, closes #161
 * piwik: remove .assumesPageview()
 * docs: Small fix to example [appcues]
 * errorception: update key
 * woopra: add all options, closes #153
 * kissmetrics: add isMobile
 * ga: pass through category on track
 * ga: set `siteSpeedSampleRate` to `1`

0.8.2 / 2014-05-21
==================

 * ga-ecommerce: fallback to .revenue()

0.8.1 / 2014-05-20
==================

 * add test for prefixProperties: false
 * revert kissmetrics props, add more tests
 * intercom: make sure .Intercom() is loaded

0.8.0 / 2014-05-19
==================

 * kissmetrics: adding prefixing + ecommerce
 * kissmetrics: updating `.trackNamedPages` and `.trackCategorizedPages` to `.trackPages`

0.7.0 / 2014-05-17
==================

 * tests: update bugherd key
 * ga: fix typo `ignoreReferrers -> ignoredReferrers`
 * upgrade facade to `0.3.10`
 * refactor to use .revenue instead of .revenue || .total
 * add inspectlet identify, fixes #140

0.6.1 / 2014-05-07
==================

 * ga: add custom dimensions & metrics, closes #73

0.6.0 / 2014-05-02
==================

 * fixing curebit tests, fixes #126
 * swap curebit to load the iframe on #page, BREAKING TESTS
 * fix intercom page to call update
 * intercom: cache group, to prevent race conditions.
 * klaviyo: .revenue() -> $value

0.5.10 / 2014-04-29
==================

 * tests: comment out userfox #load test, since their script 404 for some reason
 * mixpanel: when .created_at is given and transformed to $created, make sure .created_at is then removed
 * navilytics: make sure __nls is created when initialized
 * tests: add missing name to userfox test
 * upgrade analytics.js-integration to 0.2.0 for .events() method
 * component: add githubusercontent to remotes

0.5.9 / 2014-04-24
==================

 * livechat: make sure LC_API & LC_Invite are loaded
 * add Frontleaf integration
 * intercom: trackUserEvent -> trackEvent
 * node-tests: use spec reporter

0.5.8 / 2014-04-17
==================

 * errorception: update key for tests

0.5.7 / 2014-04-17
==================

 * quantcast: fix advertise separator
 * quantcast: fix revenue undefined case
 * quantcast: fix pageviews.

0.5.6 / 2014-04-16
==================

 * quantcast: call .page() with .page(Page) in initialize
 * upgrade integration to 0.1.8
 * add adroll events, closes #27 ?

0.5.5 / 2014-04-14
==================

 * quantcast: remove labelPages option
 * quantcast: add .advertise option and impl
 * piwik: id -> siteId
 * mixpanel: add increments, closes #95

0.5.4 / 2014-04-11
==================

 * mojn: replace global var name [mojn]
 * ga: add google display ads
 * curebit: Switch to stable library
 * Add Piwik [charlesportwoodii]
 * adwords: fix typo
 * kenshoo: fix typo
 * Add curebit to readme

0.5.3 / 2014-04-07
==================

 * curebit: removing # since its not necessary

0.5.2 / 2014-04-07
==================

 * curebit: fixing up to new spec
 * navilytics: mid & pid -> memberId & projectId
 * hellobar: rename Hellobar -> Hello Bar
 * alexa: atrk_acct -> account

0.5.1 / 2014-04-05
==================

 * intercom: fix activator

0.5.0 / 2014-04-04
==================

 * quantcast: dont use .filter and .map
 * add Kenshoo [realyze]
 * add Navilytics [beeker1121]
 * rollbar: update to use latest notifier [coryvirok]

0.4.14 / 2014-04-01
==================

 * add tests for slugs.json and component.json
 * add Hellobar
 * mixpanel: fix traits leak
 * add Alexa

0.4.13 / 2014-03-26
==================

 * curebit: fixing `this` reference

0.4.12 / 2014-03-26
==================

 * upgrade document-write
 * vero: add .page()

0.4.11 / 2014-03-25
==================

 * curebit: fix

0.4.10 / 2014-03-19
==================

 * adding default id for curebit to insert into

0.4.9 / 2014-03-14
==================

* curebit: campaign_tag fixes

0.4.8 / 2014-03-14
==================

* more curebit fixes

0.4.7 / 2014-03-14
==================

 * new curebit changes, fixes #67

0.4.6 / 2014-03-12
==================

 * adwords: use `.appendChild()` and load `conversion.js` instead of the pixel.
 * curebit: fix typo

0.4.5 / 2014-03-06
==================

 * upgrade facade to 0.2.11

0.4.4 / 2014-03-05
==================

 * add curebit identify, closes #62
 * upgrade bugsnag to v2, closes #61
 * fix intercom first, last name

0.4.3 / 2014-02-26
==================

 * google-analytics: dont send user id by default

0.4.2 / 2014-02-26
==================

 * google-analytics: send universal user id, closes #59
 * churnbee: use an object instead of array for supported events
 * intercom: remove counter option

0.4.1 / 2014-02-18
==================

 * saasquatch: add checksum, accountId and image support, closes #58
 * intercom: update track()
 * lytics: not tracking pageview fix

0.4.0 / 2014-02-10
==================

 * upgrade facade to `0.2.7`
 * adwords: fix mappnigs, closes #49
 * add [Mojn](https://mojn.com)
 * add [SaaSquatch](http://www.referralsaasquatch.com/)
 * add [ChurnBee](http://churnbee.com)
 * add [Bing Ads](http://advertise.bingads.microsoft.com/)
 * add [Twitter Ads](http://ads.twitter.com/)
 * Update to raven-js 1.1.10 [mattrobenolt]
 * foxmetrics: add ecommerce
 * kissmetrics: add ecommerce
 * gosquared: add ecommerce
 * bronto: add ecommerce
 * curebit: add ecommerce
 * google-analytics: add ecommerce
 * google analytics: fix page url property name
 * upgrade analytics.js-integration to `0.1.7`

0.3.10 / 2014-01-30
==================

 * upgrade facade to 0.2.4
 * upgrade analytics.js-integration to 0.1.7
 * add group option to livechat

0.3.9 / 2014-01-23
==================

 * add [Bronto](http://bronto.com/).
 * add [Curebit](http://www.curebit.com/)

0.3.8 / 2014-01-18
==================

 * rename facebook to facebook ads

0.3.7 / 2014-01-15
==================

 * update Facade to 0.2.3
 * gosquared: update tracker
 * add [Facebook](https://www.facebook.com/advertising)
 * add [AdWords](https://adwords.google.com/)
 * add [Mouseflow](http://mouseflow.com/)
 * usercycle: map `revenue` to `revenue_amount`

0.3.6 / 2014-01-10
==================

 * intercom: send created_at and name correctly

0.3.5 - January 3, 2014
-----------------------
 * add slugs.json

0.3.4 - December 26, 2013
-------------------------
 * add intercom track

0.3.3 - December 18, 2013
-------------------------
* update obj-case, fixes problems with amd
* add require.js to test file

0.3.2 - December 18, 2013
-------------------------
* fix `segmentio/facade` dependency

0.3.1 - December 18, 2013
-------------------------
* add [Google Tag Manager](https://www.google.com/tagmanager/)
* lucky orange: fix identify bug

0.3.0 - December 12, 2013
-------------------------
* add [facade](https://github.com/segmentio/facade)

0.2.16 - December 11, 2013
--------------------------
* google-analytics: add support for retaining query string in page views

0.2.15 - December 11, 2013
--------------------------
 * webengage: load in initialize

0.2.14 - December 11, 2013
--------------------------
 * add [WebEngage](http://webengage.com)
 * heap: fallback to user id as `.handle`

0.2.13 - December 4, 2013
-------------------------
* uservoice: add `smartvote` option
* errorception: fix bug in sending errors

0.2.12 - December 2, 2013
-------------------------
* mixpanel: fix `track` date conversion

0.2.11 - November 26, 2013
--------------------------
* update `analytics.js-integration` to `0.1.5`

0.2.10 - November 21, 2013
--------------------------
* optimizely: adding .page() support

0.2.9 - November 21, 2013
-------------------------
* awesomatic: fix identify logic

0.2.8 - November 20, 2013
-------------------------
* hubspot: update CDN url

0.2.7 - November 20, 2013
-------------------------
* evergage: add tracking of page name and properties

0.2.6 - November 15, 2013
-------------------------
* updating dependencies

0.2.5 - November 14, 2013
-------------------------
* heap: adding fixes for heap snippet

0.2.4 - November 13, 2013
-------------------------
* adroll: fix custom data key name

0.2.3 - November 12, 2013
-------------------------
* woopra: remove assumesPageview

0.2.2 - November 12, 2013
-------------------------
* optimizely: fix case where snippet does not exist

0.2.1 - November 12, 2013
-------------------------
* awesomatic: fix global loaded check
* bugsnag: fix global loaded check
* clicktale: fix global loaded check
* clicky: fix global loaded check
* drip: fix global loaded check
* hittail: fix global loaded check
* intercom: fix global loaded check
* kissmetrics: fix global loaded check
* mousestats: fix global loaded check
* sentry: fix global loaded check
* snapengage: fix global loaded check

0.2.0 - November 11, 2013
-------------------------
* bugsnag: add bugsnag integration
* lucky-orange: added lucky orange integration
* drip: add drip integration
* inspectlet: add tagging session on track

0.1.2 - November 11, 2013
-------------------------
* preact: fixing load called from initialize

0.1.1 - November 11, 2013
-------------------------
* rename `section` argument to `category`
* change categorized page track logic

0.1.0 - November 10, 2013
-------------------------
* add `loaded` method to all integrations
* change integrations to use the new `page` method signature with `section`

0.0.6 - November 10, 2013
-------------------------
* lytics: remove unused `initialPageview` option
* google analytics: fix classic tests to use non-classic method names
* mixpanel: remove `assumesPageview` setting
* clean all integration files

0.0.5 - November 10, 2013
-------------------------
* add fixes for wrapped loaders GA and UserVoice

0.0.4 - November 8, 2013
------------------------
* exports: actually exporting the integrations

0.0.3 - November 8, 2013
------------------------
* quantcast: change page labels to be behind an option
* quantcast: remove event labels

0.0.2 - November 7, 2013
------------------------
* fix `next-tick` dependency

0.0.1 - November 6, 2013
------------------------
:sparkles:
