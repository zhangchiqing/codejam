var codejam = require('./lib/codejam');

function evaluate(caseNum, caseLines) {
  return caseLines[1].split(' ').reduce(function(memo, val) {
    return memo + (+val);
  }, 0);
}

codejam.run(evaluate, 2);
