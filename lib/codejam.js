var fs = require('fs');
var path = require('path');
var lineReader = require('line-reader');


function LineReader(pathInput) {
  return {
    eachLine: function(fn) {
      var lineIndex = 0;
      lineReader.eachLine(pathInput, function(line, last) {
        fn(line, lineIndex);
        lineIndex++;
      });
    }
  };
}


function CaseReader(numOfLinesPerCase) {
  var eachCase;

  var lines = [];
  var caseNum = 1;

  function next() {
    lines = [];
    caseNum++;
  }

  return {
    addLine: function(line, lineIndex) {
      if (lineIndex === 0) { return ; }

      lines.push(line);
      if (lines.length === numOfLinesPerCase) {
        eachCase({
          caseNum: caseNum,
          lines: lines,
        });
        next();
      }
    },

    eachCase: function(fn) {
      eachCase = fn;
    }
  };
}


function CodeJam(evaluate) {
  var eachOutput;

  return {
    addCase: function(jamCase) {
      var output = evaluate(jamCase.caseNum, jamCase.lines);
      eachOutput(output, jamCase);
    },

    eachOutput: function(fn) {
      eachOutput = fn;
    }
  };
}


function Formater() {
  var eachFormated;

  return {
    addOutput: function(output, jamCase) {
      var formated = 'Case #' + jamCase.caseNum + ': ' + output;
      eachFormated(formated, jamCase);
    },


    eachFormated: function(fn) {
      eachFormated = fn;
    }
  };
}


function Writer(pathOutput) {
  return {
    writeLine: function(line) {
      fs.appendFileSync(pathOutput, line + '\n');
    }
  };
}


function Validator(pathSpec) {
  var eachFailCase;

  return {
    addOutput: function(output, jamCase) {

    },

    eachFailCase: function(fn) {
      eachFailCase = fn;
    }
  };
}



function getPaths(pathCode, pathInput) {
  function pathWithoutExt(path) {
    var splits = path.split('.');
    splits.pop();
    return splits.join('.');
  }

  if (!/^.*\.in$/g.test(pathInput)) {
    throw new Error('input file should end with .in');
  }

  var input = path.resolve(pathCode, '..', pathInput);
  console.log(input);
  var file = pathWithoutExt(input);
  var output = file + '.out';
  var spec = file + '.spec';

  return {
    input: input,
    output: output,
    spec: spec,
  };
}


var pathCode = process.argv[1];
var pathInput = process.argv[2];
var paths = getPaths(pathCode, pathInput);

var run = function(evaluate, numOfLinesPerCase) {
  fs.writeFileSync(paths.output, '');

  var lineReader = LineReader(paths.input);
  lineReader.eachLine(function(line, lineIndex) {
    caseReader.addLine(line, lineIndex);
  });

  var caseReader = CaseReader(numOfLinesPerCase);
  caseReader.eachCase(function(jamCase) {
    codeJam.addCase(jamCase);
  });

  var codeJam = CodeJam(evaluate);
  codeJam.eachOutput(function(output, jamCase) {
    formater.addOutput(output, jamCase);
    validator.addOutput(output, jamCase);
  });

  var formater = Formater();
  var writer = Writer(paths.output);
  formater.eachFormated(function(formated) {
    console.log(formated);
    writer.writeLine(formated);
  });

  var validator = Validator(paths.spec);
  validator.eachFailCase(function(failCase, jamCase) {
    console.error('Case fails', jamCase, failCase);
  });
};

module.exports = {
  run: run
};
