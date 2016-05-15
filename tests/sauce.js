var log = [];
QUnit.done = function (test_results) {
  var tests = log.map(function(details){
    return {
      name: details.name,
      result: details.result,
      expected: details.expected,
      actual: details.actual,
      source: details.source
    }
  });
  test_results.tests = tests;

  // delaying results a bit cause in real-world
  // scenario you won't get them immediately
  setTimeout(function () { window.global_test_results = test_results; }, 2000);
};
QUnit.log(function(details) {
  log.push(details);
});