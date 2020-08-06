const root = require('./proxy.js');
const { strOuter } = require('./affixes.js');

let lastId = 0;
function getId() {
  if (lastId > 9999) lastId = 0;
  return '' + lastId++;
}

module.exports = function build(buildFn) {
  const buildId = getId();
  const built = buildFn(root(buildId));
  return strOuter(built, buildId);
}
