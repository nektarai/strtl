const debug = require('./debug')('strtl:toString');

const run = require('./machine.js');
const states = require('./states/index.js');

module.exports = function strtl(template, scopes, helpers) {
  let result = '';

  const heap = {
    tokenStart: 0,
    pos: 0,
    scopes: [...(Array.isArray(scopes) ? scopes : [scopes]), helpers],
    out: (chunk) => {
      debug('output', chunk);
      result += chunk;
    }
  };

  run(states, template, 'txt', heap);

  return result;
};
