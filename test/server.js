
var express = require('express');
var hbs = require('hbs');
var join = require('path').join;
var write = require('fs').writeFileSync;

/**
 * App.
 */

var app = express()
  .set('views', __dirname)
  .engine('html', hbs.__express)
  .get('/coverage', coverage)
  .use(statics)
  .use(tests);

/**
 * Listen.
 */

app.listen(4202, function(){
  var file = join(__dirname, 'pid.txt');
  write(file, process.pid);
  console.log('Started testing server on port 4202...');
});

/**
 * Static files. We don't just use `express.static` because we also want to let
 * people just test a few integrations by passing an environment variable of
 * the integration slugs.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */

function statics(req, res, next){
  function done(){
    var middleware = express.static(join(__dirname, '..'));
    middleware(req, res, next);
  }

  // not an integration test file
  if (!~req.url.indexOf('test.js')) return done();

  // all integrations allowed
  var slugs = (process.env.TESTS || '').split(/\s*,\s*/);
  if ('*' == slugs[0]) return done();

  // specific integration is permitted
  var slug = req.url.match(/\/lib\/([\w-]+)\/test\.js/)[1];
  if (~slugs.indexOf(slug)) return done();

  // send back an empty javascript response, skipping the integration's tests
  res.type('text/javascript');
  res.send(';');
}

/**
 * Coverage reporter.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */

function coverage(req, res, next){
  res.render('coverage.html');
}

/**
 * Mocha tests.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */

function tests(req, res, next){
  res.render('index.html');
}