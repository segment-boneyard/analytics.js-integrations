describe('integrations', function () {

  var assert = require('assert');
  var Integrations = require('integrations');
  var object = require('object');

  it('should export our integrations', function () {
    assert(object.length(Integrations) === 73);
  });

});
