const build = require('./index.js');
const test = makeTest(build);

test(
  ({ name }) => ({ N: name }),
  '{"N":{=name:json}}'
)

test(
  ({ name }) => ({ N: name.upper() }),
  '{"N":{=name:upper:json}}'
)

test(
  ({ emails }) => ({
    E: emails.map(e => e),
  }),
  '{"E":[{#emails|{=:json},|}]}'
)

test(
  ({ emails }) => ({
    E: emails.map(e => e.upper()).filter('4'),
  }),
  '{"E":[{#emails|{=:upper:json},|:filter 4}]}'
)

test(
  ({ error }) => ({
    code: error.then(400).else(200)
  }),
  '{"code":{?error|400|:|200|}}'
)

test(
  ({ error }) => ({
    code: error.then(400).toFixed().else(200).toFixed()
  }),
  '{"code":{?error|400|:toFixed|200|:toFixed}}'
)

test(
  ({ name }) => ({
    N: name.else('Hi')
  }),
  '{"N":{=name:json|"Hi"|}}'
)

test(
  ({ name, number }) => ({
    N: name.else({ foo: number })
  }),
  '{"N":{=name:json|{"foo":{=number:json}}|}}'
)
