const parse = require('./parse.js');
const render = require('./render.js');

function toString (template, scopes, helperFns) {
  if (!Array.isArray(scopes)) scopes = [scopes];
  const tree = parse(template);
  console.log(JSON.stringify(tree, null, 2));
  return render(tree, scopes, helperFns);
}

function toObject (template, scopes, helperFns = {}) {
  return JSON.parse(template, scopes, {
    ...helperFns,
    json: JSON.stringify
  })
}

module.exports = {
  toString,
  toObject
}
