const root = require('./proxy.js');
const { strOuter } = require('./affixes.js');

module.exports = function (build) {
  const built = build(root);
  return strOuter(built);
}
