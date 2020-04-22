const parse = require('./parse.js');
const render = require('./render.js');

module.exports = function (template, scopes, helperFns) {
  if (!Array.isArray(scopes)) scopes = [scopes];
  const tree = parse(template);
  return render(tree, scopes, helperFns);
}
