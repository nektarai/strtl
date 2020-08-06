const assert = require('assert');

const tests = [];
const only = [];

global.makeTest = fn => {
  const test = (...args) => tests.push([fn, ...args]);
  test.skip = (...args) => console.log('SKIP', args.pop());
  test.only = (...args) => only.push([fn, ...args]);
  return test;
};

function runTest([fn, ...args]) {
  const expected = args.pop();
  let result;
  try {
    result = fn(...args);
    assert.deepEqual(result, expected);
    console.log('PASS', fn.name, expected);
  } catch (e) {
    console.log('FAIL', fn.name, expected);
    console.error('Error:', e);
  }
}

require('./common/spacecape.test.js');
require('./build/build.test.js');
require('./render/toString.test.js');
require('./render/toObject.test.js');

if (only.length) {
  only.forEach(runTest);
} else {
  tests.forEach(runTest);
}
