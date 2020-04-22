const gentl = require('./index.js');
const assert = require('assert');

const tests = [];
const only = [];


function run() {
  if (only.length) {
    only.forEach(runTest);
  } else {
    tests.forEach(runTest);
  }
}

function runTest([builder, expected]) {
  try {
    assert.equal(gentl(builder), expected);
    console.log('PASS', expected);
  } catch (e) {
    console.log('FAIL', expected);
    console.error(e);
  }
}

const test = (...args) => tests.push(args);
test.skip = (builder, expected) => console.log('SKIP', expected);
test.only = (...args) => only.push(args);


test(
  ({ name }) => ({ N: name }),
  '{"N":{=name:json}}'
)

test.only(
  ({ emails }) => ({
    E: emails.map(e => {
      console.log('In map fn', e);
      return e;
    }),
  }),
  '{"E":{#emails|{=}|:json}}'
)



run();
