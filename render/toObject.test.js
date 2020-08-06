const render = require('./index.js');
const test = makeTest(render.toObject);

test(
  '{"ex":"This is { =} too.","why":"{\\"foo\\":{=foo:json},\\"bar\\":{ =bar:json}}"}',
  { foo: 33 },
  {},
  {"ex":"This is {=} too.","why":'{"foo":33,"bar":{=bar:json}}'},
);

test(
  '{"foo":33,"bar":{=bar:json}}',
  { bar: {"pot": "ato" } },
  { foo:33, bar: { pot: 'ato' } }
)
