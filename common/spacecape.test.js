const { spaceMore, spaceLess } = require('./spacecape.js');
const testSpaceMore = makeTest(spaceMore);
const testSpaceLess = makeTest(spaceLess);

const test = (original, spaced) => {
  testSpaceMore(original, spaced);
  testSpaceLess(spaced, original);
}

test('', '');
test('{=foo}', '{ =foo}');
test('{#foo|{=}|}', '{ #foo|{ =}| }');
test('{ =foo', '{  =foo');
