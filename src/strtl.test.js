const strtl = require("./strtl.js");

const helpers = { upr: (s) => s.toUpperCase(), lwr: (s) => s.toLowerCase() };

test('eq', () => expect(
  strtl("Hi {=name|You|}", { name: 'Alice'}, helpers)).toEqual("Hi Alice")
);

test('eq_default', () => expect(
  strtl("Hi {=name|You|}", {}, helpers)).toEqual("Hi You")
);

test('eq_transform', () =>
  expect(
    strtl("Hi {=name:lwr|You|:upr}", { name: "Alice" }, helpers)
  ).toEqual("Hi alice")
);

test('loop', () =>
  expect(
    strtl("mailto:{#foo.recipients|{=email}{=delim}|}?...", {
      delim: ";",
      foo: {
        recipients: [
          { email: "alice@example.com" },
          { email: "bob@example.com" },
        ],
      },
    })
  ).toEqual("mailto:alice@example.com;bob@example.com;?...")
);

test('tup_transform', () =>
  expect(
    strtl(
      "foo{|Hello, {=name:up}|:url}",
      { name: "World" },
      { url: encodeURIComponent, up: (str) => str.toUpperCase() }
    )
  ).toEqual("fooHello%2C%20WORLD")
);

test('loop_separate', () =>
  expect(strtl('{#tags|Tag {=}|:" ":|No tags|}', { tags: ["1", "2"] })).toEqual(
    "Tag 1 Tag 2"
  )
);

test('loop_falsy', () =>
  expect(strtl('{#tags|Tag {=}|:" ":|No tags|}', { tags: [] })).toEqual(
    "No tags"
  )
);

test('true_transform', () =>
  expect(
    strtl(
      "{?tags|Has tags|:upr|No tags|:lwr}",
      { tags: 1 },
      { upr: (s) => s.toUpperCase(), lwr: (s) => s.toLowerCase() }
    )
  ).toEqual("HAS TAGS")
);

test('false_transform', () =>
  expect(
    strtl(
      "{?tags|Has Tags|:upr|No Tags|:lwr}",
      { tags: false },
      { upr: (s) => s.toUpperCase(), lwr: (s) => s.toLowerCase() }
    )
  ).toEqual("no tags")
);

test('nest_tup_transform', () =>
  expect(
    strtl(
      "mailto:{#recipientEmails|{|{=};|:url}|}?subject={=subject:url}",
      {
        recipientEmails: ["rizkisunaryo@gmail.com", "rizki@nektar.ai"],
        subject: "Hi there ^_^",
      },
      {
        url: encodeURIComponent,
      }
    )
  ).toEqual(
    "mailto:rizkisunaryo%40gmail.com%3Brizki%40nektar.ai%3B?" +
      "subject=Hi%20there%20%5E_%5E"
  )
);

test('func', () =>
  expect(strtl("{:now}", {}, { now: () => 123 })).toEqual("123")
);

test('indexes', () => {
  expect(strtl(
    '{#rows|{=.} {#c|{=..}{=.}{=.n}{=n}|:","}|:";"}',
    { rows: [
      { n: 'A', c: [{ n: 'a' }, { n: 'b' }] },
      { n: 'B', c: [{ n: 'c' }, { n: 'd' }] }
    ]}
  )).toEqual(
    "0 00Aa,01Ab;1 10Bc,11Bd"
  );
});

test('unescape', () => expect(strtl(
  'Hi { |zero|  }'
)).toEqual('Hi {|zero| }'));

test('numbers_stack', () => expect(strtl(
  'A is {= a: .3: add}',
  { a: 4, add: (a, b) => a + b }
)).toEqual('A is 4.3'));

test('numbers_operators', () => expect(strtl(
  'B is {= b + 1 * .5 * 8}',
  { b: 3 }
)).toEqual(
  'B is 16'
));

test('cond_expr', () => expect(strtl(
  '{?foo%2=0|Even|:|Odd|}',
  { foo: 5 }
)).toEqual(
  'Odd'
));

test('fizzbuzz', () => expect(strtl(
  '{#it |{=} {?.+ 1%3=0|Fizz|}{?.+ 1%5=0|Buzz|}|:"\\n"}',
  { it: 'abcdefghijklmno'.split('') }
)).toEqual(
  'a \n' +
  'b \n' +
  'c Fizz\n' +
  'd \n' +
  'e Buzz\n' +
  'f Fizz\n' +
  'g \n' +
  'h \n' +
  'i Fizz\n' +
  'j Buzz\n' +
  'k \n' +
  'l Fizz\n' +
  'm \n' +
  'n \n' +
  'o FizzBuzz'
));
