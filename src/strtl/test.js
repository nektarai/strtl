const strtl = require('./index.js');
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

function runTest([template, ...args]) {
  const expected = args.pop();
  try {
    assert.equal(strtl(template, ...args), expected);
    console.log('PASS', template);
  } catch (e) {
    console.log('FAIL', template);
    console.error(e);
  }
}

const test = (...args) => tests.push(args);
test.skip = (template) => console.log('SKIP', template);
test.only = (...args) => only.push(args);

const helpers = { upr: (s) => s.toUpperCase(), lwr: (s) => s.toLowerCase() };

test(
  'Hi {=name:lwr|You|:upr}',
  {},
  helpers,
  'Hi YOU'
);

test(
  'Hi {=name:lwr|You|:upr}',
  { name: 'Alice' },
  helpers,
  'Hi alice'
);

test(
  'mailto:{#foo.recipients|{=email}{=delim}|}?...',
  { delim: ';',
    foo: { recipients: [
    { email: 'alice@example.com' },
    { email: 'bob@example.com' }
  ]}},
  'mailto:alice@example.com;bob@example.com;?...'
);

test(
  'foo{|Hello, {=name:up}|:url}',
  { name: 'World' },
  { url: encodeURIComponent, up: str => str.toUpperCase() },
  'fooHello%2C%20WORLD'
);

test(
  '{#tags|Tag {=} |:|No tags|}',
  { tags: ['1', '2'] },
  'Tag 1 Tag 2 '
);

test(
  '{#tags|Tag {=} |:|No tags|}',
  { tags: [] },
  'No tags'
);

test(
  '{?tags|Has tags|:upr|No tags|:lwr}',
  { tags: 1 },
  { upr: (s) => s.toUpperCase(), lwr: (s) => s.toLowerCase() },
  'HAS TAGS'
);

test(
  '{?tags|Has Tags|:upr|No Tags|:lwr}',
  { tags: 0 },
  { upr: (s) => s.toUpperCase(), lwr: (s) => s.toLowerCase() },
  'no tags'
);

// parse('Hi {=a.b} {#zero|Hi {=}!|:foo :bar 3} Yo {?|Nice|} bah');

run();
