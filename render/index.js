const parse = require('./parse.js');
const render = require('./render.js');

function toString (template, scopes, helperFns) {
  if (!Array.isArray(scopes)) scopes = [scopes];
  const tree = parse(template);
  return render(tree, scopes, helperFns);
}

function toObject (template, scopes, helperFns = {}) {
  return JSON.parse(toString(template, scopes, {
    ...helperFns,
    json: JSON.stringify,
    join: (arr, delim=',') => arr.join(delim)
  }));
}

module.exports = {
  toString,
  toObject
}
