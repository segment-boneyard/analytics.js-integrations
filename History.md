
1.3.68 / 2015-06-01
===================

  *  GoSquared: Auto-tag visitors on the back-end
  *  Route.to: Add integration

1.3.67 / 2015-05-27
===================

  * Taplytics: Add integration
  * Wootric: Add integration
  * Bing Ads: Fix revenue parameter
  * Add linter and refactor out linting errors

1.3.66 / 2015-05-22
===================

  * Clean up Makefile, correct linting errors
  * Outbound.io: Adding anonymous id and aliasing
  * Nudgespot: Change apiKey name to enable direct integration

1.3.62 / 2015-05-02
===================

  * optimizely: removing breaking data pre-load

1.3.61 / 2015-05-01
===================

  * Remove extra script tag and fix attributes names

1.3.60 / 2015-04-29
===================

  * Fix outbound attribute names

1.3.59 / 2015-04-29
===================

  * Outbound: library for better identify attribute mapping

1.3.58 / 2015-04-28
===================

  * Adding anonymousId closes #601

1.3.57 / 2015-04-28
===================


1.3.56 / 2015-04-21
===================
  
  * Release Outbound integration

1.3.55 / 2015-04-20
===================

  * Added Livechat Roots

1.3.54 / 2015-04-16
===================
  * Fix CDN


1.3.54 / 2015-04-16
===================

  * Merge pull request #530 from tikotzky/fix/VWO
  * Merge pull request #584 from segmentio/pr/559

1.3.53 / 2015-04-09
===================

  * Merge pull request #581 from ryanjadhav/fix/optimizely-opt-out
  * guard against optimizely.data.state being undefined

1.3.52 / 2015-04-02
===================

  * updated saasquatch

1.3.51 / 2015-04-01
===================

  * upgrading `segmentio/obj-case` to fix build issues

1.3.50 / 2015-03-31
===================

  * FullStory: dont mutate iteratee
  * Snapengage: use Snapengage cdn
  * Amplitude: Update Amplitude to v2.1.0
  * Adroll: send revenue with _all_ events, not just mapped
  * Facebook: fix tests to reflect *conversions*, not custom data

1.3.49 / 2015-03-20
===================

  * Merge pull request #558 from segmentio/fix/fb-conv
  * Merge pull request #564 from segmentio/add/secureCookie
  * added secureCookie option to mixpanel
  * rm custom audience events from conversion tracking
  * Merge pull request #555 from segmentio/ga/page-cd
  * Merge pull request #547 from segmentio/fix/facebook-conversion-tracking
  * added page() as a proxy to track() call in facebook conversions
  * add dimension/metric support to #page

1.3.48 / 2015-03-10
===================

  * Fullstory: Camelcase custom properties
  * Mixpanel: Add option for cross-subdomain cookie

1.3.47 / 2015-03-04
===================

  * KISSMetrics: Reference alternative tracker URL

1.3.46 / 2015-03-03
===================

  * Nudgespot: Remove protocol from tag
  * Nudgespot: updated identify call to accept id as a param
  * Google Analytics: remove product impression call, map viewed product to detail view
  * Frontleaf: update creds
  * Adwords: Automatically attach custom paramaters for Google AdWords integration

1.3.45 / 2015-02-24
===================

  * Heap: alias email to _email instead of dropping it entirely

1.3.44 / 2015-02-23
==================

  * test: update tests to test for .context instead of .options
  * segment: fix onalias

1.3.43 / 2015-02-19
===================

  * quantcast: fix generic track orderid capitalization, add tests
  * Un-minify Heap integration initialize method.
  * Update Heap integration to new snippet.
  * Update Amplitude to v2.0.3

1.3.42 / 2015-02-13
===================

  * Heap: fix  id mess
  * Adroll: adding custom params
  * Quantcast: updated to send orderId with generic track event
  * Drip: updated to new global

1.3.41 / 2015-02-04
===================

  * update GoSquared integration to send correct traits

1.3.40 / 2015-02-04
===================

  * GA: Added event name and category for ecommerce
  * Forward settings for Custom Ticket Fields

1.3.39 / 2015-02-03
==================

  * segment: add .sentAt
  * added identify method to google analytics

1.3.38 / 2015-01-29
===================

  * Update Contributing.md
  * Heap: remove assumes pageview
  * Autosend: new integration
  * Piwik: adding custom variable support

1.3.37 / 2015-01-23
===================

  * Perfect Audience: quick style change

1.3.36 / 2015-01-22
===================

  * Quantcast: Adding custom label support
  * Vero: Implemented #alias
  * Atatus: new integration.
  * Satismeter: new integration

1.3.35 / 2015-01-22
===================

  * Atatus: styling fixes

1.3.34 / 2015-01-22
===================

  * Merge pull request #506 from segmentio/fix/atatus
  * Atatus: styling fixes
  * Merge pull request #461 from satismeter/master
  * Merge pull request #467 from fizerkhan/integration-atatus
  * Release 1.3.29
  * Merge pull request #469 from thomassittig/master
  * cleanup
  * update additional-tracking-data-structure and updated tests
  * fixed integrations-counter and tests
  * Merge remote-tracking branch 'upstream/master'
  * added the tracking of basic-custom-data
  * cleaned up integration- and test-code
  * initial userlike-integration
  * Increased length of integrations.
  * Updated unit testing. Removed UMD.
  * Added atatus integration.
  * new integration: satismeter

1.3.33 / 2015-01-22
===================

  * Merge pull request #506 from segmentio/fix/atatus
  * Atatus: styling fixes
  * Merge pull request #461 from satismeter/master
  * Merge pull request #467 from fizerkhan/integration-atatus
  * Release 1.3.29
  * Merge pull request #469 from thomassittig/master
  * cleanup
  * update additional-tracking-data-structure and updated tests
  * fixed integrations-counter and tests
  * Merge remote-tracking branch 'upstream/master'
  * added the tracking of basic-custom-data
  * cleaned up integration- and test-code
  * initial userlike-integration
  * Increased length of integrations.
  * Updated unit testing. Removed UMD.
  * Added atatus integration.
  * new integration: satismeter

1.3.32 / 2015-01-22
===================

  * Merge pull request #506 from segmentio/fix/atatus
  * Atatus: styling fixes
  * Merge pull request #461 from satismeter/master
  * Merge pull request #467 from fizerkhan/integration-atatus
  * Release 1.3.29
  * Merge pull request #469 from thomassittig/master
  * cleanup
  * update additional-tracking-data-structure and updated tests
  * fixed integrations-counter and tests
  * Merge remote-tracking branch 'upstream/master'
  * added the tracking of basic-custom-data
  * cleaned up integration- and test-code
  * initial userlike-integration
  * Increased length of integrations.
  * Updated unit testing. Removed UMD.
  * Added atatus integration.
  * new integration: satismeter

1.3.31 / 2015-01-22
===================

  * Merge pull request #506 from segmentio/fix/atatus
  * Atatus: styling fixes
  * Merge pull request #461 from satismeter/master
  * Merge pull request #467 from fizerkhan/integration-atatus
  * Release 1.3.29
  * Merge pull request #469 from thomassittig/master
  * cleanup
  * update additional-tracking-data-structure and updated tests
  * fixed integrations-counter and tests
  * Merge remote-tracking branch 'upstream/master'
  * added the tracking of basic-custom-data
  * cleaned up integration- and test-code
  * initial userlike-integration
  * Increased length of integrations.
  * Updated unit testing. Removed UMD.
  * Added atatus integration.
  * new integration: satismeter

1.3.30 / 2015-01-22
===================

  * Merge pull request #506 from segmentio/fix/atatus
  * Atatus: styling fixes
  * Merge pull request #461 from satismeter/master
  * Merge pull request #467 from fizerkhan/integration-atatus
  * Release 1.3.29
  * Merge pull request #469 from thomassittig/master
  * cleanup
  * update additional-tracking-data-structure and updated tests
  * fixed integrations-counter and tests
  * Merge remote-tracking branch 'upstream/master'
  * added the tracking of basic-custom-data
  * cleaned up integration- and test-code
  * initial userlike-integration
  * Increased length of integrations.
  * Updated unit testing. Removed UMD.
  * Added atatus integration.
  * new integration: satismeter

1.3.29 / 2015-01-21
===================

  * Userlike integration

1.3.28 / 2015-01-19
==================

  * mojn: fix tests
  * changed analytics.gif to identify.gif
  * mojn: add failing tests
  * Add Nudgespot integration

1.3.27 / 2015-01-15
===================

  * Centralize Extole into a single file to fix build error

1.3.26 / 2015-01-15
===================

  * Merge pull request #497 from segmentio/fix/extole

1.3.25 / 2015-01-15
===================

  * Extole: fix for subdir name issues

1.3.24 / 2015-01-14
===================

 * add support for bing ads universal event tracking

1.3.23 / 2015-01-14
===================

  * Add Extole integration
  * preact logger now backwards compatible (can log with _lnq or _preactq)
  * Customerio: Updating test values
  * Blueshift: shouldnt assume pageview

1.3.22 / 2015-01-08
===================

  * Fix Intercom date handling

1.3.21 / 2015-01-07
==================

  * livechat: fix LC_Invite missing, and update key
  * Removing assumed page view

1.3.20 / 2015-01-05
==================

  * Update Amplitude integration to v2.0.2

1.3.19 / 2015-01-01
==================

  * livechat: LC_Invite is never defined
  * fix: update yields/store
  * make: depend on build.js before test-style
  * changed to single quotes and removed toString
  * fixed blank line
  * fixing user id

1.3.18 / 2014-12-17
===================

  * Adroll: added custom data to all calls

1.3.17 / 2014-12-16
===================

  * Add GitHub IP range to known_hosts to prevent Duo error

1.3.16 / 2014-12-16
===================

  * Merge pull request #481 from segmentio/fix/duo-installs
  * Add GitHub IP range to known_hosts to prevent Duo error

1.3.15 / 2014-12-12
===================

  * Adroll: adding custom params
  * Google Analytics: add custom dims and metrics to track calls
  * Chartbeat: adding basic implementation of authors and sections

1.3.14 / 2014-12-11
===================

  * Leadlander: removing integration
  * Awesomatic: removing integration
  * removing travisci and updating badge
  * tweaking circle.yml
  * Rollbar: updating to 1.1.0

1.3.13 / 2014-12-04
==================

  * segment: use text/plain
  * Styling fixes
  * Re-adding build.js step to make test
  * Updating tests with new linting, removing make-lint dependency
  * Adding last bits of linting fixes
  * Adding linting

1.3.12 / 2014-11-25
===================

  * FullStory: added support for custom traits

1.3.11 / 2014-11-22
===================

  * Amplitude: campaign names
  * Perfect Audience: track fixes

1.3.10 / 2014-11-21
==================

  * sentry: update raven, and use .RavenConfig global to initialize
  * changed to use del module in fullstory
  * fix for fullstory
  * Remove errant logfile
  * Update `yields/store` to 1.0.1
  * added createdAt as a format in customerio

1.3.9 / 2014-11-13
==================

  * ga: remove errant parens

1.3.8 / 2014-11-11
==================

  * deps: bump utm-params

1.3.7 / 2014-11-11
==================

  * GA: remove parens from campaign params

1.3.6 / 2014-11-06
==================

  * Amplitude: added setDomain and setGlobalUserProperties to init
  * Adding documentation link at initialization section
  * Fixing space issues in bsft test.js
  * Integration with getblueshift.com
  * piwik: add event tracking

1.3.5 / 2014-10-28
==================

 * add GA support for explicitly passed campaign params
 * Typo, language fixes
 * add segment
 * deps: update duo

1.3.4 / 2014-10-25
==================

  * contributing: segment.io -> segment.com
  * Removing unnecessary temp variable
  * update GoSquared w/ `identify` method

1.3.3 / 2014-10-22
==================

  * fixed intercom to properly set createdAt to created_at

1.3.2 / 2014-10-21
==================

  * saasquatch: updating tests, removing undefined
  * uncommenting out the global referral images
  * Adding unsubscribe capabilities to track
  * ga: remove es5 filter use
  * ga: add comments
  * tests: fix mocha-phantomjs
  * fixed fullstory integration
  * Added Enhanced Ecommerce support to GA integration
  * Fixed nonInteraction option in ga

1.3.1 / 2014-10-17
==================

 * ga: remove es5 filter use
 * ga: add comments

1.3.0 / 2014-10-17
==================

 * Added Enhanced Ecommerce support to GA integration
 * tests: fix mocha-phantomjs

1.2.22 / 2014-10-10
==================

  * Perfect Audience: Add support for ecommerce
  * Added fullstory
  * Update Amplitude to v1.3

1.2.21 / 2014-10-09
==================

 * Load Inspectlet's javascript from the CDN

1.2.20 / 2014-10-08
==================

  * GA: add noninteraction advanced option

1.2.19 / 2014-10-07
===================

  * Merge pull request #430 from segmentio/fix/comscore
  * Fix page method comment
  * add support for SPAs in comscore

1.2.18 / 2014-10-06
===================

  * Merge pull request #426 from segmentio/fix/inspectlet
  * Update test.js
  * Fix test expected method
  * add support for inspectlet page

1.2.17 / 2014-10-01
===================

  * Merge pull request #424 from segmentio/keen/addons
  * Merge pull request #414 from segmentio/insidevault/multiple-events
  * keen: send addons on .track() too
  * insidevault: support multiple events

1.2.16 / 2014-09-26
===================

  * Merge pull request #421 from segmentio/fix/heap
  * Changed terminology apiKey to appId
  * Merge pull request #420 from segmentio/fix/google-analytics
  * Fix: changed default domain to auto

1.2.15 / 2014-09-22
===================

  * deps: upgrade domify to fix bing-ads on ie8

1.2.14 / 2014-09-17
===================

  * errorception: update apiKey
  * Merge pull request #418 from segmentio/fix/bugsnag
  * bugsnag: use amd when possible
  * Merge pull request #415 from segmentio/fix/inside-vault
  * Merge pull request #417 from segmentio/fix/inspectlet
  * update clear-env to support clear-ajax, which removes ajax requests in process between tests. fixes #416
  * Fixes to IV
  * Merge pull request #408 from chiplay/fix/keen
  * Return cloned props for setGlobalProperties

1.2.13 / 2014-09-04
===================

  * Merge pull request #401 from segmentio/remove/hublo
  * only 73 now that we deleted one
  * removing hublo since theyve pivoted

1.2.12 / 2014-09-02
===================

  * Merge pull request #399 from segmentio/fix/usercycle
  * skipping hublo tests
  * weird tests breaking nonsensically, something changed in facade from 1.4.3 to 1.4.4 to cause nulls to be undefined
  * removing usercycle

1.2.11 / 2014-08-28
===================

  * deps: duo 0.7
  * Merge pull request #396 from segmentio/fix/adwords
  * Merge pull request #392 from segmentio/olark/phantom-identify
  * adding new test to prevent remarketing regression
  * removing remarketing true from conversions
  * fix olark phantom track/page calls

1.2.10 / 2014-08-22
==================

 * adwords: pass remarketing option directly to google_remarketing_only

1.2.9 / 2014-08-22
==================

 * ga: fix ecommerce loading tests
 * remove amd script for now so that bugsnag tests pass
 * adwords: work on page load, switch to async version
 * ga: removing ecommerce.js from require call
 * deps: depend on duo-test@0.2
 * deps: upgrade to duo 0.7

1.2.8 / 2014-08-15
==================

 * fixing mixpanel date object passing
 * fixing mixpanel array length conversion

1.2.7 / 2014-08-07
==================

 * re-adding integrations.js
 * deleting userfox, fixes #257

1.2.6 / 2014-08-07
==================

 * keen-io: add support for addons! for #358
 * keen-io: add test for both keen.min.js and keen-tracker.min.js
 * keen: load keen-tracker by default, otherwise if they have a readKey then load the full 600kb keen
 * keenio: upgrade to 3.0.5

1.2.5 / 2014-08-07
==================

 * google-analytics: update userId tests
 * customer.io: use https endpoint
 * errorception: new trial key...
 * twitter-ads: change option name
 * mixpanel: swap to using ianstormtaylor/is for type checking
 * google-analytics: add currency support
 * swap to facade
 * convert arrays to a number length
 * remove amplitude assuming a pageview
 * merging facebook ad rename
 * Fix userId field
 * ignore tests
 * remove tests file
 * add extra options to yandex metrica
 * facebook-ads: renaming to conversion-tracking
 * update livechat to include a name and email
 * fixing dot notation lookups for traits/properties that have dots in them
 * twitter-ads: add option to track page views
 * bronto: remove generic `track` method, for #361
 * drip: remove email requirement for #identify
 * drip: retrofit the #track method and add #identify support

1.2.4 / 2014-07-25
==================

 * Merge pull request #354 from segmentio/update/insidevault
 * insidevault: add .page and event mapping

1.2.3 / 2014-07-23
==================

 * force remove duo tmpdir
 * Merge pull request #352 from segmentio/fix/requires
 * fix: requires
 * comment clarity

1.2.2 / 2014-07-17
==================

 * deps: remove duo-package@0.2.13
 * package.json: remove version
 * bugsnag: use real api key

1.2.1 / 2014-07-16
==================

 * internet explorer test fixes
 * twitter-ads: support array events
 * facebook-ads: support array events
 * churnbee: support array events
 * bing-ads: support array events
 * awesm: suppot array setting
 * adwords: support array setting
 * adroll: support array events setting
 * refactor clear-x code into modules
 * test and merge insidevault
 * vero cookie notes
 * initialize yandex test
 * try next tick for yandex
 * fix environment between tests so they reliably pass
 * fix curebit/kissmetrics paths for tests
 * merge hublo
 * only select .js files in make, fixes #342
 * better doc
 * make sure the library has loaded - not just the snippet
 * single line some objects
 * add InsideVault integration
 * Hublo integration

1.2.0 / 2014-07-11
==================

 * cleanup unused modules
 * abstract away plugin functionality
 * create `clear-x` modules, to put into repos later
 * add test sandbox that clears timeouts/intervals/eventListeners between tests
 * move all script/img loading to .tag dsl method

1.1.3 / 2014-07-08
==================

 * remove sinon

1.1.2 / 2014-07-08
==================

 * docs: add token link
 * docs: add netrc
 * update: readme to use 0.11
 * update bin/tests to auto generated notice
 * cleanup bin, plus json and makefile
 * Adds optional page support to frontleaf integration
 * fix tests when url gets a hash appended to it
 * unpin analytics.js-integration-tester
 * change .notCalled() to .didNotCall()
 * port rest of tests to new api

1.1.1 / 2014-06-26
==================

 * bing: rename goals to events to match ui
 * woopra: adding name fix, fixes #234

1.1.0 / 2014-06-24
==================

 * bronto: fix email conversion tracking and port tests
 * bing: use javascript api, get working, and port tests
 * bump load-script to 0.1.2
 * bugherd: port tests, fix loading problem
 * adwords: port tests
 * drip: refactor tests
 * crazy-egg: port tests
 * rename settings to options to match integration constructor
 * facebook-ads: port to new test api
 * navilytics: port to new test api
 * kissmetrics: port to new test api
 * alexa: port to new test api
 * mixpanel: port to new test api
 * add test stub
 * add template test file
 * adroll migrate to new testing api
 * adroll: snake-case event names, resolves #226
 * bronto: rename addConversion to addOrder according to their docs
 * update readme with development instructions
 * updating makefile, bumping component/queue for ie8 compat
 * make-test: make sure we use installed phantomjs(1)
 * make-clean: never remove integrations.js or test/tests.js
 * refactor tests for duo, and add saucelabs + gravy!

1.0.2 / 2014-06-13
==================

 * bumping obj-case dep

1.0.1 / 2014-06-12
==================

 * updating dependencies to non-duo branches

1.0.0 / 2014-06-12
==================

 * converting to use duo

0.9.9 / 2014-06-11
==================

 * add ability to specify custom integration for `make test`
 * bugherd: fix test - cant load bugherd unless logged in on browser
 * facebook-ads: add support for custom events
 * adroll: add `.page` and make `.track` only send revenue when conversion events are defined
 * quantcast: adjust pCode
 * intercom: fix intercom company handling to guarantee an id
 * fix logic to work for all non-objects, and preserve strings
 * intercom: fix company when its a string

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
