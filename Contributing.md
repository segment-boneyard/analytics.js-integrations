
# Contributing

We're huge fans of open-source, and we absolutely love getting good contributions to **analytics.js**! Integrations are available to thousands of Segment customers and we have hundreds of integrations in already in our queue, so it's important that you do the following _before writing a pull request_. 

  1. Read about our integration options and apply to be a partner: https://segment.com/partners/
  2. Hear from the Segment team before submitting your pull request.

## Getting Setup

To start, we'll get you set up with our development environment. All of our development scripts and helpers are written in [node.js](http://nodejs.org), so you'll want to install that first by going to [nodejs.org](http://nodejs.org).

Then after forking **analytics.js-integrations** just `cd` into the folder and run `make`:

    $ cd analytics.js-integrations
    $ make

That will install all of our [npm](http://npmjs.org) and [component](http://component.io) dependencies and compile the latest version of the development build to test against. You can now add your changes to the library, and run `make test` to make sure everything is passing still.

The commands you'll want to know for development are:

    $ make               # re-compiles the development build of analytics.js for testing
    $ make test          # runs all of the tests in your terminal
    $ make test-browser  # runs all of the tests in your browser, for nicer debugging

## Getting Setup

  To start, you need a couple of tools that will help you integrate as fast as possible:

  - [Khaos](https://github.com/segmentio/khaos) (`npm i -g khaos`)
  - [khaos-analytics.js-integration](https://github.com/segmentio/khaos-analytics.js-integration) (`khaos install segmentio/khaos-analytics.js-integration analytics.js-integration`)

Once you have those tools installed, `cd` into your fork and run:

  ```bash
  $ khaos create analytics.js-integration lib/<slug>
  ```

Khaos will ask you a couple of question and create the integration skeleton for you!
See our [tracking API](https://segment.com/docs/tracking-api/) to check what each method does.

![khaos](https://dl.dropboxusercontent.com/u/8040/khaos-analytics.js-integration.png)


## Adding an Integration

We've written **analytics.js** to be very modular, so that adding new integrations is incredibly easy. The basic idea is that the `analytics` singleton has a list of `Integration` constructors, all keyed by name. For example:

```js
analytics.Integrations;

// {
//    'Google Analytics': [function],
//    'Mixpanel': [function],
//    'Customer.io': [function],
//    ...
// }
```

To add a new integration to the list we expose an `analytics.addIntegration` method, which you just need to pass a constructor. You can create your own integration constructor with our [analytics.js-integration](https://github.com/segmentio/analytics.js-integration) component. (That's how all of the default integrations are created too.)

Then when you call `analytics.initialize`, it will create a new instance of all of the integrations you give it settings for.

To get started, inside your integration file, just require the [analytics.js-integration](https://github.com/segmentio/analytics.js-integration) factory like so:

```js
var integration = require('analytics.js-integration');
```

And then you can make your own integration constructor by passing it a `name`:

```js
var integration = require('analytics.js-integration');
var MyIntegration = integration('My Integration');
```

Once you have the prototype created, you just need to add any of the methods in our [Tracking API](https://segment.com/docs/api/tracking/) to the `prototype`. For example, an integration that implements `initialize` and `identify` might look like this:

```js
var MyIntegration = integration('My Integration')
  .option('apiKey', null);


/**
 * Initialize.
 *
 * @param {Object} page
 */

MyIntegration.prototype.initialize = function (page) {
  // do stuff with `this.options` to initialize your library
};


/**
 * Identify.
 *
 * @param {String} id (optional)
 * @param {Object} traits (optional)
 * @param {Object} options (optional)
 */

MyIntegration.prototype.identify = function (id, traits, options) {
  // do stuff with `id` or `traits`
};
```

To get a good idea of how adding an integration works, check out some of our [existing](/lib/customerio/index.js) [integration](/lib/kissmetrics/index.js) [files](/lib/mixpanel/index.js).

_Note: if you wanted to add your own private integration, you'd do exactly the same thing, just inside your own codebase! But public ones are way more awesome because everyone gets to share them and improve them..._


## Writing Tests

Every contribution you make to **analytics.js** should be accompanied by matching tests. If you look inside of the `test.js` file of any integration, you'll see we're pretty serious about this. That's because:

2. **analytics.js** runs on tons of different types of browsers, operating systems, etc. and we want to make sure it runs well everywhere.
3. It lets us add new features much, much more quickly.
1. We aren't insane.

When adding your own integration, the easiest way to figure out what major things to test is to look at everything you've added to the integration `prototype`. You'll want to write testing groups for `#initialize`, `#load`, `#identify`, `#track`, etc. And each group should test all of the expected functionality.

The most important thing to writing clean, easy-to-manage integrations is to **keep them small** and **clean up after each test**, so that the environment is never polluted by an individual test. For example, in the [`/lib/customerio/test.js`](/lib/customerio/test.js) `#identify` tests you'll notice that we use the `beforeEach` and `afterEach` to make sure that user and sinon.spy state is cleared before and after each test. That way no individual test failing means all of the rest of the tests fail too. (Avoid domino situations!)

If you run into any questions, check out a few of our [existing](/lib/customerio/test.js) [test](/lib/kissmetrics/test.js) [files](/lib/mixpanel/test.js) to see how we've done it.


## Contributing Checklist

To help make contributing easy, here's all the things you need to remember:

- Add your integration file to `/lib`.
- Create a new Integration constructor with the `integration` factory component.
- Add your integration's default options with `.option()`.
- Add an `initialize` method to your integration's `prototype`.
- Add methods you want to support to the `prototype`. (`identify`, `track`, `pageview`, etc.)
- Write tests for all of your integration's logic.
- Run the tests and get everything passing.
- Commit your changes with a nice commit message.
- Submit your pull request.
