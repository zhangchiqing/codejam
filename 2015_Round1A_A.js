var codejam = require('./lib/codejam');

function computeMethod1(cakes) {
  var lastCake;
  return cakes.reduce(function(memo, cake) {
    if (lastCake !== void 0) {
      if (cake < lastCake) {
        memo += (lastCake - cake);
      }
    }
    lastCake = cake;
    return memo;
  }, 0);
}


function computeMethod2(cakes, N) {
  var rate = 0;
  var lastCake;
  cakes.forEach(function(cake) {
    if (lastCake !== void 0) {
      if (cake < lastCake) {
        rate = Math.max(rate, lastCake - cake);
      }
    }

    lastCake = cake;
  });
  lastCake = void 0;
  var max = (N - 1) * rate;
  cakes.pop();
  cakes.forEach(function(cake) {
    if (cake < rate) {
      max -= rate - cake;
    }
  });
  return max;
}

function evaluate(caseNum, caseLines) {
  var N = +caseLines[0];
  var cakes = caseLines[1].split(' ').map(function(cake) {
    return +cake;
  });
  var method1 = computeMethod1(cakes);
  var method2 = computeMethod2(cakes, N);
  return method1 + ' ' + method2;
}

codejam.run(evaluate, 2);
