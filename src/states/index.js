const classFns = require('../classes.js');

exports.transits = {
  ...require('./num').transits,
  ...require('./str').transits,
  ...require('./tag').transits,
  ...require('./tup').transits,
  ...require('./txt').transits,
  ...require('./var').transits,
};

exports.classes = Object.entries(exports.transits)
  .reduce((classes, [state, transits]) => {
    const fns = Object.keys(transits)
      .filter(char => char.length > 1)
      .map(name => {
        if (!(name in classFns)) {
          throw Error(
            `500 Class ${name} in state ${state} is not defined`
          );
        }
        return classFns[name];
      });

    if (fns.length) classes[state] = (char) => fns.map(fn => fn(char));
    return classes;
  }, {});
