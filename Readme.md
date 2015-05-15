
# analytics.js-integrations [![Circle CI](https://circleci.com/gh/segmentio/analytics.js-integrations/tree/master.svg?style=svg)](https://circleci.com/gh/segmentio/analytics.js-integrations/tree/master)

This repository houses all of the integrations that get built into [Analytics.js](https://github.com/segmentio/analytics.js).

## Integrating with Segment

Interested in integrating your service with us? Check out our [Partners page](https://segment.com/partners/) for more details and to submit an application!

## Developing

Once you've been given the green light from Segment, you can read the [contribution docs](/Contributing.md) to get started! If you ever need any help, feel free to email [friends@segment.com](mailto:friends@segment.com).

This repository relies on a couple dependencies that help make our lives easier while developing. They are:

  - [`analytics.js-integration`](https://github.com/segmentio/analytics.js-integration), which is a factory for creating `Integration` constructors, that helps us share lots of the common logic in one place.

  - [`analytics.js-integration-tester`](https://github.com/segmentio/analytics.js-integration-tester), which is a testing helper that wraps an integration and simplifies lots of the testing logic. It's similar to how [`supertest`](https://github.com/visionmedia/supertest) works for [Superagent](https://github.com/visionmedia/superagent).

To get started with development, you need to be running node 0.12. An easy way to get it is:

    $ npm install -g n
    $ n 0.12

Make sure you have `~/.netrc` setup like:

```text
machine api.github.com
  login <username>
  password <token>
```

  [Here's how you can create a token](https://help.github.com/articles/creating-an-access-token-for-command-line-use).

Then clone the repository and then inside of it run:

    $ make

That will downloaded all of the dependencies needed, and build the test-ready files. Then, edit as you please, adding new integrations or editing the logic of an existing integration. When you are ready to test run:

    $ make test

That will automatically lint all of the Javascript, and run the entire test suite for each integration. For convenience, you can also limit the tests to just the integration you're working with like so:

    $ make test integration=kissmetrics

And if you'd like you debug in the browser, run:

    $ make test-browser
    $ make test-browser integration=customerio

Once your tests pass, you are ready to submit a pull request!

###Notes on Linting

When you're adding an integration's javascript snippet to your integration, we don't want to have to worry about the formatting that they've used. To let JSCS ignore the snippet during linting, use these comments on either side (example code courtesy of the [JSCS readme](https://github.com/jscs-dev/node-jscs#error-suppression)).

```javascript
// jscs:disable
var c = d; // all errors on this line will be ignored
// jscs:enable 
```
