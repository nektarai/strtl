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
    assert.equal(result, expected);
    console.log('PASS', expected);
  } catch (e) {
    console.log('FAIL', expected);
    console.error('Error:', e);
  }
}

require('./build/build.test.js');
require('./render/render.test.js');

if (only.length) {
  only.forEach(runTest);
} else {
  tests.forEach(runTest);
}
