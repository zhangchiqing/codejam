var fs = require('fs');
var path = require('path');
var lineReader = require('line-reader');
var Rx = require('rx');

function LineStream(pathInput) {
  var lineStream = new Rx.Subject();
  lineReader.eachLine(pathInput, function(line, last) {
    lineStream.onNext(line);

    if (last) {
      lineStream.onCompleted();
    }
  });

  return lineStream;
}


function CaseStream(lineStream, getNumOfLineForCaseByFirstLine) {
  var withCount = lineStream.skip(1);
  var buffered;
  if (typeof getNumOfLineForCaseByFirstLine === 'number') {
    buffered = withCount.bufferWithCount(getNumOfLineForCaseByFirstLine);
  } else {
    buffered = new Rx.Subject();

    var lines = [];
    var numOfLinesForCase = 0;

    withCount.subscribe(function(line) {
      lines.push(line);

      if (lines.length === 1) {
        numOfLinesForCase = getNumOfLineForCaseByFirstLine(line);
      } else if (lines.length === numOfLinesForCase) {
        buffered.onNext(lines);

        lines = [];
      }

    }, buffered.onError, buffered.onCompleted);
  }

  return buffered.map(function(buffer, index) {
    return {
      caseNum: index + 1,
      lines: buffer,
    };
  });
}


function OutputStream(caseStream, evaluate) {
  return caseStream.map(function(args) {
    return {
      caseNum: args.caseNum,
      output: evaluate(args.caseNum, args.lines),
    };
  });
}


function FormatterStream(outputStream) {
  return outputStream.map(function(outputs) {
    return 'Case #' + outputs.caseNum + ': ' + outputs.output;
  });
}


function FileWritterStream(formattedStream, pathOutput) {
  return formattedStream.do(function(line) {
    fs.appendFileSync(pathOutput, line + '\n');
  });
}


function ValidatorStream(outputStream, caseStream, pathSpec) {
  if (!fs.existsSync(pathSpec)) {
    return Rx.Observable.empty();
  }

  var specs = fs.readFileSync(pathSpec).toString().split('\n');
  // last line is ''
  specs.pop();

  return Rx.Observable.fromArray(specs).zip(outputStream, function(spec, outputs) {
    return {
      expect: spec,
      result: outputs.output,
    };
  })
  .filter(function(zipped) {
    return String(zipped.expect) !== String(zipped.result);
  })
  .withLatestFrom(caseStream, function(zipped, jamCase) {
    return {
      expect: zipped.expect,
      result: zipped.result,
      jamCase: jamCase.lines,
    };
  });
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

var run = function(evaluate, getNumOfLineForCaseByFirstLine) {
  fs.writeFileSync(paths.output, '');

  var lineStream = LineStream(paths.input);
  var caseStream = CaseStream(lineStream, getNumOfLineForCaseByFirstLine);
  var outputStream = OutputStream(caseStream, evaluate);
  var validatedStream = ValidatorStream(outputStream, caseStream, paths.spec);
  var formattedStream = FormatterStream(outputStream);
  var fileWriterStream = FileWritterStream(formattedStream, paths.output);

  var subscription = fileWriterStream.subscribe(
    console.log,
    console.error,
    console.log.bind(null, 'Completed')
  );

  validatedStream.subscribe(console.log.bind(null, 'Failed Case'));
};

module.exports = {
  run: run
};
