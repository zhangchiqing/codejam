var codejam = require('./lib/codejam');
var assert = require('assert');
var _ = require('underscore');

function evaluate(caseNum, caseLines) {
  function findFlipByOutletAndDevice(outlet, device0) {
    var flips = [];
    for (var i = 0, len = outlet.length; i < len; i++) {
      if (outlet[i] !== device0[i]) {
        flips.push(i);
      }
    }

    return flips;
  }


  function flipDeviceByFlipWay(device, flipWay) {
    var flipped = device.split('');
    for (var i = 0, len = flipWay.length; i < len; i++) {
      var pos = flipWay[i];
      flipped[pos] = flipped[pos] === '0' ? '1' : '0';
    }

    return flipped.join('');
  }


  assert.equal(flipDeviceByFlipWay('000', [0, 2]), '101');


  var outlets = caseLines[2].split(' ');
  var outletMap = outlets.reduce(function(memo, val) {
    memo[val] = true;
    return memo;
  }, {});

  var us = caseLines[0].split(' ');
  var nLen = +us[0];
  var lLen = +us[1];
  var devices = caseLines[1].split(' ');

  var flips = [];
  var device0 = devices[0];
  for (var n = 0; n < nLen; n++) {
    var outlet = outlets[n];
    flips.push(findFlipByOutletAndDevice(outlet, device0));
  }

  var sortedFlips = _.sortBy(flips, function(flip) {
    return flip.length;
  });
  for (var i = 0; i < sortedFlips.length; i++) {
    var flipWay = sortedFlips[i];
    for (var j = 0; j < nLen; j++) {
      var device = devices[j];
      var flipped = flipDeviceByFlipWay(device, flipWay);
      if (!outletMap[flipped]) {
        break;
      }

      if (j === nLen - 1) {
        return flipWay.length;
      }
    }
  }

  return 'NOT POSSIBLE';
}

codejam.run(evaluate, 3);
