const root = require('./proxy.js');
const { strOuter } = require('./affixes.js');

module.exports = function gentl(build) {
  const built = build(root);
  return strOuter(built);
}

//
// const helpStr = helpers => {
//   if (!helpers || !helpers.length) return '';
//   return helpers.map(helper => `:${helper.join(' ')}`).join(' ');
// };
// const varTag = (path, helpers) => () =>
//   `${pre}{=${path.join('.')}${helpStr(helpers)}}${suf}`
// const loopTag = (expr, nodes, helpers) => () =>
//   [`${pre}{#${expr}|${JSON.stringify(nodes)}|${helpStr(helpers)}}${suf}`]
