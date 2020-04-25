const render = require('./index.js');
const test = makeTest(render.toString);

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

test.only(
    'mailto:{#recipientEmails|{=};|:url}?subject={=subject:url}',
    {
        recipientEmails: ['rizkisunaryo@gmail.com', 'rizki@nektar.ai'],
        subject: 'Hi there ^_^'
    },
    {
        url: encodeURIComponent
    },
    'mailto:'
)
