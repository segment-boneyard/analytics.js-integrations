
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var iso = require('to-iso-string');
var tester = require('analytics.js-integration-tester');
var plugin = require('./');
var sandbox = require('clear-env');

var waitForWidgets = function(cb, attempts){
  window.extole.require(["jquery"], function(_$){
    var attempts = attempts || 70;
    if ((attempts < 2) || (_$('[id^="extole-advocate-widget"]')[0] &&
    _$('[id^="easyXDM_cloudsponge"]')[0] &&
    _$('#cs_container')[0] &&
    _$('#cs_link')[0])) {
      window.setTimeout(cb, 200);
    } else {
      window.setTimeout(function(){
        waitForWidgets(cb, attempts-1);
      }, 100);
    }
  });
};

var messageListenerOff = function(){
  window.extole.require(["jquery"], function(_$){
    window.extole.$ = _$;
    var windowEvents = window.extole.$._data(window.extole.$(window)[0], "events");
    var msgEventArr = windowEvents.message;
    var msgNamespace;
    if (msgEventArr) {
      for (var i = 0; i < msgEventArr.length; i++) {
        var msgEvent = msgEventArr[i];
        if (msgEvent.namespace && msgEvent.namespace.match) {
          if (msgNamespace = msgEvent.namespace.match(/^view\d+$/)){
            extole.$(window).off("message." + msgNamespace);
          }
        }
      }
    }
  });
};

var xtlTearDown = function(){
  window.extole.require(["jquery"], function(_$){
    window.extole.$ = _$;
    var xtlSelectors = '[id^="extole-"], [id^="easyXDM_cloudsponge"], div[class^="extole"], #cs_container, #cs_link, #wrapped, #footer, style, link[href="https://api.cloudsponge.com/javascripts/address_books/floatbox.css"], link[href^="https://media.extole.com/"]';
    var xtlQ = window.extole.$(xtlSelectors);
    xtlQ.remove();
    delete window.cloudsponge;
    messageListenerOff();
  });
};

describe('Extole', function(){
  var Extole = plugin;
  var extole;
  var analytics;
  var options = {
    clientId: 99286621,
    events: {
    }
  }; // check events config

  beforeEach(function(){
    analytics = new Analytics;
    extole = new Extole(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(extole);
  });

  afterEach(function(done){
    if (extole.loaded() && window.extole.main) {
      waitForWidgets(function(){
        xtlTearDown();
        analytics.restore();
        analytics.reset();
        extole.reset();
        sandbox();
        done();
      });
    } else {
      analytics.restore();
      analytics.reset();
      extole.reset();
      sandbox();
      done(); // ?
    }

  });

  it('should have the correct settings', function(){
    analytics.compare(Extole, integration('Extole')
      .global('extole')
      .option('clientId', '')
      .mapping('events'));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(extole, 'load');
    });

    describe('#initialize', function(){
      it('should call #load', function(){
        analytics.initialize();
        analytics.called(extole.load);
      });

    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(extole, done);
    });

    it('should create window.extole object when loaded', function(done){
        analytics.assert(!window.extole);
        analytics.load(extole, function(){
          analytics.assert(window.extole);
          done();
        });
    });

  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', function(){
        if (window.extole.microsite) {
          done();
        } else {
          window.extole.initializeGo().andWhenItsReady(done);
        }
      });
      analytics.initialize();
    });

    describe('#track', function(){
      beforeEach(function(){

        extole.options.events = {
          'loan made': {
            e: 'email',
            'tag:cart_value': 'loan',
            partner_conversion_id: 'userId',
          },
          'investment made': {
            e: 'email',
            'tag:cart_value': 'investment',
            partner_conversion_id: 'userId'
          }
        };

        // why analytics.identify, were not calling it?
        // because can only get user email if user is identified already
        analytics.identify(Math.floor(Math.random() * 999999),{
          name: 'first last',
          email: 'name@example.com'
        });
        analytics.spy(window.extole.main, 'fireConversion');
        // analytics.spy(window.extole, 'main');
        // analytics.stub(window.extole.main, 'fireConversion');
      });

      it('should not track a Completed Order if there is an Events mapping', function(){
        var randomOrderId = Math.floor(Math.random() * 999999);

        analytics.track('completed order', {
          orderId: randomOrderId,
          revenue: 1.95,
          products: [{
            sku: 'fakesku',
            quantity: 1,
            price: 1.95,
            name: 'fake-product',
          }]
        });

        // Only tracks Completed Order if events mapping empty
        var el = document.querySelector('script[type="extole/conversion"]');
        analytics.equal(el, null);
        analytics.didNotCall(window.extole.main.fireConversion);
      });

      it('should track an Event in the Events mapping', function(done){
        var randomOrderId = Math.floor(Math.random() * 999999);
        var user = analytics.user();

        window.extole.events.on("conversion:purchase", function(){
          done();
        });

        analytics.track('loan made', {
          email: user.traits().email,
          userId: user.id(),
          loan: 1.23,
        });

        var el = document.querySelector('script[type="extole/conversion"]');
        analytics.assert(el.textContent, '{"type":"purchase","params":{"e":"name@example.com","tag:cart_value":"1.23","partner_conversion_id":"' + user.id + '"}}');
        analytics.called(window.extole.main.fireConversion);
      });

      it('should track a different Event in Events', function(done){
        var randomOrderId = Math.floor(Math.random() * 999999);
        var user = analytics.user();

        window.extole.events.on("conversion:purchase", function(){
          done();
        });

        analytics.track('investment made', {
          email: user.traits().email,
          userId: user.id(),
          investment: 1.23,
        });

        var el = document.querySelector('script[type="extole/conversion"]');
        analytics.assert(el.textContent, '{"type":"purchase","params":{"e":"name@example.com","tag:cart_value":"1.23","partner_conversion_id":"' + user.id + '"}}');
        analytics.called(window.extole.main.fireConversion);
      });

      it('should not track an Event that is not in the Events mapping', function(){
        var randomOrderId = Math.floor(Math.random() * 999999);
        var user = analytics.user();

        analytics.track('crazy thing done', {
          email: user.traits().email,
          userId: user.id(),
          craziness: 9.99,
        });

        var el = document.querySelector('script[type="extole/conversion"]');
        analytics.equal(el, null);
        analytics.didNotCall(window.extole.main.fireConversion);
      });

    });  // end track

    describe('#completedOrder', function(){
      beforeEach(function(){
        analytics.identify('123',{
          name: 'first last',
          email: 'name@example.com'
        });
        // window.extole.main = {};
        analytics.spy(window.extole.main, 'fireConversion');
      });

      it('should send ecommerce data', function(done){
        var randomOrderId = Math.floor(Math.random() * 999999);

        window.extole.events.on("conversion:purchase", function(){
          done();
        });

        analytics.track('completed order', {
          orderId: randomOrderId,
          revenue: 1.95,
          products: [{
            sku: 'fakesku',
            quantity: 1,
            price: 1.95,
            name: 'fake-product',
          }]
        });

        var el = document.querySelector('script[type="extole/conversion"]');
        analytics.assert(el.textContent, '{"type":"purchase","params":{"e":"name@example.com","tag:cart_value":"1.95","partner_conversion_id":"' + randomOrderId + '"}}');
        analytics.called(window.extole.main.fireConversion);
      });
    });

  }); // end after loading

/*
 * commenting these tests out, because the microsite is versioned
 * and we don't yet have an API for extracting the version string
 *
  var loadXtlMicrosite = function(){
    var env = "pr";
    var clientIdZoneName = "99286621|microsite1".split("|");
    var clientId = clientIdZoneName[0];
    var zoneName = clientIdZoneName[1];
    var config = {
      lo: {
        MEDIA_SERVER: "//media-lo.extole.com"
      },
      nt: {
        MEDIA_SERVER: "//media-nt.extole.com"
      },
      qa: {
        MEDIA_SERVER: "//media-qa.extole.com"
      },
      pr: {
        MEDIA_SERVER: "//media.extole.com"
      }
    };
    var MEDIA_SERVER = config[env].MEDIA_SERVER;
    var VERSION = "20141204.1114";
    var s = document.createElement('script');

    window.extole = window.extole || {};
    // missing a backtick?
    if (clientId != "{client_id}") {
      window.extole.micrositeConfigInfo = {
        clientId: clientId,
        zoneName: zoneName
      };
    }
    window.extole.micrositeCb = function(){
      window.extole.microsite.start({
        mediaServer: MEDIA_SERVER,
        advocateWidgetVersion: VERSION
      });
    };

    // Chrome is pretty clever, but I spent too long in http://www.unicode.org/charts/PDF/U0000.pdf
    // turns out there are non-standard space characters
    document.title = "\u200B";

    s.src = MEDIA_SERVER + "/advocate-widget/"+VERSION+"/microsite-page.js";
    document.getElementsByTagName("head")[0].appendChild(s);
  };

  describe('plays well with already-loaded Extole', function(){
    describe('loading a fake Extole microsite...', function(){
      before(function(done){
        window._oldTitle = window.document.title;
        window.extoleEvents = {
          "share:email:view": function(){
            // stash the extole object to preserve between tests
            window._msExtole = window.extole;
            done();
          }
        };
        loadXtlMicrosite();
      });

      after(function(){
        document.body.className = "";
        window.document.title = window._oldTitle;
        delete window._oldTitle;
      });

      it('should not load Core.js', function(){
        analytics.spy(analytics, 'page');
        analytics.spy(extole, 'load');
        analytics.initialize();
        analytics.page();
        analytics.called(analytics.page);
        analytics.didNotCall(extole.load);
        // keeps it from running full cleanup, in order to preserve microsite
        window.extole = undefined;
      });

      it('should handle the fake MS already being there', function(){
        // bring back extole object
        window.extole = window._msExtole;
        analytics.spy(analytics, 'page');
        analytics.spy(extole, 'load');
        analytics.initialize();
        analytics.page();
        analytics.called(analytics.page);
        analytics.didNotCall(extole.load);
      });
    });
  });

*/

});
